import { useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Socket } from "socket.io-client";
import { socket, SocketContext } from "./context/socket";
import Board from "./Board";
import { User } from "./types";

const GameView = () => {
  const [name, setName] = useState<string | null>(null);
  const { id }: { id: string } = useParams();

  const history = useHistory();

  useEffect(() => {
    try {
      const config: string | null = localStorage.getItem("config");

      if (!config || !JSON.parse(config).name) return history.push("/");

      setName(JSON.parse(config).name);
    } catch {
      history.push("/");
    }

    return () => {};
  }, [history]);

  return (
    <div>
      <SocketContext.Provider value={socket}>
        <Game id={id} name={name} />
      </SocketContext.Provider>
    </div>
  );
};

interface GameProps {
  name: string | null;
  id: string;
}

const Game: React.FC<GameProps> = ({ name, id }) => {
  const socket: Socket = useContext(SocketContext);
  const [players, setPlayers] = useState<User[]>([]);
  const [me, setMe] = useState<null | User>(null);

  useEffect(() => {
    if (name) socket.emit("game", { name, id });

    socket.on("players", (players) => {
      const me = players.find((player: User) => player.me);
      if (me) setMe(me);

      setPlayers(players);
    });

    return () => {};
  }, [name, id, socket]);

  return (
    <div>
      {players.map((user: User) => (
        <div key={user.id}>{user.name}</div>
      ))}
      {me && <Board me={me} />}
    </div>
  );
};

export default GameView;
