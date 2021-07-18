export interface User {
  id: string;
  name: string;
  me?: boolean;
}

export interface GameType {
  id: string;
  players: Array<User>;
}

export interface PlayersObject {
  white: User;
  black: User;
}
