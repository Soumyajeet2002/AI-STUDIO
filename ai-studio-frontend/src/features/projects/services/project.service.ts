
import { apiClient } from "../../../services/api/api-client";

import type {
    CreateProjectRequest,
    PaginatedProjectsResponse,
    Project,
    UpdateProjectArchiveRequest,
    UpdateProjectPinRequest,
    UpdateProjectRequest,
} from "../types/project.types";

export const projectService = {
    async getAll(): Promise<PaginatedProjectsResponse> {
        return apiClient.get<PaginatedProjectsResponse>("/projects");
    },

    async getById(projectId: string): Promise<Project> {
        return apiClient.get<Project>(
            `/projects/${encodeURIComponent(projectId)}`,
        );
    },

    async create(payload: CreateProjectRequest): Promise<Project> {
        return apiClient.post<Project>("/projects", payload);
    },

    async update(
        projectId: string,
        payload: UpdateProjectRequest,
    ): Promise<Project> {
        return apiClient.patch<Project>(
            `/projects/${encodeURIComponent(projectId)}`,
            payload,
        );
    },

    async setPinned(
        projectId: string,
        payload: UpdateProjectPinRequest,
    ): Promise<Project> {
        return apiClient.patch<Project>(
            `/projects/${encodeURIComponent(projectId)}/pin`,
            payload,
        );
    },

    async setArchived(
        projectId: string,
        payload: UpdateProjectArchiveRequest,
    ): Promise<Project> {
        return apiClient.patch<Project>(
            `/projects/${encodeURIComponent(projectId)}/archive`,
            payload,
        );
    },

    async delete(projectId: string): Promise<void> {
        await apiClient.delete<void>(
            `/projects/${encodeURIComponent(projectId)}`,
        );
    },
};
