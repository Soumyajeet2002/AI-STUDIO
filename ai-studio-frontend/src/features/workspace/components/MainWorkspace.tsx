import {
    WorkspaceComposer,
} from "./WorkspaceComposer";

import "./MainWorkspace.css";

export function MainWorkspace() {
    return (
        <section className="main-workspace">
            <div className="main-workspace__content">
                <div className="main-workspace__hero">
                    <span className="main-workspace__eyebrow">
                        AI STUDIO
                    </span>

                    <h1>
                        What can I help you with?
                    </h1>

                    <p>
                        Ask, create, research, analyze or
                        let an agent take care of it.
                    </p>
                </div>

                <WorkspaceComposer />
            </div>
        </section>
    );
}