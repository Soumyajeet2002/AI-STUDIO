// import { createBrowserRouter } from "react-router-dom";

// import { AppShell } from "../components/layout/AppShell";
// import { ChatWorkspace } from "../features/chat/pages/ChatWorkspace";
// import { WorkspaceHome } from "../pages/WorkspaceHome";

// import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
// import LoginPage from "../features/auth/pages/LoginPage";
// // import { RegisterPage } from "../features/auth/pages/RegisterPage";

// export const router = createBrowserRouter([
//     // Public routes
//     {
//         path: "/login",
//         element: <LoginPage />,
//     },
//     // {
//     //     path: "/register",
//     //     element: <RegisterPage />,
//     // },

//     // Protected application routes
//     {
//         element: <ProtectedRoute />,
//         children: [
//             {
//                 path: "/",
//                 element: <AppShell />,
//                 children: [
//                     {
//                         index: true,
//                         element: <WorkspaceHome />,
//                     },
//                     {
//                         path: "app",
//                         element: <ChatWorkspace />,
//                     },
//                     {
//                         path: "app/chat/:chatId",
//                         element: <ChatWorkspace />,
//                     },
//                 ],
//             },
//         ],
//     },
// ]);





import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "../components/layout/AppShell";
import { ChatWorkspace } from "../features/chat/pages/ChatWorkspace";
import { WorkspaceHome } from "../pages/WorkspaceHome";

import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import { AuthInitializer } from "../features/auth/components/AuthInitializer";
import LoginPage from "../features/auth/pages/LoginPage";

export const router = createBrowserRouter([
    // Public routes
    {
        path: "/login",
        element: (
            <>
                <AuthInitializer />
                <LoginPage />
            </>
        ),
    },

    // Protected application routes
    {
        element: (
            <>
                <AuthInitializer />
                <ProtectedRoute />
            </>
        ),
        children: [
            {
                path: "/",
                element: <AppShell />,
                children: [
                    {
                        index: true,
                        element: <WorkspaceHome />,
                    },
                    {
                        path: "app",
                        element: <ChatWorkspace />,
                    },
                    {
                        path: "app/chat/:chatId",
                        element: <ChatWorkspace />,
                    },
                    {
                        path: "chat/:chatId",
                        element: <ChatWorkspace />,
                    },
                ],
            },
        ],
    },
]);