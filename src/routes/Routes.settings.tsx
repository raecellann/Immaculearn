import ProfilePage from "../pages/AccSettings/accsettingspage.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

export const SettingsRoutes = [
  {
    key: "settings",
    path: "/settings",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
];
