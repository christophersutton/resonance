import { createBrowserRouter } from "react-router-dom";
import SignInPage from "../pages/auth/SignInPage";
import SignUpPage from "../pages/auth/SignUpPage";
import AuthCallback from "../pages/auth/AuthCallback";
import NotFoundPage from "../pages/404Page";
import AuthProtectedRoute from "./AuthProtectedRoute";
import Providers from "../Providers";
import { AddClient } from "../pages/AddClient";
import { ClientPage } from "../pages/ClientPage";
import App from "../App";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardPage from "../pages/DashboardPage";
import ClientsPage from "../pages/ClientsPage";
import { ClientProvider } from "../context/ClientContext";

// Tickets
import TicketsListPage from "../pages/tickets/TicketsListPage";
import TicketDetailPage from "../pages/tickets/TicketDetailPage";

const router = createBrowserRouter([
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
                element: (
                  <ClientProvider>
                    <DashboardLayout />
                  </ClientProvider>
                ),
                children: [
                  {
                    path: "/",
                    element: <DashboardPage />,
                  },
                  {
                    path: "/dashboard",
                    element: <DashboardPage />,
                  },
                  {
                    path: "/clients",
                    element: <ClientsPage />,
                  },
                  {
                    path: "/add-client",
                    element: <AddClient />,
                  },
                  {
                    path: "/clients/:id",
                    element: <ClientPage />,
                  },
                  {
                    path: "/tickets",
                    element: <TicketsListPage />,
                  },
                  {
                    path: "/tickets/:id",
                    element: <TicketDetailPage />,
                  },
                ],
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