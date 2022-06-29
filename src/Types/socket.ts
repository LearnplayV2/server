import type { Request } from "express";
import type { Server } from "socket.io";

export interface SocketRequest extends Request {
    io: Server;
}