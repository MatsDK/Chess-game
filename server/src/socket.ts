import { Socket, Server } from "socket.io";
import { GameHandler } from "./GameHandler";
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

    io.to(gameData.id).emit("players", thisGame.players);

    if (thisGame.players.length === 2)
      thisGame.gameHandler = new GameHandler(
        {
          white: thisGame.players[0],
          black: thisGame.players[1],
        },
        thisGame,
        io
      );
  });

  socket.on("disconnect", () => {
    users.delete(socket.id);

    for (const [id, game] of games.entries())
      if (game.players.find((player: User) => player.id === socket.id)) {
        const thisGame = games.get(id)!;

        games.set(id, {
          id,
          gameHandler: null,
          //   gameHandler: thisGame.gameHandler,
          players: thisGame.players.filter(
            (player: User) => player.id !== socket.id
          ),
        });
      }
  });
});
