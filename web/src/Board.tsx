import { Socket } from "dgram";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "./context/socket";
import { Board as GameBoard } from "./game/Board";
import { Piece } from "./game/Piece";
import { User } from "./types";

interface Props {
  me: User;
}

const Board: React.FC<Props> = ({ me }) => {
  const socket: Socket = useContext(SocketContext);
  const [Board] = useState<GameBoard>(new GameBoard());
  //   const [players, setPlayers] = useState<any>(null);
  const [MePlayer, setMePlayer] = useState<User | null>(null);
  const [Opponent, setOpponent] = useState<User | null>(null);

  useEffect(() => {
    socket.on("startGame", (players) => {
      if (Board.gameStarted) Board.reset();

      const meIdx = players.findIndex((player: User) => player.id === me.id);
      if (meIdx != null) players[meIdx].me = true;

      Board.players = players;
      Board.gameStarted = true;

      setMePlayer(players[meIdx]);
      setOpponent(players[!meIdx ? 1 : 0]);

      //       setPlayers(players);
    });

    return () => {};
  }, [socket, Board, me]);

  return (
    <div style={{ display: "flex" }}>
      <div className="Board">
        {Board.pieces.map((x, idxX) => {
          return (
            <div key={idxX}>
              {x.map((y, idxY) => {
                const gray =
                  (idxX % 2 === 1 && idxY % 2 === 0) ||
                  (idxX % 2 === 0 && idxY % 2 === 1);

                let isPiece = false;
                if (y instanceof Piece) isPiece = true;

                return (
                  <div
                    key={`${idxX}-${idxY}`}
                    className={`cell ${gray ? "gray" : ""}`}
                  >
                    {" "}
                    {isPiece && (y as Piece).name}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          {Board.gameStarted && (
            <div>
              {Opponent && Opponent.name}
              {Opponent && Opponent.id}
            </div>
          )}
        </div>
        <div>
          {Board.gameStarted && (
            <div>
              {MePlayer && MePlayer.name}
              {MePlayer && MePlayer.id}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Board;
