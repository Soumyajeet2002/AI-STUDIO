import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import "./ProtectedRoute.css";

export function ProtectedRoute() {
    const isAuthenticated = useAuthStore(
        (state) => state.isAuthenticated,
    );
    const isInitialized = useAuthStore(
        (state) => state.isInitialized,
    );
    const location = useLocation();

    if (!isInitialized) {
        return (
            <div className="auth-loading" role="status" aria-live="polite">
                <span className="auth-loading__spinner" />
                <span>Restoring your session...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    return <Outlet />;
}