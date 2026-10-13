import {
  useCallback,
  useState,
} from "react";

import {
  workspaceService,
  type WorkspaceRequest,
  type WorkspaceRequestResponse,
} from "../services/workspace.service";

type WorkspaceRequestState = {
  isSubmitting: boolean;
  error: string | null;
  response: WorkspaceRequestResponse | null;
};

export function useWorkspaceRequest() {
  const [state, setState] =
    useState<WorkspaceRequestState>({
      isSubmitting: false,
      error: null,
      response: null,
    });

  const submit = useCallback(
    async (
      request: WorkspaceRequest,
    ): Promise<WorkspaceRequestResponse | null> => {
      setState({
        isSubmitting: true,
        error: null,
        response: null,
      });

      try {
        const response =
          await workspaceService.submitRequest(
            request,
          );

        setState({
          isSubmitting: false,
          error: null,
          response,
        });

        return response;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Something went wrong while processing your request.";

        setState({
          isSubmitting: false,
          error: message,
          response: null,
        });

        return null;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState({
      isSubmitting: false,
      error: null,
      response: null,
    });
  }, []);

  return {
    submit,
    reset,

    isSubmitting: state.isSubmitting,
    error: state.error,
    response: state.response,
  };
}