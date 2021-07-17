export interface User {
  id: string;
  name: string;
}

export interface GameType {
  id: string;
  players: Array<User>;
}
