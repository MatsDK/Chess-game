import { Socket } from "socket.io";
import { GameHandler } from "./GameHandler";

export interface User {
  name: string | null;
  id: string;
  me?: boolean;
}

export interface GameType {
  id: string;
  players: User[];
  gameHandler: GameHandler | null;
}
