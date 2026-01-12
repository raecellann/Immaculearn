// routes/AuthRoutes.tsx
import React from "react";
import { Route } from "react-router";
import LoginPage from "../pages/SignIn/signInPage.jsx";
import Onboarding from "../pages/SignIn/onBoardingPage.jsx";
import OAuthCallback from "../pages/SignIn/oauthCallbackPage.jsx";
// import { SignInPageWithOAuth } from "../pages/test-page/signInPageWithOAuth.jsx";
import { UserProvider } from "../contexts/user/userContextProvider.js";

export const AuthRoutes = [
  {
    key: "/oauth/callback",
    path: "/oauth/callback",
    element: <OAuthCallback />,
  },
  {
    key: "/login",
    path: "/login",
    element: (
      <UserProvider>
        <LoginPage />
      </UserProvider>
    ),
  },
  {
    key: "/onboarding",
    path: "/onboarding",
    element: (
      <UserProvider>
        <Onboarding />
      </UserProvider>
    ),
  },
];
