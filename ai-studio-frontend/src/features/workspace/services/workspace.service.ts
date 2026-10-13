import type {
  WorkspaceCapability,
} from "../types/workspace.types";

export type WorkspaceAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
};

export type WorkspaceRequest = {
  message: string;
  capability: WorkspaceCapability | null;
  attachments: WorkspaceAttachment[];
};

export type WorkspaceRequestResponse = {
  requestId: string;
  chatId: string;
  status:
    | "accepted"
    | "processing"
    | "completed"
    | "failed";

  request: WorkspaceRequest;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "/api";

const USE_MOCK_API = true;

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });

class WorkspaceService {
  async submitRequest(
    request: WorkspaceRequest,
  ): Promise<WorkspaceRequestResponse> {
    if (USE_MOCK_API) {
      return this.submitMockRequest(request);
    }

    const response = await fetch(
      `${API_BASE_URL}/workspace/requests`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(request),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Workspace request failed with status ${response.status}`,
      );
    }

    return response.json() as Promise<WorkspaceRequestResponse>;
  }

  private async submitMockRequest(
    request: WorkspaceRequest,
  ): Promise<WorkspaceRequestResponse> {
    await wait(700);

    console.info(
      "[Workspace Mock Request]",
      request,
    );

    return {
      requestId: crypto.randomUUID(),
      chatId: crypto.randomUUID(),
      status: "accepted",
      request,
    };
  }
}

export const workspaceService =
  new WorkspaceService();