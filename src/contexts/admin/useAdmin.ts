import { useContext } from "react";
import { AdminContext, AdminContextType } from "./adminContext";

export const useAdmin = (): AdminContextType => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error("useAdmin must be used within a AdminProvider");
    }
    return context;
};
