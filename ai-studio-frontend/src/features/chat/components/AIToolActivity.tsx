import {
    CheckCircle2,
    Code2,
    Database,
    FileSearch,
    Image,
    LoaderCircle,
    Search,
    Video,
    Wrench,
} from "lucide-react";

import type { AIToolType } from "../types/ai.types";

import "./AIToolActivity.css";

type ToolEvent = {
    type: "start" | "result";
    tool: AIToolType;
    toolCallId: string;
    input?: unknown;
    output?: unknown;
};

type ToolExecution = {
    tool: AIToolType;
    toolCallId: string;
    status: "running" | "completed";
    input?: unknown;
    output?: unknown;
};

type AIToolActivityProps = {
    events: ToolEvent[];
};

export function AIToolActivity({
    events,
}: AIToolActivityProps) {
    const executions =
        buildToolExecutions(events);

    if (executions.length === 0) {
        return null;
    }

    return (
        <div className="ai-tool-activity">
            <div className="ai-tool-activity__header">
                <Wrench size={14} />

                <span>Agent activity</span>
            </div>

            <div className="ai-tool-activity__list">
                {executions.map(
                    (execution) => (
                        <div
                            key={execution.toolCallId}
                            className="ai-tool-activity__item"
                        >
                            <div className="ai-tool-activity__icon">
                                {getToolIcon(
                                    execution.tool,
                                )}
                            </div>

                            <div className="ai-tool-activity__content">
                                <span className="ai-tool-activity__name">
                                    {getToolLabel(
                                        execution.tool,
                                    )}
                                </span>

                                <span className="ai-tool-activity__description">
                                    {getToolDescription(
                                        execution,
                                    )}
                                </span>
                            </div>

                            <div
                                className={`ai-tool-activity__status ${execution.status ===
                                        "completed"
                                        ? "ai-tool-activity__status--completed"
                                        : ""
                                    }`}
                            >
                                {execution.status ===
                                    "completed" ? (
                                    <CheckCircle2
                                        size={14}
                                    />
                                ) : (
                                    <LoaderCircle
                                        className="ai-tool-activity__spinner"
                                        size={14}
                                    />
                                )}
                            </div>
                        </div>
                    ),
                )}
            </div>
        </div>
    );
}

function buildToolExecutions(
    events: ToolEvent[],
): ToolExecution[] {
    const executions =
        new Map<
            string,
            ToolExecution
        >();

    for (const event of events) {
        const existing =
            executions.get(
                event.toolCallId,
            );

        if (event.type === "start") {
            executions.set(
                event.toolCallId,
                {
                    tool: event.tool,
                    toolCallId:
                        event.toolCallId,
                    status: "running",
                    input: event.input,
                },
            );

            continue;
        }

        if (event.type === "result") {
            executions.set(
                event.toolCallId,
                {
                    tool:
                        existing?.tool ??
                        event.tool,
                    toolCallId:
                        event.toolCallId,
                    status: "completed",
                    input:
                        existing?.input,
                    output: event.output,
                },
            );
        }
    }

    return Array.from(
        executions.values(),
    );
}

function getToolLabel(
    tool: AIToolType,
) {
    switch (tool) {
        case "web_search":
            return "Web Search";

        case "knowledge_retrieval":
            return "Knowledge Retrieval";

        case "code_execution":
            return "Code Execution";

        case "image_generation":
            return "Image Generation";

        case "video_generation":
            return "Video Generation";

        case "file_analysis":
            return "File Analysis";

        default:
            return "Tool";
    }
}

function getToolDescription(
    execution: ToolExecution,
) {
    if (
        execution.status ===
        "completed"
    ) {
        return "Completed";
    }

    switch (execution.tool) {
        case "web_search":
            return "Searching the web";

        case "knowledge_retrieval":
            return "Retrieving relevant context";

        case "code_execution":
            return "Running code";

        case "image_generation":
            return "Generating image";

        case "video_generation":
            return "Generating video";

        case "file_analysis":
            return "Analyzing file";

        default:
            return "Running tool";
    }
}

function getToolIcon(
    tool: AIToolType,
) {
    switch (tool) {
        case "web_search":
            return <Search size={15} />;

        case "knowledge_retrieval":
            return <Database size={15} />;

        case "code_execution":
            return <Code2 size={15} />;

        case "image_generation":
            return <Image size={15} />;

        case "video_generation":
            return <Video size={15} />;

        case "file_analysis":
            return <FileSearch size={15} />;

        default:
            return <Wrench size={15} />;
    }
}