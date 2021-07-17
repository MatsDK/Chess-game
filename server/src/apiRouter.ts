import { games } from "./games";
import { Request, Response, Router } from "express";
import { GameType } from "./types";
const apiRouter = Router();

apiRouter.get("/games", (req: Request, res: Response) => {
  res.json({
    games: Array.from(games)
      .map((game: any[]) => game[1])
      .filter((game: GameType) => game.players.length === 1),
  });
});

export { apiRouter };
