import type {
    AIExecutionEvent,
    AIExecutionRequest,
    AIExecutionResponse,
} from "../types/ai.types";

export type AIExecutionEventHandler = (
    event: AIExecutionEvent,
) => void;

export type AIExecutionTransport = {
    execute: (
        request: AIExecutionRequest,
        onEvent: AIExecutionEventHandler,
        signal?: AbortSignal,
    ) => Promise<AIExecutionResponse>;
};

const createAbortError = () =>
    new DOMException(
        "AI execution was cancelled.",
        "AbortError",
    );

const wait = (
    milliseconds: number,
    signal?: AbortSignal,
) =>
    new Promise<void>((resolve, reject) => {
        if (signal?.aborted) {
            reject(createAbortError());
            return;
        }

        const handleAbort = () => {
            window.clearTimeout(timeoutId);
            reject(createAbortError());
        };

        const timeoutId = window.setTimeout(() => {
            signal?.removeEventListener(
                "abort",
                handleAbort,
            );

            resolve();
        }, milliseconds);

        signal?.addEventListener(
            "abort",
            handleAbort,
            { once: true },
        );
    });

export class MockAIExecutionTransport
    implements AIExecutionTransport
{
    async execute(
        request: AIExecutionRequest,
        onEvent: AIExecutionEventHandler,
        signal?: AbortSignal,
    ): Promise<AIExecutionResponse> {
        const requestId =
            request.requestId ?? crypto.randomUUID();

        try {
            onEvent({
                type: "status",
                status: "queued",
            });

            await wait(250, signal);

            onEvent({
                type: "status",
                status: "planning",
            });

            await wait(400, signal);

            if (request.capability === "web") {
                onEvent({
                    type: "status",
                    status: "searching",
                });

                const webSearchId =
                    crypto.randomUUID();

                const retrievalId =
                    crypto.randomUUID();

                onEvent({
                    type: "tool_start",
                    tool: "web_search",
                    toolCallId: webSearchId,
                    input: {
                        query: request.message,
                    },
                });

                onEvent({
                    type: "tool_start",
                    tool: "knowledge_retrieval",
                    toolCallId: retrievalId,
                    input: {
                        query: request.message,
                    },
                });

                await wait(700, signal);

                onEvent({
                    type: "tool_result",
                    tool: "web_search",
                    toolCallId: webSearchId,
                    output: {
                        query: request.message,
                        resultCount: 5,
                        source: "mock-web-search",
                    },
                });

                await wait(300, signal);

                onEvent({
                    type: "tool_result",
                    tool: "knowledge_retrieval",
                    toolCallId: retrievalId,
                    output: {
                        documentsRetrieved: 3,
                        source: "mock-knowledge-base",
                    },
                });
            }

            await wait(250, signal);

            onEvent({
                type: "status",
                status: "executing",
            });

            await wait(350, signal);

            onEvent({
                type: "status",
                status: "streaming",
            });

            const responseText =
                request.capability === "web"
                    ? "I've searched the web and retrieved relevant context. The real agent will combine these tool results into a grounded response."
                    : "I've received your request. The real AI execution pipeline will be connected here next.";

            for (const word of responseText.split(" ")) {
                onEvent({
                    type: "text_delta",
                    delta: `${word} `,
                });

                await wait(25, signal);
            }

            const inputTokens = Math.ceil(
                request.message.length / 4,
            );

            const outputTokens = Math.ceil(
                responseText.length / 4,
            );

            onEvent({
                type: "token_usage",
                input: inputTokens,
                output: outputTokens,
                total:
                    inputTokens +
                    outputTokens,
            });

            await wait(150, signal);

            const messageId =
                crypto.randomUUID();

            onEvent({
                type: "completed",
                messageId,
            });

            return {
                requestId,
                chatId: request.chatId,
                status: "completed",
            };
        } catch (error) {
            if (
                error instanceof DOMException &&
                error.name === "AbortError"
            ) {
                onEvent({
                    type: "cancelled",
                });

                return {
                    requestId,
                    chatId: request.chatId,
                    status: "cancelled",
                };
            }

            throw error;
        }
    }
}