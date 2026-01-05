/* eslint no-restricted-globals: ["error", "event"] */
/* global document */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import Routes from "./Routes.tsx";

import "./index.css";
import { UserProvider } from "./contexts/user/userContextProvider.tsx";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes />
      </UserProvider>
    </BrowserRouter>
  </StrictMode>
);
