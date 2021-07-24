import { Socket } from "socket.io-client";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../context/socket";
import { Board as GameBoard } from "../game/Board";
import { Piece } from "../game/Piece";
import { PiecePos, Pieces, User } from "../types";
import { getFlippedBoard } from "../utils/flipBoard";
import { useForceUpdate } from "../utils/forceUpdate";
import pieces from "../assets/pieces.png";
import piecesOffset from "../assets/piecesOffset.json";
import {
  BoardWrapper,
  GameOverWrapper,
  GameInfoWrapper,
  UserWrapper,
  Cell,
} from "../ui/game";

interface Props {
  me: User;
}

const Board: React.FC<Props> = ({ me }) => {
  const forceUpdate = useForceUpdate();
  const socket: Socket = useContext(SocketContext);
  const [Board] = useState<GameBoard>(new GameBoard());
  const [MePlayer, setMePlayer] = useState<User | null>(null);
  const [Opponent, setOpponent] = useState<User | null>(null);
  const [flipBoard, setFlipBoard] = useState<boolean>(false);
  const [highlighted, setHighlighted] = useState<number[][]>([]);
  const [gameEnded, setGameEnded] = useState<boolean>(false);

  useEffect(() => {
    Board.setSocket(socket);

    socket.on("startGame", (players, pieces) => {
      if (Board.gameStarted) Board.reset();
      setGameEnded(false);
      Board.players = players;

      const playersArr: User[] = Object.values(players);
      const meIdx = playersArr.findIndex((player: User) => player.id === me.id);
      if (meIdx != null) playersArr[meIdx].me = true;
      setMePlayer(playersArr[meIdx]);
      setOpponent(playersArr[!meIdx ? 1 : 0]);

      Board.me = playersArr[meIdx];
      Board.opponent = playersArr[!meIdx ? 1 : 0];

      Board.gameStarted = true;

      Board.setPieces(pieces);
      setFlipBoard(players.black.id === me.id);
      forceUpdate();
    });

    socket.on("setActivePlayer", (playerId) => {
      Board.setActivePlayer(playerId);
      forceUpdate();
    });

    socket.on("movePiece", (from: PiecePos, to: PiecePos) => {
      Board.movePiece(from, to);

      forceUpdate();
    });

    socket.on("check", () => {
      if (Board.isCheckMate()) socket.emit("checkmate", Board.me?.id);
    });

    socket.on("disconnectedPlayer", () => {
      setOpponent(null);
      setFlipBoard(false);

      socket.disconnect();
    });

    socket.on("endGame", () => {
      setGameEnded(true);
    });

    return () => {};
  }, [Board, me, socket]);

  return (
    <div style={{ display: "flex" }}>
      <BoardWrapper
        className="Board"
        style={{ pointerEvents: Board.gameStarted ? "all" : "none" }}
      >
        {gameEnded && (
          <GameOverWrapper>
            <h1>game ended</h1>
          </GameOverWrapper>
        )}
        {(
          (flipBoard ? getFlippedBoard(Board.pieces) : Board.pieces) as Pieces
        ).map((x, idxX) => (
          <div key={idxX}>
            {x.map((y, idxY) => {
              const gray =
                (idxX % 2 === 1 && idxY % 2 === 0) ||
                (idxX % 2 === 0 && idxY % 2 === 1);

              let isPiece = false;
              if (y instanceof Piece) isPiece = true;

              let isHighlighted = false;
              if (
                (flipBoard &&
                  highlighted.find(
                    ([x1, y1]) => x1 === 7 - idxX && y1 === 7 - idxY
                  )) ||
                (!flipBoard &&
                  highlighted.find(([x1, y1]) => x1 === idxX && y1 === idxY))
              )
                isHighlighted = true;

              return (
                <Cell
                  gray={gray}
                  key={`${idxX}-${idxY}`}
                  onClick={() => {
                    let highlighted = [];

                    if (flipBoard)
                      highlighted = Board.click(7 - idxX, 7 - idxY);
                    else highlighted = Board.click(idxX, idxY);

                    setHighlighted(highlighted);
                  }}
                  style={{ position: "relative", overflow: "hidden" }}
                >
                  {isHighlighted && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        color: "red",
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        backgroundColor: "#18438e",
                      }}
                    />
                  )}
                  {isPiece && (
                    <img
                      style={{
                        marginTop:
                          isPiece &&
                          (y as Piece).playerId === Board.players?.black.id
                            ? -335
                            : -235,
                        marginLeft: (piecesOffset as any)[(y as Piece).name],
                        pointerEvents: "none",
                        transform: "scale(0.3)",
                        zIndex: 200,
                      }}
                      src={pieces}
                      alt="piece"
                    />
                  )}
                </Cell>
              );
            })}
          </div>
        ))}
      </BoardWrapper>
      <GameInfoWrapper>
        <UserWrapper active={Board.activePlayer === Opponent?.id}>
          {Board.gameStarted && (
            <div>
              {Opponent && Opponent.name}
              {Opponent && Opponent.id}
            </div>
          )}
        </UserWrapper>
        {gameEnded && (
          <div>
            <button
              onClick={() => {
                if (socket) socket.emit("newGame");
              }}
            >
              New Game
            </button>
          </div>
        )}
        <UserWrapper active={Board.activePlayer === MePlayer?.id}>
          {Board.gameStarted && (
            <div>
              {MePlayer && MePlayer.name}
              {"(You)"}
              {MePlayer && MePlayer.id}
            </div>
          )}
        </UserWrapper>
      </GameInfoWrapper>
    </div>
  );
};

export default Board;
