import initialBoard from "../initialBoard.json";
import { User } from "../types";
import { Piece } from "./Piece";

export class Board {
  pieces: Array<(Piece | 0)[]>;
  gameStarted: boolean;
  players?: { white: User; black: User };

  constructor() {
    this.gameStarted = false;
    this.pieces = Array(8)
      .fill(0)
      .map((_) => Array(8).fill(0));

    for (const i in this.pieces)
      for (const j in this.pieces[i])
        if (typeof initialBoard[j][i] === "string" && initialBoard[j][i] !== 0)
          this.pieces[i][j] = new Piece(
            Number(i),
            Number(j),
            initialBoard[j][i] as string
          );
  }

  reset() {}
}
