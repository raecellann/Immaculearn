import { useContext } from "react";
import { SpaceContext, SpaceContextType } from "./spaceContext";

export const useSpace = (): SpaceContextType => {
    const context = useContext(SpaceContext);
    if (!context) {
        throw new Error("useSpace must be used within a SpaceProvider");
    }
    return context;
};


