import type {
    // AIExecutionEvent,
    AIExecutionRequest,
    AIExecutionResponse,
} from "../types/ai.types";

import {
    MockAIExecutionTransport,
    type AIExecutionEventHandler,
    type AIExecutionTransport,
} from "./ai.transport";

import { SSEAIExecutionTransport } from "./sse.transport";

const USE_MOCK_API =
    import.meta.env.VITE_USE_MOCK_AI !== "false";

class AIService {
    private readonly transport: AIExecutionTransport;

    constructor() {
        this.transport =
            USE_MOCK_API
                ? new MockAIExecutionTransport()
                : new SSEAIExecutionTransport();
    }

    async execute(
        request: AIExecutionRequest,
        onEvent: AIExecutionEventHandler,
        signal?: AbortSignal,
    ): Promise<AIExecutionResponse> {
        return this.transport.execute(
            request,
            onEvent,
            signal,
        );
    }
}

export const aiService =
    new AIService();