export type ApiErrorPayload = {
    statusCode?: number;
    code?: string;
    message?: string | string[];
    timestamp?: string;
    path?: string;
    requestId?: string;
    error?: string;
};

export class ApiError extends Error {
    readonly status: number;
    readonly code?: string;
    readonly details?: string[];
    readonly requestId?: string;

    constructor(
        status: number,
        payload: ApiErrorPayload,
    ) {
        const message = Array.isArray(payload.message)
            ? payload.message.join(", ")
            : payload.message ??
              payload.error ??
              "An unexpected API error occurred.";

        super(message);

        this.name = "ApiError";
        this.status = status;
        this.code = payload.code;
        this.details = Array.isArray(payload.message)
            ? payload.message
            : undefined;
        this.requestId = payload.requestId;
    }

    get isUnauthorized(): boolean {
        return this.status === 401;
    }

    get isForbidden(): boolean {
        return this.status === 403;
    }

    get isNotFound(): boolean {
        return this.status === 404;
    }

    get isConflict(): boolean {
        return this.status === 409;
    }

    get isRateLimited(): boolean {
        return this.status === 429;
    }
}