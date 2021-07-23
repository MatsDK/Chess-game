import socketio from "socket.io-client";
import React from "react";

export const socket = socketio(`${process.env.REACT_APP_SOCKETIO_SERVER_URL}`);
export const SocketContext = React.createContext<any>(null);
