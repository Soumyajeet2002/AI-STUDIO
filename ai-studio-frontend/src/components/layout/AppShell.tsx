import { Outlet } from "react-router-dom";

import { Sidebar } from "./Sidebar";
import { AgentPanel } from "./AgentPanel";

import "./AppShell.css";

export function AppShell() {
  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <Sidebar />
      </aside>

      <main className="app-shell__workspace">
        <div className="app-shell__workspace-inner">
          <Outlet />
        </div>
      </main>

      <aside className="app-shell__agent-panel">
        <AgentPanel />
      </aside>
    </div>
  );
}