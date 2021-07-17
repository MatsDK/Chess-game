import { GameType, User } from "./types";
import { Server } from "socket.io";

type PlayersType = { black: User; white: User };

export class GameHandler {
  players: PlayersType;
  game: GameType;
  io: Server;

  constructor(players: PlayersType, game: GameType, io: Server) {
    this.players = players;
    this.game = game;
    this.io = io;
    console.log(this.game);
  }
}
