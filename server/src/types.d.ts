import { GameHandler } from "./GameHandler";

export interface User {
  name: string | null;
  id: string;
}

export interface GameType {
  id: string;
  players: User[];
  gameHandler: GameHandler | null;
}
