import { useNavigate } from "react-router-dom";

import { WorkspaceComposer } from "../features/workspace/components/WorkspaceComposer";
import { useWorkspaceRequest } from "../features/workspace/hooks/useWorkspaceRequest";
import { useWorkspaceStore } from "../features/workspace/store/workspace.store";

import type {
    WorkspaceCapability,
} from "../features/workspace/types/workspace.types";

import "./WorkspaceHome.css";

export function WorkspaceHome() {
    const navigate = useNavigate();

    const setPendingRequest =
        useWorkspaceStore(
            (state) => state.setPendingRequest,
        );

    const {
        submit,
        isSubmitting,
        error,
    } = useWorkspaceRequest();

    const handleSubmit = async ({
        message,
        capability,
    }: {
        message: string;
        capability: WorkspaceCapability | null;
    }) => {
        const request = {
            message,
            capability,
            attachments: [],
        };

        const response = await submit(request);

        if (!response) {
            return;
        }

        setPendingRequest({
            chatId: response.chatId,
            requestId: response.requestId,
            request: response.request,
        });

        navigate(`/app/chat/${response.chatId}`);
    };

    return (
        <section className="workspace-home">
            <div className="workspace-home__content">
                <div className="workspace-home__intro">
                    <p className="workspace-home__eyebrow">
                        AI Studio
                    </p>

                    <h1 className="workspace-home__title">
                        What are you building today?
                    </h1>
                    <p className="workspace-home__description">
                        Create, research, write, analyze, and execute
                        from one intelligent workspace.
                    </p>
                </div>

                <WorkspaceComposer
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />

                {error && (
                    <div className="workspace-home__error">
                        {error}
                    </div>
                )}
            </div>
        </section>
    );
}