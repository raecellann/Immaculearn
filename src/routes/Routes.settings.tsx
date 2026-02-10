import ProfilePage from "../pages/AccountSettings/accountsettingspage.jsx";
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
