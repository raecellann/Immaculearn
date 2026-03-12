/* eslint no-restricted-globals: ["error", "event"] */
/* global document */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ToastContainer } from "react-toastify";

import Routes from "./Routes.tsx";
import { SpaceThemeProvider } from "./contexts/theme/spaceThemeContextProvider";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SpaceThemeProvider>
        <BrowserRouter>
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
        </BrowserRouter>
    </SpaceThemeProvider>
  </StrictMode>
);
