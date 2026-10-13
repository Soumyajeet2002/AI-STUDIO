
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import { AIToolActivity } from "../components/AIToolActivity";
import { AIExecutionMetrics } from "../components/AIExecutionMetrics";
import { AIExecutionStatus } from "../components/AIExecutionStatus";
import { ChatComposer } from "../components/ChatComposer";
import { ChatHeader } from "../components/ChatHeader";
import { ChatMessage } from "../components/ChatMessage";

import { useAIExecution } from "../hooks/useAIExecution";
import { useChatStore } from "../store/chat.store";
import { useWorkspaceStore } from "../../workspace/store/workspace.store";

import type {
    ChatMessage as ApiChatMessage,
    WorkspaceMessage,
} from "../types/chat.types";

import type {
    WorkspaceCapabilityType,
} from "../../workspace/types/workspace.types";

import "./ChatWorkspace.css";

function toWorkspaceMessage(
    message: ApiChatMessage,
): WorkspaceMessage {
    return {
        id: message.id,
        role: message.role,
        content: message.content,
        status: message.status ?? "completed",
        metadata: {
            createdAt: message.createdAt,
        },
    };
}

function toApiChatTitle(message: string): string {
    return message.trim().slice(0, 48) || "New conversation";
}

function createRequestId(): string {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ChatWorkspace() {
    const { chatId } = useParams<{ chatId: string }>();
    const navigate = useNavigate();

    /*
     * BACKEND CHAT STORE
     */

    const chats = useChatStore((state) => state.chats);

    const messagesByChatId = useChatStore(
        (state) => state.messagesByChatId,
    );

    const isLoadingChats = useChatStore(
        (state) => state.isLoadingChats,
    );

    const isLoadingMessages = useChatStore(
        (state) => state.isLoadingMessages,
    );

    const isSendingMessage = useChatStore(
        (state) => state.isSendingMessage,
    );

    const chatError = useChatStore(
        (state) => state.error,
    );

    const fetchChats = useChatStore(
        (state) => state.fetchChats,
    );

    const createChat = useChatStore(
        (state) => state.createChat,
    );

    const fetchMessages = useChatStore(
        (state) => state.fetchMessages,
    );

    const sendMessage = useChatStore(
        (state) => state.sendMessage,
    );

    const clearError = useChatStore(
        (state) => state.clearError,
    );

    const chat = useMemo(
        () => chats.find((item) => item.id === chatId),
        [chats, chatId],
    );

    const apiMessages = useMemo(
        () => (
            chatId
                ? messagesByChatId[chatId] ?? []
                : []
        ),
        [messagesByChatId, chatId],
    );

    /*
     * WORKSPACE STORE
     */

    const pendingRequest = useWorkspaceStore((state) =>
        chatId
            ? state.getPendingRequest(chatId)
            : undefined,
    );

    const clearPendingRequest = useWorkspaceStore(
        (state) => state.clearPendingRequest,
    );

    /*
     * LOCAL DISPLAY STATE
     */

    const [streamedMessages, setStreamedMessages] =
        useState<WorkspaceMessage[]>([]);

    const [activeCapability, setActiveCapability] =
        useState<WorkspaceCapabilityType | null>(null);

    const [activeRequestId, setActiveRequestId] =
        useState<string | null>(null);

    const [workspaceError, setWorkspaceError] =
        useState<string | null>(null);

    const processedRequestIdsRef = useRef<Set<string>>(
        new Set(),
    );

    const createdPendingRequestsRef = useRef<Set<string>>(
        new Set(),
    );

    const executionChatIdRef = useRef<string | null>(null);

    /*
     * SCROLL
     */

    const messagesContainerRef =
        useRef<HTMLDivElement | null>(null);

    const shouldAutoScrollRef = useRef(true);

    const scrollFrameRef = useRef<number | null>(null);

    /*
     * AI EXECUTION
     */

    const {
        execute,
        stop,
        reset,
        runId,
        status: executionStatus,
        streamingText,
        toolEvents,
        tokenUsage,
        error: executionError,
        isExecuting,
    } = useAIExecution();

    const activeAssistantId = useMemo(
        () => runId ? `assistant-${runId}` : null,
        [runId],
    );

    /*
     * LOAD CHATS
     */

    useEffect(() => {
        void fetchChats().catch(() => {
            // The chat store exposes the error.
        });
    }, [fetchChats]);

    /*
     * LOAD CHAT HISTORY
     */

    useEffect(() => {
        if (!chatId || !chat) {
            return;
        }

        void fetchMessages(chatId).catch(() => {
            // The chat store exposes the error.
        });
    }, [chatId, chat, fetchMessages]);

    /*
     * RESET CHAT-SPECIFIC DISPLAY STATE
     */

    useEffect(() => {
        setStreamedMessages([]);
        setActiveCapability(null);
        setActiveRequestId(null);
        setWorkspaceError(null);

        shouldAutoScrollRef.current = true;
    }, [chatId]);

    /*
     * MERGE PERSISTED AND STREAMING MESSAGES
     */

    const messages = useMemo<WorkspaceMessage[]>(() => {
        const persisted = apiMessages.map(toWorkspaceMessage);

        const persistedIds = new Set(
            persisted.map((message) => message.id),
        );

        const streamed = streamedMessages.filter(
            (message) => !persistedIds.has(message.id),
        );

        return [...persisted, ...streamed];
    }, [apiMessages, streamedMessages]);

    /*
     * RESTORE CAPABILITY WHEN AVAILABLE
     *
     * The API message type currently does not persist
     * capability metadata. This works for messages that
     * already have that metadata in the workspace model.
     */

    useEffect(() => {
        const latestUserMessage = [...messages]
            .reverse()
            .find((message) => message.role === "user");

        const capability = (
            latestUserMessage?.metadata as
                | (WorkspaceMessage["metadata"] & {
                    capability?: WorkspaceCapabilityType;
                })
                | undefined
        )?.capability;

        if (
            capability === "image" ||
            capability === "video" ||
            capability === "content" ||
            capability === "web"
        ) {
            setActiveCapability(capability);
        }
    }, [messages]);

    /*
     * CREATE A BACKEND CHAT FOR A PENDING REQUEST
     */

    useEffect(() => {
        if (!chatId || !pendingRequest || chat) {
            return;
        }

        const requestId = pendingRequest.requestId;

        if (
            createdPendingRequestsRef.current.has(requestId)
        ) {
            return;
        }

        createdPendingRequestsRef.current.add(requestId);

        let cancelled = false;

        const createPendingChat = async () => {
            try {
                const createdChat = await createChat({
                    title: toApiChatTitle(
                        pendingRequest.request.message,
                    ),
                });

                if (cancelled) {
                    return;
                }

                navigate(
                    `/chat/${createdChat.id}`,
                    { replace: true },
                );
            } catch {
                createdPendingRequestsRef.current.delete(requestId);

                if (!cancelled) {
                    setWorkspaceError(
                        "Could not create this chat. Please try again.",
                    );
                }
            }
        };

        void createPendingChat();

        return () => {
            cancelled = true;
        };
    }, [
        chatId,
        pendingRequest,
        chat,
        createChat,
        navigate,
    ]);

    /*
     * PROCESS THE PENDING REQUEST
     *
     * Persist the user message first, then start the
     * agent execution separately.
     */

    useEffect(() => {
        if (!chatId || !chat || !pendingRequest) {
            return;
        }

        const requestId = pendingRequest.requestId;

        if (processedRequestIdsRef.current.has(requestId)) {
            return;
        }

        processedRequestIdsRef.current.add(requestId);

        const message = pendingRequest.request.message.trim();

        const capability =
            pendingRequest.request.capability?.type ?? null;

        if (!message) {
            setWorkspaceError("Message cannot be empty.");
            clearPendingRequest(chatId);
            return;
        }

        let cancelled = false;

        const processPendingRequest = async () => {
            try {
                setWorkspaceError(null);
                setActiveCapability(capability);
                setActiveRequestId(requestId);

                shouldAutoScrollRef.current = true;

                await sendMessage(chatId, message);

                if (cancelled) {
                    return;
                }

                clearPendingRequest(chatId);

                executionChatIdRef.current = chatId;

                await execute({
                    chatId,
                    message,
                    capability,
                    attachments:
                        pendingRequest.request.attachments.map(
                            (attachment) => attachment.id,
                        ),
                    requestId,
                });
            } catch {
                processedRequestIdsRef.current.delete(requestId);

                if (!cancelled) {
                    setWorkspaceError(
                        "Could not send your message or start the agent. Please try again.",
                    );
                }
            }
        };

        void processPendingRequest();

        return () => {
            cancelled = true;
        };
    }, [
        chatId,
        chat,
        pendingRequest,
        sendMessage,
        execute,
        clearPendingRequest,
    ]);

    /*
     * UPDATE THE STREAMING ASSISTANT MESSAGE
     */

    useEffect(() => {
        if (
            !chatId ||
            executionChatIdRef.current !== chatId ||
            !activeAssistantId ||
            !runId
        ) {
            return;
        }

        const messageStatus =
            executionStatus === "cancelled"
                ? "cancelled"
                : executionStatus === "failed"
                    ? "failed"
                    : executionStatus === "completed"
                        ? "completed"
                        : "streaming";

        const assistantMessage: WorkspaceMessage = {
            id: activeAssistantId,
            role: "assistant",
            content: streamingText,
            status: messageStatus,
            metadata: {
                requestId: activeRequestId ?? undefined,
                executionId: runId,
                executionStatus:
                    executionStatus === "idle"
                        ? "queued"
                        : executionStatus,
                createdAt: new Date().toISOString(),
                capability:
                    activeCapability === "image" ||
                        activeCapability === "video" ||
                        activeCapability === "content" ||
                        activeCapability === "web"
                        ? activeCapability
                        : null,
            },
        };

        setStreamedMessages((current) => {
            const existingIndex = current.findIndex(
                (message) => message.id === activeAssistantId,
            );

            if (existingIndex === -1) {
                return [...current, assistantMessage];
            }

            return current.map((message) =>
                message.id === activeAssistantId
                    ? assistantMessage
                    : message,
            );
        });
    }, [
        chatId,
        activeAssistantId,
        runId,
        streamingText,
        executionStatus,
        activeRequestId,
        activeCapability,
    ]);

    /*
     * FINAL EXECUTION STATE
     */

    useEffect(() => {
        if (
            !chatId ||
            executionChatIdRef.current !== chatId ||
            !activeAssistantId ||
            !runId ||
            ![
                "completed",
                "cancelled",
                "failed",
            ].includes(executionStatus)
        ) {
            return;
        }

        const finalStatus =
            executionStatus === "completed"
                ? "completed"
                : executionStatus === "cancelled"
                    ? "cancelled"
                    : "failed";

        setStreamedMessages((current) =>
            current.map((message) => {
                if (message.id !== activeAssistantId) {
                    return message;
                }

                return {
                    ...message,
                    status: finalStatus,
                    metadata: {
                        ...message.metadata,
                        executionId: runId,
                        executionStatus: finalStatus,
                    },
                };
            }),
        );
    }, [
        chatId,
        activeAssistantId,
        runId,
        executionStatus,
    ]);

    /*
     * SCROLL HELPERS
     */

    const followChat = useCallback(() => {
        const container = messagesContainerRef.current;

        if (
            !container ||
            !shouldAutoScrollRef.current ||
            scrollFrameRef.current !== null
        ) {
            return;
        }

        const animate = () => {
            scrollFrameRef.current = null;

            const current = messagesContainerRef.current;

            if (!current || !shouldAutoScrollRef.current) {
                return;
            }

            const target =
                current.scrollHeight - current.clientHeight;

            const distance = target - current.scrollTop;

            if (distance <= 1) {
                current.scrollTop = target;
                return;
            }

            current.scrollTop += Math.min(
                Math.max(distance * 0.2, 3),
                20,
            );

            scrollFrameRef.current =
                requestAnimationFrame(animate);
        };

        scrollFrameRef.current =
            requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        if (isExecuting) {
            followChat();
        }
    }, [
        streamingText,
        isExecuting,
        executionStatus,
        followChat,
    ]);

    useEffect(() => {
        if (!messages.length) {
            return;
        }

        shouldAutoScrollRef.current = true;

        const frame = requestAnimationFrame(followChat);

        return () => cancelAnimationFrame(frame);
    }, [messages.length, followChat]);

    const handleMessagesScroll = () => {
        const container = messagesContainerRef.current;

        if (!container) {
            return;
        }

        const distance =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;

        shouldAutoScrollRef.current = distance <= 80;

        if (
            !shouldAutoScrollRef.current &&
            scrollFrameRef.current !== null
        ) {
            cancelAnimationFrame(scrollFrameRef.current);
            scrollFrameRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            if (scrollFrameRef.current !== null) {
                cancelAnimationFrame(scrollFrameRef.current);
            }
        };
    }, []);

    /*
     * STOP EXECUTION
     */

    const handleStopExecution = () => {
        if (!isExecuting) {
            return;
        }

        stop();
    };

    /*
     * SEND MESSAGE
     */

    const handleSendMessage = async (rawMessage: string) => {
        const message = rawMessage.trim();

        if (
            !chatId ||
            !chat ||
            !message ||
            isExecuting ||
            isSendingMessage
        ) {
            return;
        }

        setWorkspaceError(null);
        clearError();

        shouldAutoScrollRef.current = true;

        const requestId = createRequestId();

        setActiveRequestId(requestId);

        reset();

        try {
            // 1. Persist the user's message.
            await sendMessage(chatId, message);

            // 2. Start the agent run independently.
            executionChatIdRef.current = chatId;

            await execute({
                chatId,
                message,
                capability: activeCapability,
                attachments: [],
                requestId,
            });
        } catch {
            setWorkspaceError(
                "Your message could not be sent or the agent could not be started. Check the connection and try again.",
            );
        }
    };

    /*
     * RENDER: NO CHAT SELECTED
     */

    if (!chatId) {
        return (
            <section className="chat-workspace">
                <ChatHeader capability={activeCapability} />

                <div className="chat-workspace__messages">
                    <div className="chat-workspace__messages-inner">
                        <p>
                            Select a chat or start a new conversation.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    /*
     * RENDER: LOADING CHAT
     */

    if (isLoadingChats && !chat) {
        return (
            <section className="chat-workspace">
                <ChatHeader capability={activeCapability} />

                <div className="chat-workspace__messages">
                    <div className="chat-workspace__messages-inner">
                        <p>Loading conversation...</p>
                    </div>
                </div>
            </section>
        );
    }

    /*
     * RENDER: CHAT NOT FOUND
     */

    if (!chat && !pendingRequest) {
        return (
            <section className="chat-workspace">
                <ChatHeader capability={activeCapability} />

                <div className="chat-workspace__messages">
                    <div className="chat-workspace__messages-inner">
                        <p>
                            {workspaceError ??
                                chatError ??
                                "This chat could not be found."}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    /*
     * RENDER: CHAT WORKSPACE
     */

    return (
        <section className="chat-workspace">
            <ChatHeader capability={activeCapability} />

            <div
                ref={messagesContainerRef}
                className="chat-workspace__messages"
                onScroll={handleMessagesScroll}
            >
                <div className="chat-workspace__messages-inner">
                    {isLoadingMessages && messages.length === 0 ? (
                        <p>Loading messages...</p>
                    ) : null}

                    {!isLoadingMessages && messages.length === 0 ? (
                        <p>
                            Start the conversation by sending a message.
                        </p>
                    ) : null}

                    {messages.map((message) => (
                        <ChatMessage
                            key={message.id}
                            message={message}
                        />
                    ))}

                    <AIToolActivity events={toolEvents} />

                    <AIExecutionStatus status={executionStatus} />

                    <AIExecutionMetrics
                        tokenUsage={tokenUsage}
                        toolEvents={toolEvents}
                    />

                    {workspaceError ||
                        executionError ||
                        chatError ? (
                        <div
                            className="chat-workspace__error"
                            role="alert"
                        >
                            {workspaceError ??
                                executionError ??
                                chatError}
                        </div>
                    ) : null}

                    <div
                        className="chat-workspace__bottom"
                        aria-hidden="true"
                    />
                </div>
            </div>

            <ChatComposer
                model="auto"
                onSend={handleSendMessage}
                isExecuting={isExecuting || isSendingMessage}
                onStop={handleStopExecution}
            />
        </section>
    );
}
