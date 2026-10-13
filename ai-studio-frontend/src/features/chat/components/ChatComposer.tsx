import {
    ArrowUp,
    FilePlus2,
    Mic,
    Paperclip,
    SlidersHorizontal,
    Sparkles,
    Square,
} from "lucide-react";
import {
    useRef,
    useState,
    type KeyboardEvent,
} from "react";

import type { ChatModel } from "../types/chat.types";

import "./ChatComposer.css";

type ChatComposerProps = {
    model: ChatModel;
    onSend: (content: string) => void;
    isExecuting?: boolean;
    onStop?: () => void;
};

export function ChatComposer({
    model,
    onSend,
    isExecuting = false,
    onStop,
}: ChatComposerProps) {
    const [content, setContent] = useState("");

    const textareaRef =
        useRef<HTMLTextAreaElement>(null);

    const canSend =
        content.trim().length > 0 &&
        !isExecuting;

    const isExtendedReasoning =
        String(model) === "gpt-5.6-thinking";

    const handleSend = () => {
        if (isExecuting) {
            return;
        }

        const value = content.trim();

        if (!value) {
            return;
        }

        onSend(value);

        setContent("");

        requestAnimationFrame(() => {
            textareaRef.current?.focus();
        });
    };

    const handleStop = () => {
        if (!isExecuting) {
            return;
        }

        onStop?.();
    };

    const handleKeyDown = (
        event: KeyboardEvent<HTMLTextAreaElement>,
    ) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            if (isExecuting) {
                return;
            }

            handleSend();
        }
    };

    return (
        <div className="chat-composer">
            <div
                className={`chat-composer__box ${isExecuting
                    ? "chat-composer__box--executing"
                    : ""
                    }`}
            >
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(event) =>
                        setContent(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder={
                        isExecuting
                            ? "Agent is working..."
                            : "Ask anything, research a topic, or build something..."
                    }
                    rows={1}
                    aria-label="Message"
                    disabled={isExecuting}
                />

                <div className="chat-composer__toolbar">
                    <div className="chat-composer__tools">
                        <button
                            type="button"
                            aria-label="Attach file"
                            disabled={isExecuting}
                        >
                            <Paperclip size={17} />
                        </button>

                        <button
                            type="button"
                            aria-label="Add file"
                            disabled={isExecuting}
                        >
                            <FilePlus2 size={17} />
                        </button>

                        <button
                            type="button"
                            aria-label="AI tools"
                            disabled={isExecuting}
                        >
                            <Sparkles size={17} />
                        </button>

                        <button
                            type="button"
                            aria-label="Composer settings"
                            disabled={isExecuting}
                        >
                            <SlidersHorizontal size={16} />
                        </button>
                    </div>

                    <div className="chat-composer__actions">
                        <button
                            type="button"
                            className="chat-composer__voice"
                            aria-label="Voice input"
                            disabled={isExecuting}
                        >
                            <Mic size={16} />
                        </button>

                        {isExecuting ? (
                            <button
                                type="button"
                                className="chat-composer__send chat-composer__send--stop"
                                onClick={handleStop}
                                aria-label="Stop agent"
                                title="Stop agent"
                            >
                                <Square
                                    size={15}
                                    strokeWidth={2.4}
                                />
                            </button>
                        ) : (
                            <button
                                type="button"
                                className={`chat-composer__send ${canSend
                                    ? "chat-composer__send--active"
                                    : ""
                                    }`}
                                onClick={handleSend}
                                disabled={!canSend}
                                aria-label="Send message"
                            >
                                <ArrowUp size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="chat-composer__footer">
                <span>
                    {isExecuting
                        ? "Agent is working. Stop it to send a new message."
                        : isExtendedReasoning
                            ? "Extended reasoning enabled"
                            : "AI can make mistakes. Verify important information."}
                </span>

                <span className="chat-composer__shortcut">
                    Enter to send
                    <kbd>⇧ Enter</kbd>
                    multiline
                </span>
            </div>
        </div>
    );
}