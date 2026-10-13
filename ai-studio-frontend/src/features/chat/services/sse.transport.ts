import type {
    AIExecutionEvent,
    AIExecutionRequest,
    AIExecutionResponse,
} from "../types/ai.types";

import type {
    AIExecutionEventHandler,
    AIExecutionTransport,
} from "./ai.transport";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ?? "/api";

export class SSEAIExecutionTransport
    implements AIExecutionTransport
{
    async execute(
        request: AIExecutionRequest,
        onEvent: AIExecutionEventHandler,
        signal?: AbortSignal,
    ): Promise<AIExecutionResponse> {
        const response = await fetch(
            `${API_BASE_URL}/ai/execute/stream`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "text/event-stream",
                },
                body: JSON.stringify(request),
                signal,
            },
        );

        if (!response.ok) {
            throw new Error(
                `AI execution failed with status ${response.status}`,
            );
        }

        if (!response.body) {
            throw new Error(
                "AI execution stream is unavailable.",
            );
        }

        const reader =
            response.body.getReader();

        const decoder =
            new TextDecoder();

        let buffer = "";

        let executionResponse:
            | AIExecutionResponse
            | null = null;

        try {
            while (true) {
                const { value, done } =
                    await reader.read();

                if (done) {
                    break;
                }

                buffer += decoder.decode(
                    value,
                    { stream: true },
                );

                const events =
                    buffer.split("\n\n");

                buffer =
                    events.pop() ?? "";

                for (const rawEvent of events) {
                    const event =
                        this.parseEvent(rawEvent);

                    if (!event) {
                        continue;
                    }

                    if (
                        event.type === "response"
                    ) {
                        executionResponse =
                            event.data;
                        continue;
                    }

                    onEvent(event.data);
                }
            }

            if (buffer.trim()) {
                const event =
                    this.parseEvent(buffer);

                if (
                    event?.type === "response"
                ) {
                    executionResponse =
                        event.data;
                } else if (event) {
                    onEvent(event.data);
                }
            }
        } finally {
            reader.releaseLock();
        }

        if (!executionResponse) {
            throw new Error(
                "AI execution stream ended without a response.",
            );
        }

        return executionResponse;
    }

    private parseEvent(
        rawEvent: string,
    ):
        | {
              type: "event";
              data: AIExecutionEvent;
          }
        | {
              type: "response";
              data: AIExecutionResponse;
          }
        | null {
        const lines =
            rawEvent.split("\n");

        let eventName = "message";
        let data = "";

        for (const line of lines) {
            if (line.startsWith("event:")) {
                eventName =
                    line
                        .slice(6)
                        .trim();
            }

            if (line.startsWith("data:")) {
                data +=
                    line
                        .slice(5)
                        .trim();
            }
        }

        if (!data) {
            return null;
        }

        try {
            const parsed =
                JSON.parse(data);

            if (
                eventName ===
                "response"
            ) {
                return {
                    type: "response",
                    data: parsed as AIExecutionResponse,
                };
            }

            return {
                type: "event",
                data: parsed as AIExecutionEvent,
            };
        } catch {
            return null;
        }
    }
}