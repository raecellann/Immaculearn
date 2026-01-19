import { io } from "socket.io-client";

const sockets = {};

export function getSpaceChat(spaceUuid) {
  if (sockets[spaceUuid]) return sockets[spaceUuid];

  const socket = io("http://localhost:3000", {
    transports: ["websocket"],
  });

  socket.emit("join-space", spaceUuid);

  const api = {
    socket,

    sendMessage(message) {
      socket.emit("space-message", {
        spaceUuid,
        message,
      });
    },

    onMessage(cb) {
      socket.on("space-message", cb);
    },

    destroy() {
      socket.disconnect();
    },
  };

  sockets[spaceUuid] = api;
  return api;
}
