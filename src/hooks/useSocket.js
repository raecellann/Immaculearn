import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import config from "../config";

export default function useSocket() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const baseUrl =
      config.VITE_ENV === "production"
        ? config.SOCKET_URL
        : "http://localhost:3000";
    const s = io(baseUrl, {
      transports: ["websocket"], // 👈 force WS (once backend is correct)
      autoConnect: true,
    });

    setSocket(s);

    s.on("connect", () => {
      console.log("✅ socket connected:", s.id);
      setIsConnected(true);
    });

    s.on("disconnect", () => {
      console.log("❌ socket disconnected");
      setIsConnected(false);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  return { socket, isConnected };
}
