import { Socket } from "socket.io-client";
import { PiecePos, Pieces, User } from "../types";
import { Piece } from "./Piece";

export class Board {
  pieces: Pieces = [];
  gameStarted: boolean;
  players?: { white: User; black: User };
  activePlayer?: string;
  me?: User;
  opponent?: User;
  selected?: Piece | null;
  socket?: Socket;
  validMoves?: number[][];

  constructor() {
    this.gameStarted = false;
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
            thisPiece.playerId,
            thisPiece.playerId === this.players?.white.id
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
      this.validMoves = [];
    } else if (
      this.activePlayer === this.me?.id &&
      this.selected &&
      this.validMoves?.find(([x1, y1]) => x1 === x && y1 === y)
    ) {
      this.socket?.emit("move", {
        from: { x: this.selected.x, y: this.selected.y },
        to: { x, y },
      });

      this.selected.hasMoved = true;

      this.selected = null;
      this.validMoves = [];
    } else if (
      this.activePlayer === this.me?.id &&
      this.pieces[x][y] instanceof Piece &&
      (this.pieces[x][y] as Piece).playerId === this.me?.id
    ) {
      this.selected = this.pieces[x][y];
      this.validMoves = (this.pieces[x][y] as Piece).getMoves(this.pieces);
    }

    return this.selected
      ? [[this.selected.x, this.selected.y], ...(this.validMoves || [])]
      : [];
  }

  movePiece(from: PiecePos, to: PiecePos) {
    if (this.pieces[from.x][from.y] instanceof Piece)
      [
        (this.pieces[from.x][from.y] as Piece).x,
        (this.pieces[from.x][from.y] as Piece).y,
      ] = [to.x, to.y];

    this.pieces[to.x][to.y] = this.pieces[from.x][from.y];

    this.pieces[from.x][from.y] = 0;
  }

  isCheckMate(): boolean {
    if (!this.isCheck({})) return false;

    for (let i = 0; i <= 7; i++) {
      for (let j = 0; j <= 7; j++) {
        const thisPiece = this.pieces[i][j];

        if (!(thisPiece instanceof Piece) || thisPiece.playerId !== this.me?.id)
          continue;

        for (const [x, y] of thisPiece.getMoves(this.pieces)) {
          [thisPiece.x, thisPiece.y] = [x, y];
          this.pieces[x][y] = this.pieces[i][j];
          this.pieces[i][j] = 0;

          const checked = this.isCheck({ pieces: this.pieces });

          this.pieces[i][j] = this.pieces[x][y];
          this.pieces[x][y] = 0;
          [thisPiece.x, thisPiece.y] = [i, j];

          if (!checked) return false;
        }
      }
    }

    return true;
  }

  isCheck({ pieces = this.pieces }: { pieces?: Pieces }): boolean {
    if (!pieces.length || !this.me) return false;
    const kingPos = this.getKingPos(pieces),
      attacks: number[][] = [];

    for (let i = 0; i <= 7; i++) {
      for (let j = 0; j <= 7; j++) {
        const thisPiece = pieces[i][j];

        if (
          thisPiece instanceof Piece &&
          (thisPiece as Piece).playerId !== this.me?.id &&
          kingPos &&
          thisPiece
            .getMoves(pieces, this.me?.id)
            .find(([x, y]) => x === kingPos[0] && y === kingPos[1])
        )
          attacks.push([i, j]);
      }
    }

    return !!attacks.length;
  }

  getKingPos(pieces: Pieces): number[] | undefined {
    for (let i = 0; i <= 7; i++) {
      for (let j = 0; j <= 7; j++) {
        const thisPiece = pieces[i][j];

        if (
          thisPiece instanceof Piece &&
          (thisPiece as Piece).playerId === this.me?.id &&
          thisPiece.name === "K"
        )
          return [i, j];
      }
    }

    return;
  }

  reset() {
    this.pieces = [];
  }
}
