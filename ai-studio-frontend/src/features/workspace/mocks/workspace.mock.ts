import type {
  WorkspaceAgent,
  WorkspaceCapability,
} from "../types/workspace.types";

export const mockAgents: WorkspaceAgent[] = [
  {
    id: "atlas",
    name: "Atlas",
    description: "General purpose AI agent",
    status: "available",
  },
  {
    id: "researcher",
    name: "Researcher",
    description: "Deep research and web intelligence",
    status: "available",
  },
  {
    id: "engineer",
    name: "Engineer",
    description: "Coding and technical execution",
    status: "available",
  },
  {
    id: "analyst",
    name: "Analyst",
    description: "Data and document analysis",
    status: "available",
  },
];

export const mockCapabilities: WorkspaceCapability[] = [
  {
    id: "create-image",
    label: "Create Image",
    description: "Generate images and visual concepts",
    type: "image",
  },
  {
    id: "create-video",
    label: "Create Video",
    description: "Create videos and visual sequences",
    type: "video",
  },
  {
    id: "create-content",
    label: "Create Content",
    description: "Write, rewrite and create content",
    type: "content",
  },
  {
    id: "search-web",
    label: "Search Web",
    description: "Search the web for current information",
    type: "web",
  },
];