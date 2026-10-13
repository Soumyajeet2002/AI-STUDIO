import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );
  const isLoading = useAuthStore((state) => state.isLoading);
  const isInitialized = useAuthStore(
    (state) => state.isInitialized,
  );
  const error = useAuthStore((state) => state.error);

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const initializeSession = useAuthStore(
    (state) => state.initializeSession,
  );
  const handleSessionExpired = useAuthStore(
    (state) => state.handleSessionExpired,
  );
  const clearError = useAuthStore((state) => state.clearError);

  useEffect(() => {
    const handleExpiredEvent = () => {
      handleSessionExpired();
    };

    window.addEventListener(
      "lifeos:session-expired",
      handleExpiredEvent,
    );

    void initializeSession();

    return () => {
      window.removeEventListener(
        "lifeos:session-expired",
        handleExpiredEvent,
      );
    };
  }, [handleSessionExpired, initializeSession]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    login,
    register,
    logout,
    clearError,
  };
}