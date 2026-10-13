import { ApiError } from "./api-error";
import type { ApiErrorPayload } from "./api-error";
import { tokenStorage } from "./token-storage";

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ??
    "http://localhost:3000/api/v1"
).replace(/\/+$/, "");

type RequestOptions = Omit<
    RequestInit,
    "body"
> & {
    body?: unknown;
    auth?: boolean;
    retryOnUnauthorized?: boolean;
};

type RefreshResponse = {
    accessToken: string;
    refreshToken: string;
    expiresIn?: number;
};

let refreshPromise: Promise<boolean> | null = null;

async function readJson<T>(
    response: Response,
): Promise<T> {
    if (response.status === 204) {
        return undefined as T;
    }

    const text = await response.text();

    if (!text) {
        return undefined as T;
    }

    try {
        return JSON.parse(text) as T;
    } catch {
        throw new Error(
            "The server returned an invalid JSON response.",
        );
    }
}

async function parseApiError(
    response: Response,
): Promise<ApiError> {
    let payload: ApiErrorPayload = {};

    try {
        payload =
            await response.json() as ApiErrorPayload;
    } catch {
        // Preserve the HTTP status if the body isn't JSON.
    }

    return new ApiError(
        response.status,
        payload,
    );
}

async function refreshAccessToken(): Promise<boolean> {
    const refreshToken =
        tokenStorage.getRefreshToken();

    if (!refreshToken) {
        tokenStorage.clear();
        return false;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/auth/refresh`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    refreshToken,
                }),
            },
        );

        if (!response.ok) {
            tokenStorage.clear();
            return false;
        }

        const result =
            await readJson<RefreshResponse>(response);

        if (
            !result?.accessToken ||
            !result?.refreshToken
        ) {
            tokenStorage.clear();
            return false;
        }

        tokenStorage.setTokens(
            result.accessToken,
            result.refreshToken,
        );

        return true;
    } catch {
        tokenStorage.clear();
        return false;
    }
}

class ApiClient {
    private async refreshOnce(): Promise<boolean> {
        if (!refreshPromise) {
            refreshPromise =
                refreshAccessToken().finally(() => {
                    refreshPromise = null;
                });
        }

        return refreshPromise;
    }

    async request<T>(
        path: string,
        options: RequestOptions = {},
    ): Promise<T> {
        const {
            body,
            auth = true,
            retryOnUnauthorized = true,
            headers: suppliedHeaders,
            ...fetchOptions
        } = options;

        const headers = new Headers(
            suppliedHeaders,
        );

        if (
            body !== undefined &&
            !(body instanceof FormData) &&
            !headers.has("Content-Type")
        ) {
            headers.set(
                "Content-Type",
                "application/json",
            );
        }

        headers.set("Accept", "application/json");

        if (auth) {
            const accessToken =
                tokenStorage.getAccessToken();

            if (accessToken) {
                headers.set(
                    "Authorization",
                    `Bearer ${accessToken}`,
                );
            }
        }

        const response = await fetch(
            `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`,
            {
                ...fetchOptions,
                headers,
                body:
                    body === undefined
                        ? undefined
                        : body instanceof FormData
                            ? body
                            : JSON.stringify(body),
            },
        );

        if (
            response.status === 401 &&
            auth &&
            retryOnUnauthorized &&
            !path.startsWith("/auth/")
        ) {
            const refreshed =
                await this.refreshOnce();

            if (refreshed) {
                return this.request<T>(
                    path,
                    {
                        ...options,
                        retryOnUnauthorized: false,
                    },
                );
            }

            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new Event("lifeos:session-expired"),
                );
            }
        }

        if (!response.ok) {
            throw await parseApiError(response);
        }

        return readJson<T>(response);
    }

    get<T>(
        path: string,
        options?: Omit<RequestOptions, "method" | "body">,
    ): Promise<T> {
        return this.request<T>(path, {
            ...options,
            method: "GET",
        });
    }

    post<T>(
        path: string,
        body?: unknown,
        options?: Omit<RequestOptions, "method" | "body">,
    ): Promise<T> {
        return this.request<T>(path, {
            ...options,
            method: "POST",
            body,
        });
    }

    patch<T>(
        path: string,
        body?: unknown,
        options?: Omit<RequestOptions, "method" | "body">,
    ): Promise<T> {
        return this.request<T>(path, {
            ...options,
            method: "PATCH",
            body,
        });
    }

    delete<T>(
        path: string,
        options?: Omit<RequestOptions, "method" | "body">,
    ): Promise<T> {
        return this.request<T>(path, {
            ...options,
            method: "DELETE",
        });
    }
}

export const apiClient = new ApiClient();