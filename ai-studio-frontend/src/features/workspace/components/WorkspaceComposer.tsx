import {
    ArrowUp,
    FileText,
    Image,
    Mic,
    Plus,
    Search,
    Sparkles,
    Video,
    X,
} from "lucide-react";
import gsap from "gsap";
import {
    useEffect,
    useRef,
    useState,
    type KeyboardEvent,
} from "react";

import { mockCapabilities } from "../mocks/workspace.mock";

import type {
    WorkspaceCapability,
} from "../types/workspace.types";

import "./WorkspaceComposer.css";

type WorkspaceComposerProps = {
    onSubmit?: (data: {
        message: string;
        capability: WorkspaceCapability | null;
    }) => void;

    isSubmitting?: boolean;
};

export function WorkspaceComposer({
    onSubmit,
    isSubmitting = false,
}: WorkspaceComposerProps) {
    const [message, setMessage] = useState("");

    const [selectedCapability, setSelectedCapability] =
        useState<WorkspaceCapability | null>(null);

    const composerRef =
        useRef<HTMLDivElement>(null);

    const capabilityChipRef =
        useRef<HTMLDivElement>(null);

    const canSend =
        message.trim().length > 0 && !isSubmitting;

    const selectCapability = (
        capability: WorkspaceCapability,
    ) => {
        /*
         * Only one capability can exist at a time.
         *
         * Clicking another capability replaces
         * the currently selected capability.
         */
        setSelectedCapability(capability);
    };

    const removeCapability = () => {
        setSelectedCapability(null);
    };

    useEffect(() => {
        if (!composerRef.current) {
            return;
        }

        gsap.fromTo(
            composerRef.current,
            {
                y: 8,
                opacity: 0,
            },
            {
                y: 0,
                opacity: 1,
                duration: 0.4,
                ease: "power3.out",
            },
        );
    }, []);

    useEffect(() => {
        if (!capabilityChipRef.current) {
            return;
        }

        if (!selectedCapability) {
            return;
        }

        gsap.fromTo(
            capabilityChipRef.current,
            {
                scale: 0.9,
                opacity: 0,
                x: -6,
            },
            {
                scale: 1,
                opacity: 1,
                x: 0,
                duration: 0.25,
                ease: "back.out(1.6)",
            },
        );
    }, [selectedCapability]);

    const handleSubmit = () => {
        const trimmedMessage = message.trim();

        if (!trimmedMessage) {
            return;
        }

        onSubmit?.({
            message: trimmedMessage,
            capability: selectedCapability,
        });

        setMessage("");
    };

    const handleKeyDown = (
        event: KeyboardEvent<HTMLTextAreaElement>,
    ) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            handleSubmit();
        }
    };

    return (
        <div className="workspace-composer-wrapper">
            {/* ─────────────────────────────
          MAIN SINGLE-LINE COMPOSER
      ───────────────────────────── */}

            <div
                ref={composerRef}
                className="workspace-composer"
            >
                <div className="workspace-composer__main">
                    <button
                        type="button"
                        className="workspace-attach-button"
                        aria-label="Attach files"
                    >
                        <Plus size={19} />
                    </button>

                    {selectedCapability && (
                        <div
                            ref={capabilityChipRef}
                            className="workspace-capability-chip"
                        >
                            <span className="workspace-capability-chip__icon">
                                <CapabilityIcon
                                    type={selectedCapability.type}
                                />
                            </span>

                            <span className="workspace-capability-chip__label">
                                {selectedCapability.label}
                            </span>

                            <button
                                type="button"
                                className="workspace-capability-chip__remove"
                                onClick={removeCapability}
                                aria-label={`Remove ${selectedCapability.label}`}
                            >
                                <X size={13} />
                            </button>
                        </div>
                    )}

                    <div className="workspace-composer__input">
                        <textarea
                            value={message}
                            onChange={(event) =>
                                setMessage(event.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            placeholder={
                                selectedCapability
                                    ? `Describe what you want to ${selectedCapability.label.toLowerCase()}...`
                                    : "Ask anything..."
                            }
                            rows={1}
                            aria-label="AI Studio prompt"
                        />
                    </div>

                    <div className="workspace-composer__action">
                        {canSend ? (
                            <button
                                type="button"
                                className="workspace-send-button"
                                onClick={handleSubmit}
                                aria-label="Send"
                                disabled={isSubmitting}
                            >
                                <ArrowUp size={18} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="workspace-mic-button"
                                aria-label="Voice input"
                            >
                                <Mic size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ─────────────────────────────
          ATTACHMENT
      ───────────────────────────── */}

            {/* ─────────────────────────────
          CAPABILITIES
      ───────────────────────────── */}

            <div className="workspace-capabilities">
                {mockCapabilities.map(
                    (capability) => {
                        const isSelected =
                            selectedCapability?.id ===
                            capability.id;

                        return (
                            <button
                                key={capability.id}
                                type="button"
                                className={`workspace-capability-button ${isSelected
                                    ? "workspace-capability-button--selected"
                                    : ""
                                    }`}
                                onClick={() =>
                                    selectCapability(
                                        capability,
                                    )
                                }
                            >
                                <span className="workspace-capability-button__icon">
                                    <CapabilityIcon
                                        type={capability.type}
                                    />
                                </span>

                                <span className="workspace-capability-button__label">
                                    {capability.label}
                                </span>
                            </button>
                        );
                    },
                )}
            </div>

            <p className="workspace-composer__hint">
                Select a capability or simply start typing.
            </p>
        </div>
    );
}

function CapabilityIcon({
    type,
}: {
    type: WorkspaceCapability["type"];
}) {
    switch (type) {
        case "image":
            return <Image size={15} />;

        case "video":
            return <Video size={15} />;

        case "content":
            return <FileText size={15} />;

        case "web":
            return <Search size={15} />;

        default:
            return <Sparkles size={15} />;
    }
}