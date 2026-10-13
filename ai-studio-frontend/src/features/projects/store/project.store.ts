import { create } from "zustand";

import { projectService } from "../services/project.service";

import type {
    CreateProjectRequest,
    Project,
    UpdateProjectRequest,
} from "../types/project.types";

interface ProjectState {
    projects: Project[];
    isLoading: boolean;
    isMutating: boolean;
    error: string | null;

    fetchProjects: () => Promise<void>;
    createProject: (payload: CreateProjectRequest) => Promise<Project>;
    renameProject: (projectId: string, name: string) => Promise<void>;
    updateProject: (
        projectId: string,
        payload: UpdateProjectRequest,
    ) => Promise<void>;
    togglePin: (projectId: string) => Promise<void>;
    toggleArchive: (projectId: string) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    clearError: () => void;
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : "Something went wrong while managing projects.";
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],
    isLoading: false,
    isMutating: false,
    error: null,


    fetchProjects: async () => {
        set({ isLoading: true, error: null });

        try {
            const response = await projectService.getAll();

            set({
                projects: response.items.filter(
                    (project) => !project.isArchived,
                ),
                isLoading: false,
            });
        } catch (error) {
            set({
                isLoading: false,
                error: getErrorMessage(error),
            });

            throw error;
        }
    },


    createProject: async (payload) => {
        set({ isMutating: true, error: null });

        try {
            const project = await projectService.create(payload);

            set((state) => ({
                projects: [
                    project,
                    ...state.projects.filter((item) => item.id !== project.id),
                ],
                isMutating: false,
            }));

            return project;
        } catch (error) {
            set({
                isMutating: false,
                error: getErrorMessage(error),
            });

            throw error;
        }
    },

    renameProject: async (projectId, name) => {
        await get().updateProject(projectId, { name });
    },

    updateProject: async (projectId, payload) => {
        set({ isMutating: true, error: null });

        try {
            const updatedProject = await projectService.update(
                projectId,
                payload,
            );

            set((state) => ({
                projects: state.projects.map((project) =>
                    project.id === projectId
                        ? { ...project, ...updatedProject }
                        : project,
                ),
                isMutating: false,
            }));
        } catch (error) {
            set({
                isMutating: false,
                error: getErrorMessage(error),
            });

            throw error;
        }
    },

    togglePin: async (projectId) => {
        const project = get().projects.find((item) => item.id === projectId);

        if (!project) return;

        set({ isMutating: true, error: null });

        try {
            const updatedProject = await projectService.setPinned(projectId, {
                isPinned: !project.isPinned,
            });

            set((state) => ({
                projects: state.projects.map((item) =>
                    item.id === projectId
                        ? { ...item, ...updatedProject }
                        : item,
                ),
                isMutating: false,
            }));
        } catch (error) {
            set({
                isMutating: false,
                error: getErrorMessage(error),
            });

            throw error;
        }
    },

    toggleArchive: async (projectId) => {
        const project = get().projects.find((item) => item.id === projectId);

        if (!project) return;

        set({ isMutating: true, error: null });

        try {
            const updatedProject = await projectService.setArchived(projectId, {
                isArchived: !project.isArchived,
            });

            set((state) => ({
                projects: updatedProject.isArchived
                    ? state.projects.filter((item) => item.id !== projectId)
                    : state.projects.map((item) =>
                        item.id === projectId
                            ? { ...item, ...updatedProject }
                            : item,
                    ),
                isMutating: false,
            }));
        } catch (error) {
            set({
                isMutating: false,
                error: getErrorMessage(error),
            });

            throw error;
        }
    },

    deleteProject: async (projectId) => {
        set({ isMutating: true, error: null });

        try {
            await projectService.delete(projectId);

            set((state) => ({
                projects: state.projects.filter(
                    (project) => project.id !== projectId,
                ),
                isMutating: false,
            }));
        } catch (error) {
            set({
                isMutating: false,
                error: getErrorMessage(error),
            });

            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));