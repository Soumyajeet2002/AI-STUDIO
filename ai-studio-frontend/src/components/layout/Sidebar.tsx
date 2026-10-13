
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Archive,
    Bot,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    Code2,
    Ellipsis,
    Folder,
    Image,
    Layers3,
    MessageSquare,
    Plus,
    Search,
    Settings,
    Sparkles,
    Video,
    Workflow,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { useProjectStore } from "../../features/projects/store/project.store";
import { useChatStore } from "../../features/chat/store/chat.store";

import { ProjectDialog } from "../../features/projects/components/ProjectDialog";
import type { Project } from "../../features/projects/types/project.types";
import type { Chat } from "../../features/chat/types/chat.types";

import "./Sidebar.css";

type ProjectDialogState =
    | { mode: "create" }
    | { mode: "rename"; project: Project }
    | null;

export function Sidebar() {
    const navigate = useNavigate();
    const { chatId } = useParams<{ chatId: string }>();

    // Projects
    const projects = useProjectStore((state) => state.projects);
    const isLoadingProjects = useProjectStore((state) => state.isLoading);
    const projectError = useProjectStore((state) => state.error);
    const fetchProjects = useProjectStore((state) => state.fetchProjects);
    const createProject = useProjectStore((state) => state.createProject);
    const renameProject = useProjectStore((state) => state.renameProject);
    const togglePin = useProjectStore((state) => state.togglePin);
    const deleteProject = useProjectStore((state) => state.deleteProject);
    const clearProjectError = useProjectStore((state) => state.clearError);

    // Chats
    const chats = useChatStore((state) => state.chats);
    const isLoadingChats = useChatStore((state) => state.isLoadingChats);
    const chatError = useChatStore((state) => state.error);
    const fetchChats = useChatStore((state) => state.fetchChats);
    const renameChat = useChatStore((state) => state.renameChat);
    const deleteChat = useChatStore((state) => state.deleteChat);
    const clearChatError = useChatStore((state) => state.clearError);

    // Local UI state
    const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
    const [activeItem, setActiveItem] = useState("New Chat");
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [projectDialog, setProjectDialog] =
        useState<ProjectDialogState>(null);

    // Load sidebar data from the backend-backed stores.
    useEffect(() => {
        void fetchProjects().catch(() => undefined);
        void fetchChats().catch(() => undefined);
    }, [fetchProjects, fetchChats]);

    // Keep the most recently updated chats at the top.
    const sortedChats = useMemo(() => {
        const safeChats = Array.isArray(chats) ? chats : [];

        return [...safeChats].sort((a, b) => {
            const aTime = new Date(a.updatedAt ?? 0).getTime();
            const bTime = new Date(b.updatedAt ?? 0).getTime();

            return (
                (Number.isFinite(bTime) ? bTime : 0) -
                (Number.isFinite(aTime) ? aTime : 0)
            );
        });
    }, [chats]);

    const filteredChats = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) return sortedChats;

        return sortedChats.filter((chat) =>
            chat.title.toLowerCase().includes(query),
        );
    }, [sortedChats, searchQuery]);

    const toggleProject = (projectId: string) => {
        setExpandedProjects((current) =>
            current.includes(projectId)
                ? current.filter((id) => id !== projectId)
                : [...current, projectId],
        );
    };

    const handleNewChat = () => {
        setActiveItem("New Chat");
        navigate("/");
    };

    const handleChatClick = (chat: Chat) => {
        setActiveItem(`chat:${chat.id}`);
        navigate(`/chat/${chat.id}`);
    };

    const handleProjectClick = (projectId: string) => {
        setActiveItem(`project:${projectId}`);
        toggleProject(projectId);
    };

    const handleWorkspaceClick = (name: string) => {
        setActiveItem(name);
    };

    const handleCreateProject = async (
        values: { name: string; description?: string },
    ) => {
        await createProject({
            name: values.name.trim(),
            description: values.description?.trim() || undefined,
        });

        setProjectDialog(null);
    };

    const handleRenameProject = async (
        values: { name: string; description?: string },
    ) => {
        if (!projectDialog || projectDialog.mode !== "rename") return;

        await renameProject(projectDialog.project.id, values.name.trim());

        setProjectDialog(null);
    };

    const handleDeleteProject = async (project: Project) => {
        const confirmed = window.confirm(
            `Delete "${project.name}"? This action cannot be undone.`,
        );

        if (!confirmed) return;

        try {
            await deleteProject(project.id);
        } catch {
            // The project store retains the error for the UI.
        }
    };


    const handleRenameChat = async (chat: Chat) => {
        const title = window.prompt("Enter a new chat title:", chat.title);

        if (title === null) return;

        const trimmedTitle = title.trim();

        if (!trimmedTitle || trimmedTitle === chat.title) return;

        try {
            await renameChat(chat.id, trimmedTitle);
        } catch {
            // The chat store exposes the error.
        }
    };


    const handleDeleteChat = async (chat: Chat) => {
        const confirmed = window.confirm(
            `Delete "${chat.title}"? This action cannot be undone.`,
        );

        if (!confirmed) return;

        try {
            await deleteChat(chat.id);

            if (chatId === chat.id) {
                navigate("/");
                setActiveItem("New Chat");
            }
        } catch {
            // The chat store retains the error for the UI.
        }
    };

    const renderChatRow = (chat: Chat, inProject = false) => {
        const isActive = chatId === chat.id;

        return (
            <div
                key={chat.id}
                className={[
                    "sidebar-chat-row",
                    isActive ? "sidebar-chat-row--active" : "",
                    inProject ? "sidebar-chat-row--nested" : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <button
                    type="button"
                    className={`sidebar-item ${isActive ? "sidebar-item--active" : ""
                        }`}
                    title={chat.title}
                    onClick={() => handleChatClick(chat)}
                >
                    <MessageSquare size={15} className="sidebar-item__icon" />
                    <span className="sidebar-item__label">{chat.title}</span>
                </button>

                {!inProject && (
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button
                                type="button"
                                className="sidebar-chat-row__menu"
                                aria-label={`Actions for ${chat.title}`}
                                onClick={(event) => event.stopPropagation()}
                            >
                                <Ellipsis size={16} />
                            </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                className="sidebar-dropdown"
                                align="start"
                                side="right"
                                sideOffset={6}
                            >
                                <DropdownMenu.Item
                                    className="sidebar-dropdown__item"
                                    onSelect={() => void handleRenameChat(chat)}
                                >
                                    Rename chat
                                </DropdownMenu.Item>

                                <DropdownMenu.Separator className="sidebar-dropdown__separator" />

                                <DropdownMenu.Item
                                    className="sidebar-dropdown__item sidebar-dropdown__item--danger"
                                    onSelect={() => void handleDeleteChat(chat)}
                                >
                                    Delete chat
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                )}
            </div>
        );
    };

    const handleChatDragStart = (
        event: React.DragEvent<HTMLElement>,
        chatId: string,
    ) => {
        event.dataTransfer.setData(
            "application/x-lifeos-chat-id",
            chatId,
        );

        event.dataTransfer.effectAllowed = "move";
    };

    return (
        <aside className="sidebar">
            {/* Brand */}
            <div className="sidebar__brand">
                <div className="sidebar__brand-mark">
                    <Sparkles size={20} />
                </div>
                <span className="sidebar__brand-name">LifeOS</span>
            </div>

            {/* Primary actions */}
            <div className="sidebar__primary-actions">
                <button
                    type="button"
                    className={`sidebar-item sidebar-item--primary ${activeItem === "New Chat" && !chatId
                        ? "sidebar-item--active"
                        : ""
                        }`}
                    onClick={handleNewChat}
                >
                    <Plus size={17} className="sidebar-item__icon" />
                    <span className="sidebar-item__label">New Chat</span>
                </button>

                <button
                    type="button"
                    className={`sidebar-item ${searchOpen ? "sidebar-item--active" : ""
                        }`}
                    onClick={() => setSearchOpen((open) => !open)}
                >
                    <Search size={17} className="sidebar-item__icon" />
                    <span className="sidebar-item__label">Search chats</span>
                </button>

                {searchOpen && (
                    <div className="sidebar-search">
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search conversations..."
                            aria-label="Search conversations"
                            autoFocus
                        />
                    </div>
                )}
            </div>

            {/* Recent chats */}
            <section className="sidebar-section">
                <div className="sidebar-section__heading">
                    <span>Recent Chats</span>
                    {isLoadingChats && (
                        <span className="sidebar-section__loading">Loading</span>
                    )}
                </div>

                {chatError && (
                    <div className="sidebar-projects__error" role="alert">
                        <span>{chatError}</span>
                        <button
                            type="button"
                            onClick={() => {
                                clearChatError();
                                void fetchChats().catch(() => undefined);
                            }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!isLoadingChats && filteredChats.length === 0 && !chatError && (
                    <div className="sidebar-projects__status">
                        {searchQuery.trim()
                            ? "No matching chats"
                            : "Your conversations will appear here"}
                    </div>
                )}

                <div className="sidebar-section__items">
                    {filteredChats.map((chat) => renderChatRow(chat))}
                </div>
            </section>

            {/* Projects */}
            <section className="sidebar-section sidebar-projects">
                <div className="sidebar-section__heading sidebar-projects__heading">
                    <span>Projects</span>

                    <button
                        type="button"
                        className="sidebar-icon-button"
                        aria-label="Create project"
                        title="Create project"
                        onClick={() => setProjectDialog({ mode: "create" })}
                    >
                        <Plus size={16} />
                    </button>
                </div>

                {projectError && (
                    <div className="sidebar-projects__error" role="alert">
                        <span>{projectError}</span>
                        <button
                            type="button"
                            onClick={() => {
                                clearProjectError();
                                void fetchProjects().catch(() => undefined);
                            }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {isLoadingProjects && projects.length === 0 && (
                    <div className="sidebar-projects__status">
                        Loading projects...
                    </div>
                )}

                {!isLoadingProjects &&
                    projects.length === 0 &&
                    !projectError && (
                        <div className="sidebar-projects__status">
                            No projects yet. Create one to get started.
                        </div>
                    )}

                <div className="sidebar-section__items">
                    {projects.map((project) => {
                        const expanded = expandedProjects.includes(project.id);

                        const projectChats = filteredChats.filter(
                            (chat) => chat.projectId === project.id,
                        );

                        return (
                            <div className="sidebar-project" key={project.id}>
                                <div
                                    className={`sidebar-project__row ${activeItem === `project:${project.id}`
                                        ? "sidebar-project__row--active"
                                        : ""
                                        }`}
                                >
                                    <button
                                        type="button"
                                        className="sidebar-project__toggle"
                                        onClick={() => handleProjectClick(project.id)}
                                        aria-expanded={expanded}
                                        title={project.name}
                                    >
                                        {expanded ? (
                                            <ChevronDown size={15} />
                                        ) : (
                                            <ChevronRight size={15} />
                                        )}

                                        <Folder size={16} className="sidebar-item__icon" />

                                        <span className="sidebar-item__label">
                                            {project.name}
                                        </span>

                                        {project.isPinned && (
                                            <span
                                                className="sidebar-project__pinned"
                                                title="Pinned project"
                                            >
                                                <Layers3 size={12} />
                                            </span>
                                        )}
                                    </button>

                                    <DropdownMenu.Root>
                                        <DropdownMenu.Trigger asChild>
                                            <button
                                                type="button"
                                                className="sidebar-project__menu"
                                                aria-label={`Actions for ${project.name}`}
                                                onClick={(event) => event.stopPropagation()}
                                            >
                                                <Ellipsis size={16} />
                                            </button>
                                        </DropdownMenu.Trigger>

                                        <DropdownMenu.Portal>
                                            <DropdownMenu.Content
                                                className="sidebar-dropdown"
                                                align="start"
                                                side="right"
                                                sideOffset={6}
                                            >
                                                <DropdownMenu.Item
                                                    className="sidebar-dropdown__item"
                                                    onSelect={() =>
                                                        setProjectDialog({
                                                            mode: "rename",
                                                            project,
                                                        })
                                                    }
                                                >
                                                    Rename project
                                                </DropdownMenu.Item>

                                                <DropdownMenu.Item
                                                    className="sidebar-dropdown__item"
                                                    onSelect={() => {
                                                        void togglePin(project.id).catch(() => undefined);
                                                    }}
                                                >
                                                    {project.isPinned ? "Unpin project" : "Pin project"}
                                                </DropdownMenu.Item>

                                                <DropdownMenu.Separator className="sidebar-dropdown__separator" />

                                                <DropdownMenu.Item
                                                    className="sidebar-dropdown__item sidebar-dropdown__item--danger"
                                                    onSelect={() => void handleDeleteProject(project)}
                                                >
                                                    Delete project
                                                </DropdownMenu.Item>
                                            </DropdownMenu.Content>
                                        </DropdownMenu.Portal>
                                    </DropdownMenu.Root>
                                </div>

                                {expanded && (
                                    <div className="sidebar-project__chats">
                                        {projectChats.length > 0 ? (
                                            projectChats.map((chat) => renderChatRow(chat, true))
                                        ) : (
                                            <div className="sidebar-project__empty">
                                                No chats in this project
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Workspace shortcuts */}
            <section className="sidebar-section">
                <div className="sidebar-section__heading">
                    <span>Workspace</span>
                </div>

                <div className="sidebar-section__items">
                    <button
                        type="button"
                        className={`sidebar-item ${activeItem === "Images" ? "sidebar-item--active" : ""
                            }`}
                        onClick={() => handleWorkspaceClick("Images")}
                    >
                        <Image size={17} className="sidebar-item__icon" />
                        <span className="sidebar-item__label">Images</span>
                    </button>

                    <button
                        type="button"
                        className={`sidebar-item ${activeItem === "Videos" ? "sidebar-item--active" : ""
                            }`}
                        onClick={() => handleWorkspaceClick("Videos")}
                    >
                        <Video size={17} className="sidebar-item__icon" />
                        <span className="sidebar-item__label">Videos</span>
                    </button>

                    <button
                        type="button"
                        className={`sidebar-item ${activeItem === "Agents" ? "sidebar-item--active" : ""
                            }`}
                        onClick={() => handleWorkspaceClick("Agents")}
                    >
                        <Bot size={17} className="sidebar-item__icon" />
                        <span className="sidebar-item__label">Agents</span>
                    </button>

                    <button
                        type="button"
                        className={`sidebar-item ${activeItem === "Automations" ? "sidebar-item--active" : ""
                            }`}
                        onClick={() => handleWorkspaceClick("Automations")}
                    >
                        <Workflow size={17} className="sidebar-item__icon" />
                        <span className="sidebar-item__label">Automations</span>
                    </button>

                    <button
                        type="button"
                        className={`sidebar-item ${activeItem === "Calendar" ? "sidebar-item--active" : ""
                            }`}
                        onClick={() => handleWorkspaceClick("Calendar")}
                    >
                        <CalendarDays size={17} className="sidebar-item__icon" />
                        <span className="sidebar-item__label">Calendar</span>
                    </button>

                    <button
                        type="button"
                        className={`sidebar-item ${activeItem === "Archive" ? "sidebar-item--active" : ""
                            }`}
                        onClick={() => handleWorkspaceClick("Archive")}
                    >
                        <Archive size={17} className="sidebar-item__icon" />
                        <span className="sidebar-item__label">Archive</span>
                    </button>

                    <button
                        type="button"
                        className={`sidebar-item ${activeItem === "Code" ? "sidebar-item--active" : ""
                            }`}
                        onClick={() => handleWorkspaceClick("Code")}
                    >
                        <Code2 size={17} className="sidebar-item__icon" />
                        <span className="sidebar-item__label">Code</span>
                    </button>
                </div>
            </section>

            {/* Footer */}
            <div className="sidebar__footer">
                <button
                    type="button"
                    className={`sidebar-item ${activeItem === "Settings" ? "sidebar-item--active" : ""
                        }`}
                    onClick={() => handleWorkspaceClick("Settings")}
                >
                    <Settings size={17} className="sidebar-item__icon" />
                    <span className="sidebar-item__label">Settings</span>
                </button>
            </div>

            {/* Project dialog */}
            {projectDialog && (
                <ProjectDialog
                    mode={projectDialog.mode}
                    project={
                        projectDialog.mode === "rename"
                            ? projectDialog.project
                            : undefined
                    }
                    onClose={() => setProjectDialog(null)}
                    onSubmit={
                        projectDialog.mode === "create"
                            ? handleCreateProject
                            : handleRenameProject
                    }
                />
            )}
        </aside>
    );
}
