import {
    FileText,
    Image,
    Search,
    Sparkles,
    Video,
} from "lucide-react";

import type {
    WorkspaceCapabilityType,
} from "../../workspace/types/workspace.types";

import "./ChatHeader.css";

type ChatHeaderProps = {
    capability?: WorkspaceCapabilityType | null;
};

export function ChatHeader({
    capability = null,
}: ChatHeaderProps) {
    return (
        <header className="chat-header">
            <div className="chat-header__left">
                <div className="chat-header__identity">
                    <div className="chat-header__icon">
                        <Sparkles size={17} />
                    </div>

                    <div>
                        <h1 className="chat-header__title">
                            New conversation
                        </h1>

                        <p className="chat-header__subtitle">
                            {capability ? (
                                <span className="chat-header__capability">
                                    {getCapabilityIcon(capability)}
                                    {getCapabilityLabel(capability)}
                                </span>
                            ) : (
                                "AI Studio"
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div className="chat-header__right">
                <div className="chat-header__model">
                    <span className="chat-header__model-dot" />
                    <span>Auto</span>
                </div>
            </div>
        </header>
    );
}

function getCapabilityLabel(
    capability: WorkspaceCapabilityType,
) {
    switch (capability) {
        case "image":
            return "Create Image";

        case "video":
            return "Create Video";

        case "content":
            return "Create Content";

        case "web":
            return "Search Web";

        default:
            return "AI Studio";
    }
}

function getCapabilityIcon(
    capability: WorkspaceCapabilityType,
) {
    switch (capability) {
        case "image":
            return <Image size={13} />;

        case "video":
            return <Video size={13} />;

        case "content":
            return <FileText size={13} />;

        case "web":
            return <Search size={13} />;

        default:
            return <Sparkles size={13} />;
    }
}