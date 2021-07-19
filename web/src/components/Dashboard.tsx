import axios from "axios";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { GameType } from "../types";

const GamesDashboard = () => {
  const [name, setName] = useState<string | null>(null);
  const [redirect, setRedirect] = useState<boolean>(false);
  const [games, setGames] = useState<GameType[]>([]);

  const history = useHistory();

  useEffect(() => {
    try {
      const config: string | null = localStorage.getItem("config");

      if (!config || !JSON.parse(config).name) return setRedirect(true);

      setName(JSON.parse(config).name);
    } catch {
      return setRedirect(true);
    }

    axios.get("http://localhost:8000/api/games").then((res) => {
      setGames(res.data.games);
    });

    return () => {};
  }, []);

  if (redirect) return <Redirect to="/" />;
  console.log(games);

  return (
    <div>
      <div>name: {name}</div>
      <button
        onClick={() => {
          history.push(`/game/${nanoid()}`);
        }}
      >
        new Game
      </button>
      {games.map((game: GameType, idx: number) => (
        <div key={idx} style={{ display: "flex" }}>
          <p>game from: {game.players[0].name}</p>
          <button
            onClick={() => {
              history.push(`/game/${game.id}`);
            }}
          >
            Join
          </button>
        </div>
      ))}
    </div>
  );
};

export default GamesDashboard;
