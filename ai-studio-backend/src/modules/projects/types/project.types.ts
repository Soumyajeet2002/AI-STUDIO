export interface CreateProjectData {
  ownerId: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
}

export interface UpdateProjectData {
  name?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  settings?: Record<string, unknown>;
}

export interface ListProjectsOptions {
  page: number;
  limit: number;
  search?: string;
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface ProjectListResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
