import {
    AlertCircle,
    CheckCircle2,
    CircleDot,
    Loader2,
    Search,
    Square,
    Wrench,
} from "lucide-react";

import type { AIExecutionStatus as ExecutionStatus } from "../types/ai.types";

import "./AIExecutionStatus.css";

type AIExecutionStatusProps = {
    status: ExecutionStatus;
};

type StatusConfig = {
    label: string;
    description: string;
    icon: typeof CircleDot;
    showLoader?: boolean;
};

const statusConfig: Partial<
    Record<ExecutionStatus, StatusConfig>
> = {
    queued: {
        label: "Queued",
        description: "Waiting for the agent to start.",
        icon: CircleDot,
    },

    planning: {
        label: "Planning",
        description: "The agent is planning the best approach.",
        icon: Wrench,
        showLoader: true,
    },

    searching: {
        label: "Searching",
        description: "The agent is searching for relevant information.",
        icon: Search,
        showLoader: true,
    },

    retrieving: {
        label: "Retrieving",
        description: "The agent is retrieving relevant context.",
        icon: Search,
        showLoader: true,
    },

    executing: {
        label: "Executing",
        description: "The agent is executing the planned work.",
        icon: Wrench,
        showLoader: true,
    },

    streaming: {
        label: "Generating",
        description: "The agent is generating the response.",
        icon: Loader2,
        showLoader: true,
    },

    completed: {
        label: "Completed",
        description: "The agent finished successfully.",
        icon: CheckCircle2,
    },

    cancelled: {
        label: "Stopped",
        description: "The agent execution was stopped.",
        icon: Square,
    },

    failed: {
        label: "Failed",
        description: "The agent execution failed.",
        icon: AlertCircle,
    },
};

export function AIExecutionStatus({
    status,
}: AIExecutionStatusProps) {
    const config = statusConfig[status];

    if (!config) {
        return null;
    }

    const Icon = config.icon;

    return (
        <div
            className={`ai-execution-status ai-execution-status--${status}`}
            role="status"
        >
            <div className="ai-execution-status__icon">
                <Icon size={17} />
            </div>

            <div className="ai-execution-status__content">
                <span className="ai-execution-status__label">
                    {config.label}
                </span>

                <span className="ai-execution-status__description">
                    {config.description}
                </span>
            </div>

            {config.showLoader && (
                <Loader2
                    size={15}
                    className="ai-execution-status__loader"
                />
            )}
        </div>
    );
}