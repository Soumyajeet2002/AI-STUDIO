export type WorkspaceAgent = {
  id: string;
  name: string;
  description: string;
  status: "available" | "busy";
};

export type WorkspaceCapabilityType =
  | "image"
  | "video"
  | "content"
  | "web";

export type WorkspaceCapability = {
  id: string;
  label: string;
  description: string;
  type: WorkspaceCapabilityType;
};

export type SelectedCapability =
  | WorkspaceCapabilityType
  | null;