import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function useSocket() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const s = io("http://localhost:3000", {
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
