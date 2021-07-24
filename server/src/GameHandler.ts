import { GameType, User } from "./types";
import { Server, Socket } from "socket.io";
import initialBoard from "./initialBoard.json";

export type SocketsType = { black: Socket | null; white: Socket | null };
type PlayersType = { black: User; white: User };
type PiecePos = { x: number; y: number };

export class GameHandler {
  players: PlayersType;
  game: GameType;
  sockets: SocketsType;
  io: Server;
  pieces: Array<(Piece | 0)[]> = Array(8)
    .fill(0)
    .map((_) => Array(8).fill(0));
  activePlayer: string = "";

  constructor(
    players: PlayersType,
    game: GameType,
    io: Server,
    sockets: SocketsType
  ) {
    this.players = players;
    this.game = game;
    this.io = io;
    this.sockets = sockets;

    for (const i in this.pieces)
      for (const j in this.pieces[i])
        if (typeof initialBoard[j][i] === "string" && initialBoard[j][i] !== 0)
          this.pieces[i][j] = new Piece(
            Number(i),
            Number(j),
            initialBoard[j][i] as string,
            Number(j) === 7 || Number(j) === 6
              ? this.players.white.id
              : this.players.black.id
          );

    this.setActivePlayer(this.players.white.id);

    for (const socket of Object.values(this.sockets)) {
      socket?.on("move", (moves) => this.move(moves));
      socket?.on("checkmate", (playerId) => this.checkMate(playerId));
      socket?.on("newGame", () => this.newGame());
      socket?.on("pawnPromotion", (move, name) =>
        this.move([{ ...move, name }])
      );
    }
  }

  newGame() {
    const tmp = this.players.white;
    this.players.white = this.players.black;
    this.players.black = tmp;

    this.setActivePlayer(this.players.white.id);

    this.pieces = Array(8)
      .fill(0)
      .map((_) => Array(8).fill(0));

    for (const i in this.pieces)
      for (const j in this.pieces[i])
        if (typeof initialBoard[j][i] === "string" && initialBoard[j][i] !== 0)
          this.pieces[i][j] = new Piece(
            Number(i),
            Number(j),
            initialBoard[j][i] as string,
            Number(j) === 7 || Number(j) === 6
              ? this.players.white.id
              : this.players.black.id
          );

    this.io.to(this.game.id).emit("startGame", this.players, this.pieces);
  }

  checkMate(playerId: string | undefined) {
    this.io.to(this.game.id).emit("endGame");
  }

  setActivePlayer(playerId?: string) {
    if (!playerId) playerId = this.getNextActivePlayer();

    this.io.to(this.game.id).emit("setActivePlayer", playerId);
    this.io.to(playerId).emit("check");

    this.activePlayer = playerId;
  }

  getNextActivePlayer(): string {
    if (this.activePlayer === this.players.white.id)
      return this.players.black.id;
    else return this.players.white.id;
  }

  move(moves: { from: PiecePos; to: PiecePos; name?: string }[]) {
    for (const { from, to, name } of moves) {
      [this.pieces[from.x][from.y], this.pieces[to.x][to.y]] = [
        0,
        this.pieces[from.x][from.y],
      ];

      if (name) (this.pieces[to.x][to.y] as Piece).name = name;

      this.io.to(this.game.id).emit("movePiece", from, to, name);
    }

    this.setActivePlayer();
  }
}

class Piece {
  x: number;
  y: number;
  name: string;
  playerId: string;

  constructor(x: number, y: number, name: string, playerId: string) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.playerId = playerId;
  }
}
