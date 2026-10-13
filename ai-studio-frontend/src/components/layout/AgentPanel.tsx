import {
    Activity,
    BrainCircuit,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Code2,
    Database,
    Globe,
    Loader2,
    MoreHorizontal,
    Search,
    Sparkles,
    Wrench,
    XCircle,
} from "lucide-react";

import { useExecutionStore } from "../../features/chat/store/execution.store";

import type {
    AIExecutionStatus,
    AIToolType,
} from "../../features/chat/types/ai.types";

import type {
    ExecutionRun,
    ExecutionToolCall,
} from "../../features/chat/types/execution.types";

import "./AgentPanel.css";

type AgentStepStatus =
    | "completed"
    | "running"
    | "pending"
    | "failed"
    | "cancelled";

type AgentStep = {
    id: string;
    title: string;
    description: string;
    status: AgentStepStatus;
    icon:
    | "brain"
    | "search"
    | "database"
    | "code"
    | "tool";
};

export function AgentPanel() {
    const runs = useExecutionStore(
        (state) => state.runs,
    );

    const activeRun = getLatestRun(runs);

    const agentStatus =
        activeRun?.aiStatus ?? "idle";

    const steps = activeRun
        ? buildExecutionSteps(activeRun)
        : [];

    const tokenUsage =
        activeRun?.tokenUsage ?? {
            input: 0,
            output: 0,
            total: 0,
        };

    const progress =
        getExecutionProgress(
            agentStatus,
            steps,
        );

    const currentTask =
        getCurrentTask(
            agentStatus,
            activeRun,
        );

    const elapsed =
        activeRun
            ? formatElapsedTime(
                activeRun.startedAt,
                activeRun.completedAt,
            )
            : "00:00";

    return (
        <aside className="agent-panel">
            <header className="agent-panel__header">
                <div className="agent-panel__header-title">
                    <div className="agent-panel__header-icon">
                        <Activity size={17} />
                    </div>

                    <div>
                        <h2>Active Agents</h2>
                        <span>
                            Live execution
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="agent-panel__header-action"
                    aria-label="Agent options"
                >
                    <MoreHorizontal size={18} />
                </button>
            </header>

            <section className="agent-card">
                <div className="agent-card__top">
                    <div className="agent-card__identity">
                        <div className="agent-card__avatar">
                            <Sparkles size={18} />
                        </div>

                        <div className="agent-card__identity-content">
                            <div className="agent-card__name-row">
                                <span className="agent-card__name">
                                    {activeRun
                                        ? "AI Agent"
                                        : "No active agent"}
                                </span>

                                <span
                                    className={`agent-status agent-status--${agentStatus}`}
                                >
                                    <span className="agent-status__dot" />

                                    {getStatusLabel(
                                        agentStatus,
                                    )}
                                </span>
                            </div>

                            <span className="agent-card__description">
                                {activeRun
                                    ? "Executing your request"
                                    : "Waiting for an agent execution"}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="agent-card__collapse"
                        aria-label="Collapse agent"
                    >
                        <ChevronDown size={16} />
                    </button>
                </div>

                <div className="agent-card__task">
                    <div className="agent-card__task-icon">
                        <Search size={15} />
                    </div>

                    <div className="agent-card__task-content">
                        <span className="agent-card__task-label">
                            Current task
                        </span>

                        <span className="agent-card__task-value">
                            {currentTask}
                        </span>
                    </div>
                </div>

                <div className="agent-progress">
                    <div className="agent-progress__header">
                        <span>
                            Progress
                        </span>

                        <span>
                            {progress}%
                        </span>
                    </div>

                    <div className="agent-progress__track">
                        <div
                            className="agent-progress__bar"
                            style={{
                                width: `${progress}%`,
                            }}
                        />
                    </div>
                </div>

                <div className="agent-card__meta">
                    <div>
                        <Clock3 size={14} />

                        <span>
                            {elapsed}
                        </span>
                    </div>

                    <div>
                        <Activity size={14} />

                        <span>
                            {getRunStateLabel(
                                activeRun,
                            )}
                        </span>
                    </div>
                </div>
            </section>

            <section className="agent-section">
                <div className="agent-section__header">
                    <div>
                        <span className="agent-section__title">
                            Execution
                        </span>

                        <span className="agent-section__subtitle">
                            Agent execution pipeline
                        </span>
                    </div>

                    <span className="agent-section__count">
                        {steps.length}
                    </span>
                </div>

                <div className="agent-steps">
                    {steps.length > 0 ? (
                        steps.map(
                            (
                                step,
                                index,
                            ) => (
                                <AgentStep
                                    key={
                                        step.id
                                    }
                                    step={
                                        step
                                    }
                                    isLast={
                                        index ===
                                        steps.length -
                                        1
                                    }
                                />
                            ),
                        )
                    ) : (
                        <div className="agent-panel__empty">
                            Start a message to
                            see the agent
                            execution here.
                        </div>
                    )}
                </div>
            </section>

            <section className="agent-usage">
                <div className="agent-usage__header">
                    <div>
                        <span className="agent-usage__title">
                            Token Usage
                        </span>

                        <span className="agent-usage__subtitle">
                            Current agent execution
                        </span>
                    </div>

                    <span className="agent-usage__total">
                        {tokenUsage.total.toLocaleString()}
                    </span>
                </div>

                <div className="agent-usage__stats">
                    <UsageStat
                        label="Input"
                        value={
                            tokenUsage.input
                        }
                    />

                    <UsageStat
                        label="Output"
                        value={
                            tokenUsage.output
                        }
                    />
                </div>

                <div className="agent-usage__context">
                    <div className="agent-usage__context-header">
                        <span>
                            Tool calls
                        </span>

                        <span>
                            {
                                activeRun
                                    ?.toolCalls
                                    .length ??
                                0
                            }
                        </span>
                    </div>

                    <div className="agent-usage__track">
                        <div
                            className="agent-usage__bar"
                            style={{
                                width: `${getToolProgress(
                                    activeRun,
                                )}%`,
                            }}
                        />
                    </div>
                </div>
            </section>
        </aside>
    );
}

type AgentStepProps = {
    step: AgentStep;
    isLast: boolean;
};

function AgentStep({
    step,
    isLast,
}: AgentStepProps) {
    return (
        <div
            className={`agent-step agent-step--${step.status}`}
        >
            <div className="agent-step__timeline">
                <div className="agent-step__icon">
                    {getStepIcon(step)}
                </div>

                {!isLast && (
                    <div className="agent-step__line" />
                )}
            </div>

            <div className="agent-step__content">
                <span className="agent-step__title">
                    {step.title}
                </span>

                <span className="agent-step__description">
                    {step.description}
                </span>
            </div>

            <div className="agent-step__status">
                {getStepStatusIcon(
                    step.status,
                )}
            </div>
        </div>
    );
}

type UsageStatProps = {
    label: string;
    value: number;
};

function UsageStat({
    label,
    value,
}: UsageStatProps) {
    return (
        <div className="agent-usage__stat">
            <span>{label}</span>

            <strong>
                {value.toLocaleString()}
            </strong>
        </div>
    );
}

function getLatestRun(
    runs: Record<string, ExecutionRun>,
) {
    return Object.values(runs).sort(
        (a, b) =>
            new Date(
                b.startedAt,
            ).getTime() -
            new Date(
                a.startedAt,
            ).getTime(),
    )[0];
}

function getStatusLabel(
    status: AIExecutionStatus,
) {
    switch (status) {
        case "queued":
            return "Queued";

        case "planning":
            return "Planning";

        case "searching":
            return "Searching";

        case "retrieving":
            return "Retrieving";

        case "executing":
            return "Executing";

        case "streaming":
            return "Streaming";

        case "completed":
            return "Completed";

        case "cancelled":
            return "Stopped";

        case "failed":
            return "Failed";

        default:
            return "Idle";
    }
}

function getRunStateLabel(
    run?: ExecutionRun,
) {
    if (!run) {
        return "Idle";
    }

    switch (run.status) {
        case "queued":
            return "Queued";

        case "running":
            return "Running";

        case "completed":
            return "Completed";

        case "cancelled":
            return "Stopped";

        case "failed":
            return "Failed";

        default:
            return "Idle";
    }
}

function getCurrentTask(
    status: AIExecutionStatus,
    run?: ExecutionRun,
) {
    if (!run) {
        return "Waiting for a new request";
    }

    switch (status) {
        case "queued":
            return "Waiting for execution";

        case "planning":
            return "Planning how to complete the request";

        case "searching":
            return getToolTask(
                run.toolCalls,
                "Searching external sources",
            );

        case "retrieving":
            return getToolTask(
                run.toolCalls,
                "Retrieving relevant knowledge",
            );

        case "executing":
            return "Executing the planned actions";

        case "streaming":
            return "Generating the final response";

        case "completed":
            return "Request completed successfully";

        case "cancelled":
            return "Execution stopped by user";

        case "failed":
            return "Execution failed";

        default:
            return "Waiting for execution";
    }
}

function getToolTask(
    toolCalls: ExecutionToolCall[],
    fallback: string,
) {
    const runningTool =
        toolCalls.find(
            (tool) =>
                tool.status === "running",
        );

    if (!runningTool) {
        return fallback;
    }

    return getToolLabel(
        runningTool.tool,
    );
}

function getToolLabel(
    tool: AIToolType,
) {
    switch (tool) {
        case "web_search":
            return "Searching the web";

        case "knowledge_retrieval":
            return "Retrieving knowledge";

        case "code_execution":
            return "Executing code";

        case "image_generation":
            return "Generating image";

        case "video_generation":
            return "Generating video";

        case "file_analysis":
            return "Analyzing files";

        default:
            return "Executing tool";
    }
}

function getExecutionProgress(
    status: AIExecutionStatus,
    steps: AgentStep[],
) {
    if (
        status === "completed"
    ) {
        return 100;
    }

    if (
        status === "cancelled" ||
        status === "failed"
    ) {
        return Math.max(
            0,
            getCompletedStepCount(
                steps,
            ) * 20,
        );
    }

    const completed =
        getCompletedStepCount(
            steps,
        );

    const running =
        steps.some(
            (step) =>
                step.status ===
                "running",
        );

    return Math.min(
        95,
        completed * 20 +
        (running ? 10 : 0),
    );
}

function getCompletedStepCount(
    steps: AgentStep[],
) {
    return steps.filter(
        (step) =>
            step.status ===
            "completed",
    ).length;
}

function getToolProgress(
    run?: ExecutionRun,
) {
    if (!run) {
        return 0;
    }

    const total =
        run.toolCalls.length;

    if (total === 0) {
        return 0;
    }

    const completed =
        run.toolCalls.filter(
            (tool) =>
                tool.status ===
                "completed" ||
                tool.status ===
                "cancelled",
        ).length;

    return Math.round(
        (completed / total) * 100,
    );
}

function buildExecutionSteps(
    run: ExecutionRun,
): AgentStep[] {
    const status =
        run.aiStatus;

    const planningComplete =
        status !== "queued" &&
        status !== "planning";

    const hasSearch =
        run.toolCalls.some(
            (tool) =>
                tool.tool ===
                "web_search",
        );

    const hasRetrieval =
        run.toolCalls.some(
            (tool) =>
                tool.tool ===
                "knowledge_retrieval",
        );

    const toolsComplete =
        run.toolCalls.length > 0 &&
        run.toolCalls.every(
            (tool) =>
                tool.status ===
                "completed" ||
                tool.status ===
                "cancelled",
        );

    const responseStarted =
        status === "streaming" ||
        status === "completed";

    return [
        {
            id: `${run.id}-planning`,
            title: "Plan request",
            description:
                "Understanding the request and deciding what to do",
            status:
                planningComplete
                    ? "completed"
                    : status ===
                        "planning"
                        ? "running"
                        : "pending",
            icon: "brain",
        },

        {
            id: `${run.id}-search`,
            title: "Search sources",
            description:
                "Finding relevant external information",
            status:
                hasSearch
                    ? getToolStepStatus(
                        run,
                        "web_search",
                    )
                    : status ===
                        "searching"
                        ? "running"
                        : status ===
                            "queued" ||
                            status ===
                            "planning"
                            ? "pending"
                            : "completed",
            icon: "search",
        },

        {
            id: `${run.id}-retrieval`,
            title: "Retrieve knowledge",
            description:
                "Loading relevant context",
            status:
                hasRetrieval
                    ? getToolStepStatus(
                        run,
                        "knowledge_retrieval",
                    )
                    : status ===
                        "retrieving"
                        ? "running"
                        : hasSearch &&
                            toolsComplete
                            ? "completed"
                            : "pending",
            icon: "database",
        },

        {
            id: `${run.id}-execute`,
            title: "Execute",
            description:
                "Running the planned actions",
            status:
                status === "executing" ||
                    status === "streaming"
                    ? "running"
                    : responseStarted
                        ? "completed"
                        : "pending",
            icon: "tool",
        },

        {
            id: `${run.id}-response`,
            title: "Generate response",
            description:
                "Preparing the final answer",
            status:
                status ===
                    "streaming"
                    ? "running"
                    : status ===
                        "completed"
                        ? "completed"
                        : status ===
                            "cancelled"
                            ? "cancelled"
                            : status ===
                                "failed"
                                ? "failed"
                                : "pending",
            icon: "code",
        },
    ];
}

function getToolStepStatus(
    run: ExecutionRun,
    toolType: AIToolType,
): AgentStepStatus {
    const calls =
        run.toolCalls.filter(
            (tool) =>
                tool.tool ===
                toolType,
        );

    if (
        calls.some(
            (tool) =>
                tool.status ===
                "running",
        )
    ) {
        return "running";
    }

    if (
        calls.some(
            (tool) =>
                tool.status ===
                "failed",
        )
    ) {
        return "failed";
    }

    if (
        calls.some(
            (tool) =>
                tool.status ===
                "cancelled",
        )
    ) {
        return "cancelled";
    }

    if (
        calls.length > 0 &&
        calls.every(
            (tool) =>
                tool.status ===
                "completed",
        )
    ) {
        return "completed";
    }

    return "pending";
}

function getStepIcon(
    step: AgentStep,
) {
    switch (step.icon) {
        case "brain":
            return (
                <BrainCircuit
                    size={15}
                />
            );

        case "search":
            return (
                <Globe size={15} />
            );

        case "database":
            return (
                <Database
                    size={15}
                />
            );

        case "code":
            return (
                <Code2 size={15} />
            );

        case "tool":
            return (
                <Wrench size={15} />
            );

        default:
            return (
                <Activity
                    size={15}
                />
            );
    }
}

function getStepStatusIcon(
    status: AgentStepStatus,
) {
    switch (status) {
        case "completed":
            return (
                <CheckCircle2
                    size={15}
                    strokeWidth={2}
                />
            );

        case "running":
            return (
                <Loader2
                    className="agent-step__spinner"
                    size={15}
                />
            );

        case "failed":
            return (
                <XCircle
                    size={15}
                    strokeWidth={2}
                />
            );

        case "cancelled":
            return (
                <XCircle
                    size={15}
                    strokeWidth={2}
                />
            );

        default:
            return (
                <span className="agent-step__pending-dot" />
            );
    }
}

function formatElapsedTime(
    startedAt: string,
    completedAt:
        | string
        | null,
) {
    const start =
        new Date(
            startedAt,
        ).getTime();

    const end = completedAt
        ? new Date(
            completedAt,
        ).getTime()
        : Date.now();

    const seconds = Math.max(
        0,
        Math.floor(
            (end - start) / 1000,
        ),
    );

    const minutes =
        Math.floor(seconds / 60);

    const remaining =
        seconds % 60;

    return `${String(
        minutes,
    ).padStart(2, "0")}:${String(
        remaining,
    ).padStart(2, "0")}`;
}