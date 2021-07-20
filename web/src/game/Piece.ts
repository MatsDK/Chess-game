import { Pieces } from "../types";
import {
  bishop_direction,
  king_moves,
  knight_directions,
  queen_directions,
  rook_directions,
} from "../utils/contants";

export class Piece {
  x: number;
  y: number;
  name: string;
  playerId: string;
  hasMoved: boolean = false;
  isWhite: boolean;

  constructor(
    x: number,
    y: number,
    name: string,
    playerId: string,
    isWhite: boolean
  ) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.playerId = playerId;
    this.isWhite = isWhite;
  }

  getMoves(pieces: Pieces): number[][] {
    let moves: number[][] = [];

    if (this.name === "P") moves = [...moves, ...this.getPawnMoves(pieces)];
    else if (this.name === "N")
      moves = [...moves, ...this.getKnightMoves(pieces)];
    else if (this.name === "B")
      moves = [...moves, ...this.getBishopMoves(pieces)];
    else if (this.name === "R")
      moves = [...moves, ...this.getRookMoves(pieces)];
    else if (this.name === "K")
      moves = [...moves, ...this.getKingMoves(pieces)];
    else if (this.name === "Q")
      moves = [...moves, ...this.getQueenMoves(pieces)];

    return moves;
  }

  getMovesWithDirections(pieces: Pieces, directions: number[][]): number[][] {
    const moves: number[][] = [];

    for (const [i, j] of directions) {
      for (let idx = 0; idx < 7; idx++) {
        const [new_i, new_j] = [this.x + (idx + 1) * i, this.y + (idx + 1) * j];

        if (new_i >= 0 && new_i <= 7 && new_j >= 0 && new_j <= 7) {
          if (pieces[new_i][new_j] instanceof Piece) {
            if ((pieces[new_i][new_j] as Piece).playerId !== this.playerId)
              moves.push([new_i, new_j]);

            break;
          } else moves.push([new_i, new_j]);
        }
      }
    }

    return moves;
  }

  getKingMoves(pieces: Pieces): number[][] {
    const moves: number[][] = [];

    for (const [i, j] of king_moves) {
      const [new_i, new_j] = [this.x + i, this.y + j];

      if (new_i >= 0 && new_i <= 7 && new_j >= 0 && new_j <= 7) {
        if (pieces[new_i][new_j] instanceof Piece) {
          if ((pieces[new_i][new_j] as Piece).playerId !== this.playerId)
            moves.push([new_i, new_j]);
        } else moves.push([new_i, new_j]);
      }
    }

    return moves;
  }

  getQueenMoves = (pieces: Pieces): number[][] =>
    this.getMovesWithDirections(pieces, queen_directions);

  getRookMoves = (pieces: Pieces): number[][] =>
    this.getMovesWithDirections(pieces, rook_directions);

  getBishopMoves = (pieces: Pieces): number[][] =>
    this.getMovesWithDirections(pieces, bishop_direction);

  getKnightMoves(pieces: Pieces): number[][] {
    const moves: number[][] = [];

    for (const [i, j] of knight_directions) {
      const [new_i, new_j] = [this.x + i, this.y + j];

      if (new_i >= 0 && new_i <= 7 && new_j >= 0 && new_j <= 7)
        if (pieces[new_i][new_j] instanceof Piece) {
          if ((pieces[new_i][new_j] as Piece).playerId !== this.playerId)
            moves.push([new_i, new_j]);
        } else moves.push([new_i, new_j]);
    }

    return moves;
  }

  getPawnMoves(pieces: Pieces): number[][] {
    const moves: number[][] = [];

    if (this.isWhite) {
      if (!(pieces[this.x][this.y - 1] instanceof Piece)) {
        moves.push([this.x, this.y - 1]);

        if (!this.hasMoved && !(pieces[this.x][this.y - 2] instanceof Piece))
          moves.push([this.x, this.y - 2]);
      }

      if (
        this.x - 1 >= 0 &&
        pieces[this.x - 1][this.y - 1] instanceof Piece &&
        (pieces[this.x - 1][this.y - 1] as Piece).playerId !== this.playerId
      )
        moves.push([this.x - 1, this.y - 1]);

      if (
        this.x + 1 <= 7 &&
        pieces[this.x + 1][this.y - 1] instanceof Piece &&
        (pieces[this.x + 1][this.y - 1] as Piece).playerId !== this.playerId
      )
        moves.push([this.x + 1, this.y - 1]);
    } else {
      if (!(pieces[this.x][this.y + 1] instanceof Piece)) {
        moves.push([this.x, this.y + 1]);

        if (!this.hasMoved && !(pieces[this.x][this.y + 2] instanceof Piece))
          moves.push([this.x, this.y + 2]);
      }

      if (
        this.x - 1 >= 0 &&
        pieces[this.x - 1][this.y + 1] instanceof Piece &&
        (pieces[this.x - 1][this.y + 1] as Piece).playerId !== this.playerId
      )
        moves.push([this.x - 1, this.y + 1]);

      if (
        this.x + 1 <= 7 &&
        pieces[this.x + 1][this.y + 1] instanceof Piece &&
        (pieces[this.x + 1][this.y + 1] as Piece).playerId !== this.playerId
      )
        moves.push([this.x + 1, this.y + 1]);
    }

    return moves;
  }
}
