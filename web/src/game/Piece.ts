import { Pieces } from "../types";
import {
  bishop_direction,
  king_moves,
  knight_directions,
  queen_directions,
  rook_directions,
} from "../utils/contants";
import { Board } from "./Board";

export class Piece {
  x: number;
  y: number;
  name: string;
  playerId: string;
  hasMoved: boolean = false;
  isWhite: boolean;
  Board: Board;

  constructor(
    x: number,
    y: number,
    name: string,
    playerId: string,
    isWhite: boolean,
    Board: Board
  ) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.playerId = playerId;
    this.isWhite = isWhite;
    this.Board = Board;
  }

  getMoves(pieces: Pieces, check: boolean, opponentId?: string): number[][] {
    let moves: number[][] = [];

    if (this.name === "P")
      moves = [...moves, ...this.getPawnMoves(pieces, opponentId)];
    else if (this.name === "N")
      moves = [...moves, ...this.getKnightMoves(pieces, opponentId)];
    else if (this.name === "B")
      moves = [...moves, ...this.getBishopMoves(pieces, opponentId)];
    else if (this.name === "Q")
      moves = [...moves, ...this.getQueenMoves(pieces, opponentId)];
    else if (this.name === "R")
      moves = [...moves, ...this.getRookMoves(pieces, opponentId)];
    else if (this.name === "K")
      moves = [
        ...moves,
        ...this.getKingMoves(pieces, opponentId),
        ...(check ? this.getCastleMoves(pieces, opponentId) : []),
      ];

    return moves;
  }

  getMovesWithDirections(
    pieces: Pieces,
    directions: number[][],
    opponentId: string | undefined
  ): number[][] {
    const moves: number[][] = [];

    let isOpponent = (playerId: string): boolean => {
      if (opponentId) return playerId === opponentId;
      return playerId !== this.playerId;
    };

    for (const [i, j] of directions) {
      for (let idx = 0; idx < 7; idx++) {
        const [new_i, new_j] = [this.x + (idx + 1) * i, this.y + (idx + 1) * j];

        if (new_i >= 0 && new_i <= 7 && new_j >= 0 && new_j <= 7) {
          if (pieces[new_i][new_j] instanceof Piece) {
            if (isOpponent((pieces[new_i][new_j] as Piece).playerId))
              moves.push([new_i, new_j]);

            break;
          } else moves.push([new_i, new_j]);
        }
      }
    }

    return moves;
  }

  getKingMoves(pieces: Pieces, opponentId: string | undefined): number[][] {
    const moves: number[][] = [];

    let isOpponent = (playerId: string): boolean => {
      if (opponentId) return playerId === opponentId;
      return playerId !== this.playerId;
    };

    for (const [i, j] of king_moves) {
      const [new_i, new_j] = [this.x + i, this.y + j];

      if (new_i >= 0 && new_i <= 7 && new_j >= 0 && new_j <= 7) {
        if (pieces[new_i][new_j] instanceof Piece) {
          if (isOpponent((pieces[new_i][new_j] as Piece).playerId))
            moves.push([new_i, new_j]);
        } else moves.push([new_i, new_j]);
      }
    }

    return moves;
  }

  getQueenMoves = (
    pieces: Pieces,
    opponentId: string | undefined
  ): number[][] =>
    this.getMovesWithDirections(pieces, queen_directions, opponentId);

  getBishopMoves = (
    pieces: Pieces,
    opponentId: string | undefined
  ): number[][] =>
    this.getMovesWithDirections(pieces, bishop_direction, opponentId);

  getRookMoves = (
    pieces: Pieces,
    opponentId: string | undefined
  ): number[][] => {
    return this.getMovesWithDirections(pieces, rook_directions, opponentId);
  };

  getCastleMoves(pieces: Pieces, opponentId: string | undefined): number[][] {
    const moves: number[][] = [];

    if (this.hasMoved) return moves;

    const rookPositions: number[][] = this.getRookPositions(pieces),
      kingPos = [this.x, this.y];

    if (this.Board.isCheck({ pieces })) return moves;

    for (const [i, j] of rookPositions) {
      if ((pieces[i][j] as Piece).hasMoved) continue;

      const [idx, max] = [i, this.x].sort((a, b) => a - b);
      let currIdx: number = idx + 1,
        isValid: boolean = true;

      while (currIdx < max) {
        if (pieces[currIdx][j] instanceof Piece) {
          isValid = false;
          break;
        }

        currIdx += 1;
      }

      if (isValid)
        for (let newX = 1; newX < 3; newX++) {
          let x = this.x + newX;
          if (i - this.x === -4) x = this.x - newX;

          pieces[x][j] = pieces[kingPos[0]][this.y];
          [pieces[x][this.y].x, pieces[x][this.y].y] = [x, this.y];

          pieces[kingPos[0]][this.y] = 0;

          const checked = this.Board.isCheck({ pieces, kingPos: [x, j] });

          pieces[kingPos[0]][this.y] = pieces[x][this.y];
          [pieces[kingPos[0]][this.y].x, pieces[kingPos[0]][this.y].y] = [
            kingPos[0],
            this.y,
          ];

          pieces[x][j] = 0;

          if (checked) {
            isValid = false;
            break;
          }
        }

      if (isValid) {
        if (i - this.x == -4) moves.push([this.x - 2, j]);
        else moves.push([this.x + 2, j]);
      }
    }

    return moves;
  }

  getKnightMoves(pieces: Pieces, opponentId: string | undefined): number[][] {
    const moves: number[][] = [];

    let isOpponent = (playerId: string): boolean => {
      if (opponentId) return playerId === opponentId;
      return playerId !== this.playerId;
    };

    for (const [i, j] of knight_directions) {
      const [new_i, new_j] = [this.x + i, this.y + j];

      if (new_i >= 0 && new_i <= 7 && new_j >= 0 && new_j <= 7)
        if (pieces[new_i][new_j] instanceof Piece) {
          if (isOpponent((pieces[new_i][new_j] as Piece).playerId))
            moves.push([new_i, new_j]);
        } else moves.push([new_i, new_j]);
    }

    return moves;
  }

  getPawnMoves(pieces: Pieces, opponentId: string | undefined): number[][] {
    const moves: number[][] = [];

    let isOpponent = (playerId: string): boolean => {
      if (opponentId) return playerId === opponentId;
      return playerId !== this.playerId;
    };

    if (this.isWhite) {
      if (!(pieces[this.x][this.y - 1] instanceof Piece)) {
        moves.push([this.x, this.y - 1]);

        if (!this.hasMoved && !(pieces[this.x][this.y - 2] instanceof Piece))
          moves.push([this.x, this.y - 2]);
      }

      if (
        this.x - 1 >= 0 &&
        pieces[this.x - 1][this.y - 1] instanceof Piece &&
        isOpponent((pieces[this.x - 1][this.y - 1] as Piece).playerId)
      )
        moves.push([this.x - 1, this.y - 1]);

      if (
        this.x + 1 <= 7 &&
        pieces[this.x + 1][this.y - 1] instanceof Piece &&
        isOpponent((pieces[this.x + 1][this.y - 1] as Piece).playerId)
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
        isOpponent((pieces[this.x - 1][this.y + 1] as Piece).playerId)
      )
        moves.push([this.x - 1, this.y + 1]);

      if (
        this.x + 1 <= 7 &&
        pieces[this.x + 1][this.y + 1] instanceof Piece &&
        isOpponent((pieces[this.x + 1][this.y + 1] as Piece).playerId)
      )
        moves.push([this.x + 1, this.y + 1]);
    }

    return moves;
  }

  getRookPositions(pieces: Pieces): number[][] {
    const positions: number[][] = [];

    for (let i = 0; i <= 7; i++) {
      for (let j = 0; j <= 7; j++) {
        if (
          pieces[i][j] instanceof Piece &&
          (pieces[i][j] as Piece).name === "R" &&
          (pieces[i][j] as Piece).playerId === this.playerId
        )
          positions.push([i, j]);
      }
    }

    return positions;
  }
}
