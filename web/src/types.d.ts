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

export type Pieces = Array<(Piece | 0)[]>;

export type PiecePos = { x: number; y: number };

export type PieceMoveObj = { from: PiecePos; to: PiecePos };
