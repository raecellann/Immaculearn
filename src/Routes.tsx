import React, { ReactNode } from "react";
import { Routes as ReactRoutes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthRoutes } from "./routes/Routes.auth";
import { StudentRoutes } from "./routes/Routes.student";
import { SpaceRoutes } from "./routes/Routes.space";
import { AdminDataRoutes } from "./routes/Routes.adminDashboard.tsx";
// import { AdminRoutes } from "./routes/Routes.admin";
import { ProfRoutes } from "./routes/Routes.professor.js";
import PageNotFound from "./pages/PageNotFound/pageNotFound.jsx";
import { UserProvider } from "./contexts/user/userContextProvider.tsx";
import { SpaceProvider } from "./contexts/space/spaceContextProvider.tsx";
import { NotificationProvider } from "./contexts/notification/notificationContextProvider.tsx";
import LandingPage from "./pages/Landing/landingPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import NotificationContainer from "./components/Notification/NotificationContainer.jsx";
// import NotificationExample from "./examples/NotificationExample.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function Routes() {
  return (
    <NotificationProvider>
      <QueryClientProvider client={queryClient}>
        <ReactRoutes>
          <Route key="landing" path="/" element={<LandingPage />} />,
          {/* Public/Auth routes - no SpaceProvider needed */}
          {/* {AuthRoutes.map(route => (
            <Route
              key={route.key}
              path={route.path}
              element={route.element}
            />
          ))} */}
          {AuthRoutes.map((route) => (
            <Route key={route.key} path={route.path} element={route.element} />
          ))}
          {StudentRoutes.map((route) => (
            <Route
              key={route.key}
              path={route.path}
              element={
                <UserProvider>
                  <SpaceProvider>
                    <ProtectedRoute>{route.element}</ProtectedRoute>
                  </SpaceProvider>
                </UserProvider>
              }
            />
          ))}
          {SpaceRoutes.map((route) => (
            <Route
              key={route.key}
              path={route.path}
              element={
                <UserProvider>
                  <SpaceProvider>
                    <ProtectedRoute>{route.element}</ProtectedRoute>
                  </SpaceProvider>
                </UserProvider>
              }
            />
          ))}
          <Route
            path="/prof/*"
            element={
              <UserProvider>
                <SpaceProvider>
                  <ProtectedRoute>
                    <ProfRoutes />
                  </ProtectedRoute>
                </SpaceProvider>
              </UserProvider>
            }
          />
          {/* {AdminRoutes.map(route => (
            <Route
              key={route.key}
              path={route.props.path}
              element={
                <UserProvider>
                  <SpaceProvider>
                    {route.props.element}
                  </SpaceProvider>
                </UserProvider>
              }
            />
          ))} */}
          {AdminDataRoutes.map((route) => (
            <Route
              key={route.key}
              path={route.path}
              element={
                <UserProvider>
                  <SpaceProvider>{route.element}</SpaceProvider>
                </UserProvider>
              }
            />
          ))}
          {/* <Route path="/example/notification" element={<NotificationExample />} /> */}
          {/* Fallback */}
          <Route path="*" element={<PageNotFound />} />
        </ReactRoutes>

        {/* Global Notification Container */}
        <NotificationContainer />
      </QueryClientProvider>
    </NotificationProvider>
  );
}
