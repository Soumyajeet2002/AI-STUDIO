
export interface Project {
    id: string;
    ownerId: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    isPinned: boolean;
    isArchived: boolean;
    // settings: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedProjectsResponse {
    items: Project[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CreateProjectRequest {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    // settings?: Record<string, unknown>;
}

export interface UpdateProjectRequest {
    name?: string;
    description?: string | null;
    color?: string | null;
    icon?: string | null;
    // settings?: Record<string, unknown>;
}

export interface UpdateProjectPinRequest {
    isPinned: boolean;
}

export interface UpdateProjectArchiveRequest {
    isArchived: boolean;
}
