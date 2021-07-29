import { Socket } from "socket.io-client";
import { PieceMoveObj, PiecePos, Pieces, User } from "../types";
import { Piece } from "./Piece";

export class Board {
  pieces: Pieces = [];
  gameStarted: boolean = false;
  players?: { white: User; black: User };
  activePlayer?: string;
  me?: User;
  opponent?: User;
  selected?: Piece | null;
  socket?: Socket;
  validMoves?: number[][];
  promotionMenu?: (move: PieceMoveObj) => void;

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
            thisPiece.playerId === this.players?.white.id,
            this
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
      if (
        this.selected.name === "P" &&
        ((this.selected.playerId === this.players?.white.id && y === 0) ||
          (this.selected.playerId === this.players?.black.id && y === 7)) &&
        this.promotionMenu
      ) {
        this.promotionMenu({
          from: { x: this.selected.x, y: this.selected.y },
          to: { x, y },
        });
        return [[this.selected.x, this.selected.y], ...this.validMoves];
      }

      const moves = [
        {
          from: { x: this.selected.x, y: this.selected.y },
          to: { x, y },
        },
      ];

      if (this.selected.name === "K" && Math.abs(this.selected.x - x) === 2) {
        if (x === 2) moves.push({ from: { x: 0, y }, to: { x: 3, y } });
        else if (x === 6) moves.push({ from: { x: 7, y }, to: { x: 5, y } });
      }

      this.socket?.emit("move", moves);

      this.selected.hasMoved = true;

      this.selected = null;
      this.validMoves = [];
    } else if (
      this.activePlayer === this.me?.id &&
      this.pieces[x][y] instanceof Piece &&
      (this.pieces[x][y] as Piece).playerId === this.me?.id
    ) {
      this.selected = this.pieces[x][y];
      this.validMoves = (this.pieces[x][y] as Piece).getMoves(
        this.pieces,
        true
      );
    }

    return this.selected
      ? [[this.selected.x, this.selected.y], ...(this.validMoves || [])]
      : [];
  }

  movePiece(
    from: PiecePos,
    to: PiecePos,
    name: string | undefined
  ): number[][] {
    if (this.pieces[from.x][from.y] instanceof Piece)
      [
        (this.pieces[from.x][from.y] as Piece).x,
        (this.pieces[from.x][from.y] as Piece).y,
      ] = [to.x, to.y];

    this.pieces[to.x][to.y] = this.pieces[from.x][from.y];
    if (name) (this.pieces[to.x][to.y] as Piece).name = name;

    this.pieces[from.x][from.y] = 0;
    this.validMoves = [];
    this.selected = null;

    return [];
  }

  isCheckMate(): boolean {
    if (!this.isCheck({})) return false;

    for (let i = 0; i <= 7; i++) {
      for (let j = 0; j <= 7; j++) {
        const thisPiece = this.pieces[i][j];

        if (!(thisPiece instanceof Piece) || thisPiece.playerId !== this.me?.id)
          continue;

        for (const [x, y] of thisPiece.getMoves(this.pieces, false)) {
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

  isCheck({
    pieces = this.pieces,
    ...rest
  }: {
    pieces?: Pieces;
    kingPos?: number[];
  }): boolean {
    if (!pieces.length || !this.me) return false;
    const kingPos = rest.kingPos || this.getKingPos(pieces),
      attacks: number[][] = [];

    for (let i = 0; i <= 7; i++) {
      for (let j = 0; j <= 7; j++) {
        const thisPiece = pieces[i][j];

        if (
          thisPiece instanceof Piece &&
          (thisPiece as Piece).playerId !== this.me?.id &&
          kingPos &&
          thisPiece
            .getMoves(pieces, false, this.me?.id)
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

  pawnPromotion(move: PieceMoveObj, newName: string) {
    this.socket?.emit("pawnPromotion", move, newName);
  }

  reset() {
    this.pieces = [];
  }
}
