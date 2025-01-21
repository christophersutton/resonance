import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage.tsx";
import SignInPage from "../pages/auth/SignInPage.tsx";
import SignUpPage from "../pages/auth/SignUpPage.tsx";
import AuthCallback from "../pages/auth/AuthCallback.tsx";
import ProtectedPage from "../pages/ProtectedPage.tsx";
import NotFoundPage from "../pages/404Page.tsx";
import AuthProtectedRoute from "./AuthProtectedRoute.tsx";
import Providers from "../Providers.tsx";
import { AddClient } from "../pages/AddClient.tsx";
import { ClientPage } from "../pages/ClientPage.tsx";
import App from "../App.tsx";

const router = createBrowserRouter([
  // I recommend you reflect the routes here in the pages folder
  {
    path: "/",
    element: <Providers />,
    children: [
      {
        path: "/",
        element: <App />,
        children: [
          // Public routes
          {
            path: "/",
            element: <HomePage />,
          },
          {
            path: "/auth/sign-in",
            element: <SignInPage />,
          },
          {
            path: "/auth/sign-up",
            element: <SignUpPage />,
          },
          {
            path: "/auth/callback",
            element: <AuthCallback />,
          },
          // Auth Protected routes
          {
            path: "/",
            element: <AuthProtectedRoute />,
            children: [
              {
                path: "/protected",
                element: <ProtectedPage />,
              },
              {
                path: "/add-client",
                element: <AddClient />,
              },
              {
                path: "/clients/:id",
                element: <ClientPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
