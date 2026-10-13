import type {
    AgentExecutionRequest,
    AgentExecutionResponse,
} from "../types/agent.types";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "/api";

export const agentApi = {
    execute: (
        request: AgentExecutionRequest,
    ) => {
        return fetch(
            `${API_BASE_URL}/agent/execute`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify(request),
            },
        );
    },

    cancel: (
        runId: string,
    ) => {
        return fetch(
            `${API_BASE_URL}/agent/runs/${runId}/cancel`,
            {
                method: "POST",
            },
        );
    },

    getRun: (
        runId: string,
    ) => {
        return fetch(
            `${API_BASE_URL}/agent/runs/${runId}`,
            {
                method: "GET",
            },
        );
    },

    getRunResponse: async (
        response: Response,
    ): Promise<AgentExecutionResponse> => {
        if (!response.ok) {
            throw new Error(
                `Agent request failed with status ${response.status}`,
            );
        }

        return response.json() as Promise<AgentExecutionResponse>;
    },
};