import { useEffect, useState, type FormEvent } from "react";
import {
    Bot,
    Brain,
    Check,
    Folder,
    Globe,
    LockKeyhole,
    Sparkles,
    X,
} from "lucide-react";
import type {
    CreateProjectRequest,
    Project,
} from "../types/project.types";
import "./ProjectDialog.css";

type MemoryScope = "project" | "global" | "both";

type ProjectDialogProps = {
    mode: "create" | "rename";
    project?: Project;
    onClose: () => void;
    onSubmit: (
        payload: CreateProjectRequest,
    ) => Promise<void>;
};

const colors = [
    "#818CF8",
    "#60A5FA",
    "#34D399",
    "#FBBF24",
    "#F87171",
    "#C084FC",
    "#FB923C",
    "#2DD4BF",
];

const icons = [
    { name: "folder", label: "Folder", Icon: Folder },
    { name: "brain", label: "Brain", Icon: Brain },
    { name: "bot", label: "AI agent", Icon: Bot },
    { name: "sparkles", label: "Ideas", Icon: Sparkles },
];

export function ProjectDialog({
    mode,
    project,
    onClose,
    onSubmit,
}: ProjectDialogProps) {
    const [name, setName] = useState(project?.name ?? "");
    const [description, setDescription] = useState(
        project?.description ?? "",
    );
    const [icon, setIcon] = useState(project?.icon ?? "folder");
    const [color, setColor] = useState(
        project?.color ?? colors[0],
    );
    const [memoryScope, setMemoryScope] =
        useState<MemoryScope>("project");
    const [projectMemory, setProjectMemory] = useState("");
    const [instructions, setInstructions] = useState("");
    const [pinned, setPinned] = useState(project?.isPinned ?? false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !busy) onClose();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [busy, onClose]);


    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedName = name.trim();

        if (!trimmedName) {
            setError("Give your project a name to continue.");
            return;
        }

        if (trimmedName.length > 80) {
            setError("Project names must be 80 characters or fewer.");
            return;
        }

        setBusy(true);
        setError("");

        try {
            // Send only fields currently supported by the backend.
            await onSubmit({
                name: trimmedName,
                description: description.trim() || undefined,
                icon,
                color,
            });

            onClose();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not save this project. Please try again.",
            );
        } finally {
            setBusy(false);
        }
    }


    return (
        <div
            className="project-dialog__backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !busy) {
                    onClose();
                }
            }}
        >
            <section
                className="project-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="project-dialog-title"
            >
                <header className="project-dialog__header">
                    <div className="project-dialog__heading">
                        <div
                            className="project-dialog__preview"
                            style={{ color, backgroundColor: `${color} 20` }}
                        >
                            {(() => {
                                const SelectedIcon =
                                    icons.find((item) => item.name === icon)?.Icon ??
                                    Folder;
                                return <SelectedIcon size={23} />;
                            })()}
                        </div>

                        <div>
                            <h2 id="project-dialog-title">
                                {mode === "create" ? "Create a project" : "Rename project"}
                            </h2>
                            <p>
                                {mode === "create"
                                    ? "Build a dedicated space for your work and AI."
                                    : "Update your project name and keep your work organized."}
                            </p>
                        </div>
                    </div>

                    <button
                        className="project-dialog__close"
                        type="button"
                        aria-label="Close dialog"
                        disabled={busy}
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </header>

                <form onSubmit={handleSubmit}>
                    <div className="project-dialog__body">
                        <label className="project-dialog__field">
                            <span>Project name <b>*</b></span>
                            <input
                                autoFocus
                                maxLength={80}
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="e.g. Product Research"
                                required
                            />
                            <small>{name.length}/80 characters</small>
                        </label>

                        {mode === "create" && (
                            <>
                                <label className="project-dialog__field">
                                    <span>Description</span>
                                    <textarea
                                        value={description}
                                        onChange={(event) => setDescription(event.target.value)}
                                        placeholder="What will you work on in this project?"
                                        rows={2}
                                        maxLength={500}
                                    />
                                </label>

                                <div className="project-dialog__field">
                                    <span>Choose an icon</span>
                                    <div className="project-dialog__icons">
                                        {icons.map(({ name: iconName, label, Icon }) => (
                                            <button
                                                key={iconName}
                                                type="button"
                                                title={label}
                                                aria-label={label}
                                                aria-pressed={icon === iconName}
                                                className={
                                                    icon === iconName
                                                        ? "project-dialog__icon project-dialog__icon--selected"
                                                        : "project-dialog__icon"
                                                }
                                                onClick={() => setIcon(iconName)}
                                            >
                                                <Icon size={19} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="project-dialog__field">
                                    <span>Project color</span>
                                    <div className="project-dialog__colors">
                                        {colors.map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                aria-label={`Choose ${item} `}
                                                aria-pressed={color === item}
                                                className="project-dialog__color"
                                                style={{ backgroundColor: item }}
                                                onClick={() => setColor(item)}
                                            >
                                                {color === item && <Check size={15} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="project-dialog__section-title">
                                    <Brain size={17} />
                                    <div>
                                        <strong>AI memory</strong>
                                        <p>Choose what context this project should use.</p>
                                    </div>
                                </div>

                                <div className="project-dialog__memory-options">
                                    <button
                                        type="button"
                                        className={
                                            memoryScope === "project"
                                                ? "project-dialog__memory-option is-selected"
                                                : "project-dialog__memory-option"
                                        }
                                        onClick={() => setMemoryScope("project")}
                                    >
                                        <LockKeyhole size={17} />
                                        <span>
                                            <strong>Project only</strong>
                                            <small>Keep context specific to this project.</small>
                                        </span>
                                        {memoryScope === "project" && <Check size={16} />}
                                    </button>

                                    <button
                                        type="button"
                                        className={
                                            memoryScope === "global"
                                                ? "project-dialog__memory-option is-selected"
                                                : "project-dialog__memory-option"
                                        }
                                        onClick={() => setMemoryScope("global")}
                                    >
                                        <Globe size={17} />
                                        <span>
                                            <strong>Global memory</strong>
                                            <small>Use shared context across your workspace.</small>
                                        </span>
                                        {memoryScope === "global" && <Check size={16} />}
                                    </button>

                                    <button
                                        type="button"
                                        className={
                                            memoryScope === "both"
                                                ? "project-dialog__memory-option is-selected"
                                                : "project-dialog__memory-option"
                                        }
                                        onClick={() => setMemoryScope("both")}
                                    >
                                        <Sparkles size={17} />
                                        <span>
                                            <strong>Both</strong>
                                            <small>Use project context and shared context.</small>
                                        </span>
                                        {memoryScope === "both" && <Check size={16} />}
                                    </button>
                                </div>

                                <label className="project-dialog__field">
                                    <span>Project memory <small>Optional</small></span>
                                    <textarea
                                        rows={3}
                                        value={projectMemory}
                                        onChange={(event) => setProjectMemory(event.target.value)}
                                        placeholder="Important facts, goals, preferences, and context for the AI…"
                                    />
                                </label>

                                <label className="project-dialog__field">
                                    <span>AI instructions <small>Optional</small></span>
                                    <textarea
                                        rows={3}
                                        value={instructions}
                                        onChange={(event) => setInstructions(event.target.value)}
                                        placeholder="How should the AI work in this project?"
                                    />
                                </label>

                                <label className="project-dialog__checkbox">
                                    <input
                                        type="checkbox"
                                        checked={pinned}
                                        onChange={(event) => setPinned(event.target.checked)}
                                    />
                                    <span>
                                        <strong>Pin this project</strong>
                                        <small>Keep it easy to access in your sidebar.</small>
                                    </span>
                                </label>
                            </>
                        )}

                        {error && (
                            <div className="project-dialog__error" role="alert">
                                {error}
                            </div>
                        )}
                    </div>

                    <footer className="project-dialog__footer">
                        <button
                            type="button"
                            className="project-dialog__cancel"
                            disabled={busy}
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="project-dialog__submit"
                            disabled={busy || !name.trim()}
                        >
                            {busy
                                ? "Saving…"
                                : mode === "create"
                                    ? "Create project"
                                    : "Save changes"}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}