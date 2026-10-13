import {
    Activity,
    Coins,
    Wrench,
} from "lucide-react";

import type { AIToolType } from "../types/ai.types";

import "./AIExecutionMetrics.css";

type TokenUsage = {
    input: number;
    output: number;
    total: number;
};

type AIExecutionMetricsProps = {
    tokenUsage: TokenUsage | null;
    toolEvents: {
        type: "start" | "result";
        tool: AIToolType;
        toolCallId: string;
    }[];
};

export function AIExecutionMetrics({
    tokenUsage,
    toolEvents,
}: AIExecutionMetricsProps) {
    const toolCallCount =
        new Set(
            toolEvents.map(
                (event) => event.toolCallId,
            ),
        ).size;

    if (
        !tokenUsage &&
        toolCallCount === 0
    ) {
        return null;
    }

    return (
        <div className="ai-execution-metrics">
            <div className="ai-execution-metrics__item">
                <Coins size={14} />

                <span className="ai-execution-metrics__label">
                    Tokens
                </span>

                <span className="ai-execution-metrics__value">
                    {tokenUsage
                        ? formatNumber(
                            tokenUsage.total,
                        )
                        : "—"}
                </span>
            </div>

            <div className="ai-execution-metrics__divider" />

            <div className="ai-execution-metrics__item">
                <Activity size={14} />

                <span className="ai-execution-metrics__label">
                    Input
                </span>

                <span className="ai-execution-metrics__value">
                    {tokenUsage
                        ? formatNumber(
                            tokenUsage.input,
                        )
                        : "—"}
                </span>
            </div>

            <div className="ai-execution-metrics__divider" />

            <div className="ai-execution-metrics__item">
                <Activity size={14} />

                <span className="ai-execution-metrics__label">
                    Output
                </span>

                <span className="ai-execution-metrics__value">
                    {tokenUsage
                        ? formatNumber(
                            tokenUsage.output,
                        )
                        : "—"}
                </span>
            </div>

            <div className="ai-execution-metrics__divider" />

            <div className="ai-execution-metrics__item">
                <Wrench size={14} />

                <span className="ai-execution-metrics__label">
                    Tools
                </span>

                <span className="ai-execution-metrics__value">
                    {toolCallCount}
                </span>
            </div>
        </div>
    );
}

function formatNumber(
    value: number,
) {
    return new Intl.NumberFormat(
        "en-US",
    ).format(value);
}