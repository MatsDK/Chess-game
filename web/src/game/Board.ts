import { Socket } from "socket.io-client";
import { PiecePos, Pieces, User } from "../types";
import { Piece } from "./Piece";

export class Board {
  pieces: Pieces;
  gameStarted: boolean;
  players?: { white: User; black: User };
  activePlayer?: string;
  me?: User;
  opponent?: User;
  selected?: Piece | null;
  socket?: Socket;

  constructor() {
    this.gameStarted = false;
    this.pieces = [];
  }

  setPieces(pieces: Pieces) {
    for (const i in pieces)
      for (const j in pieces[i])
        if (typeof pieces[i][j] != "number") {
          const thisPiece = pieces[i][j] as Piece;
          pieces[i][j] = new Piece(
            thisPiece.x,
            thisPiece.y,
            thisPiece.name,
            thisPiece.playerId
          );
        }

    this.pieces = pieces;
  }

  setSocket(socket: Socket) {
    this.socket = socket;
  }

  setActivePlayer(playerId: string) {
    this.activePlayer = playerId;
  }

  click(x: number, y: number) {
    if (this.pieces[x][y] === this.selected) {
      this.selected = null;
    } else if (this.activePlayer === this.me?.id && this.selected) {
      this.socket?.emit("move", {
        from: { x: this.selected.x, y: this.selected.y },
        to: { x, y },
      });

      this.selected = null;
    } else if (
      this.activePlayer === this.me?.id &&
      this.pieces[x][y] instanceof Piece &&
      (this.pieces[x][y] as Piece).playerId === this.me?.id
    ) {
      this.selected = this.pieces[x][y];
    }
  }

  movePiece(from: PiecePos, to: PiecePos) {
    [
      (this.pieces[from.x][from.y] as Piece).x,
      (this.pieces[from.x][from.y] as Piece).y,
    ] = [to.x, to.y];
    this.pieces[to.x][to.y] = this.pieces[from.x][from.y];

    this.pieces[from.x][from.y] = 0;
  }

  reset() {}
}
