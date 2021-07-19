import { Socket, Server } from "socket.io";
import { GameHandler, SocketsType } from "./GameHandler";
import { games, users } from "./games";
import { GameType, User } from "./types";

export const io: Server = require("socket.io")(8001, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket: Socket) => {
  users.set(socket.id, { name: null, id: socket.id });

  socket.on("game", (gameData) => {
    if (users.has(socket.id))
      users.set(socket.id, { name: gameData.name, id: socket.id });

    if (games.has(gameData.id)) {
      const thisGame = games.get(gameData.id)!;

      games.set(gameData.id, {
        id: gameData.id,
        gameHandler: thisGame.gameHandler,
        players: [...thisGame.players, users.get(socket.id) as User],
      });
    } else
      games.set(gameData.id, {
        id: gameData.id,
        gameHandler: null,
        players: [users.get(socket.id) as User],
      });

    socket.join(gameData.id);

    const thisGame: GameType = games.get(gameData.id)!;

    const thesePlayers = [...thisGame.players],
      playerIdx = thisGame.players.findIndex(
        (player) => player.id === socket.id
      );

    if (playerIdx != null)
      thesePlayers[playerIdx] = {
        ...thisGame.players[playerIdx],
        me: true,
      };

    io.to(socket.id).emit("players", thesePlayers);
    io.to(thisGame.players.find((player) => !player.me)!.id).emit(
      "players",
      thisGame.players
    );

    const sockets = io.sockets.sockets.entries(),
      userSockets: SocketsType = { black: null, white: null };

    for (const [id, _] of sockets) {
      if (id === thisGame.players[0]?.id) userSockets.white = _;
      if (id === thisGame.players[1]?.id) userSockets.black = _;
    }

    if (thisGame.players.length === 2) {
      thisGame.gameHandler = new GameHandler(
        {
          white: thisGame.players[0],
          black: thisGame.players[1],
        },
        thisGame,
        io,
        userSockets
      );

      io.to(thisGame.id).emit(
        "startGame",
        thisGame.gameHandler.players,
        thisGame.gameHandler.pieces
      );
    }
  });

  socket.on("disconnect", () => {
    users.delete(socket.id);

    for (const [id, game] of games.entries())
      if (game.players.find((player: User) => player.id === socket.id)) {
        const thisGame = games.get(id)!;

        games.set(id, {
          id,
          gameHandler: null,
          players: thisGame.players.filter(
            (player: User) => player.id !== socket.id
          ),
        });

        io.to(thisGame.id).emit("disconnectedPlayer", games.get(id)!.players);
        socket.leave(thisGame.id);
      }
  });
});
