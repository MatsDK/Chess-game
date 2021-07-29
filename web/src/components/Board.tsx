import { Socket } from "socket.io-client";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../context/socket";
import { Board as GameBoard } from "../game/Board";
import { Piece } from "../game/Piece";
import { PieceMoveObj, PiecePos, Pieces, User } from "../types";
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
  PromotionMenu,
  PieceButton,
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
  const [score, setScore] = useState<{ [id: string]: number } | null>(null);
  const [gameEnded, setGameEnded] = useState<{
    status: boolean;
    won: boolean;
  } | null>(null);
  const [promotionMenu, setPromotionMenu] = useState<{
    move: PieceMoveObj;
  } | null>(null);

  useEffect(() => {
    Board.setSocket(socket);
    Board.promotionMenu = (move: PieceMoveObj) => {
      setPromotionMenu({ move });
    };

    socket.on("startGame", (players, pieces) => {
      if (Board.gameStarted) Board.reset();
      setGameEnded(null);
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

    socket.on(
      "movePiece",
      (from: PiecePos, to: PiecePos, name: string | undefined) => {
        const newHighlighted = Board.movePiece(from, to, name);
        setHighlighted(newHighlighted);
        setPromotionMenu(null);

        forceUpdate();
      }
    );

    socket.on("check", () => {
      if (Board.isCheckMate()) socket.emit("checkmate", Board.me?.id);
    });

    socket.on("disconnectedPlayer", () => {
      setOpponent(null);
      setFlipBoard(false);

      socket.disconnect();
    });

    socket.on(
      "endGame",
      (winnerId: string | undefined, score: { [id: string]: number }) => {
        setScore(score);
        setGameEnded({ status: true, won: winnerId === Board.me?.id });
      }
    );

    return () => {};
  }, [Board, me, socket]);

  return (
    <div style={{ display: "flex" }}>
      <BoardWrapper
        className="Board"
        style={{ pointerEvents: Board.gameStarted ? "all" : "none" }}
      >
        {gameEnded?.status && (
          <GameOverWrapper>
            <div>
              <h1>game ended</h1>
              <span>{gameEnded.won ? "You won" : "You lost"}</span>
            </div>
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

              let showPromotionMenu =
                promotionMenu &&
                promotionMenu.move.to.x === (flipBoard ? 7 - idxX : idxX) &&
                promotionMenu.move.to.y === (flipBoard ? 7 - idxY : idxY);

              return (
                <div key={`${idxX}-${idxY}`}>
                  <Cell
                    // draggable={isPiece}
                    gray={gray}
                    onClick={(e) => {
                      let highlighted: number[][] = [];

                      if (e.target === e.currentTarget) setPromotionMenu(null);

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
                          pointerEvents: "none",
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
                  {showPromotionMenu && (
                    <PromotionMenu>
                      <PieceButton
                        onClick={() =>
                          Board.pawnPromotion(promotionMenu!.move, "Q")
                        }
                      >
                        <img
                          style={{
                            marginTop: -255,
                            marginLeft: (piecesOffset as any)["Q"] - 40,
                            pointerEvents: "none",
                            transform: "scale(0.25)",
                            zIndex: 200,
                          }}
                          src={pieces}
                          alt="piece"
                        />
                      </PieceButton>
                      <PieceButton
                        onClick={() =>
                          Board.pawnPromotion(promotionMenu!.move, "B")
                        }
                      >
                        <img
                          style={{
                            marginTop: -255,
                            marginLeft: (piecesOffset as any)["B"] - 24,
                            pointerEvents: "none",
                            transform: "scale(0.25)",
                            zIndex: 200,
                          }}
                          src={pieces}
                          alt="piece"
                        />
                      </PieceButton>
                      <PieceButton
                        onClick={() =>
                          Board.pawnPromotion(promotionMenu!.move, "N")
                        }
                      >
                        <img
                          style={{
                            marginTop: -255,
                            marginLeft: (piecesOffset as any)["N"] - 8,
                            pointerEvents: "none",
                            transform: "scale(0.25)",
                            zIndex: 200,
                          }}
                          src={pieces}
                          alt="piece"
                        />
                      </PieceButton>
                      <PieceButton
                        onClick={() =>
                          Board.pawnPromotion(promotionMenu!.move, "R")
                        }
                      >
                        <img
                          style={{
                            marginTop: -255,
                            marginLeft: (piecesOffset as any)["R"] + 8,
                            pointerEvents: "none",
                            transform: "scale(0.25)",
                            zIndex: 200,
                          }}
                          src={pieces}
                          alt="piece"
                        />
                      </PieceButton>
                      <button onClick={() => setPromotionMenu(null)}>
                        close
                      </button>
                    </PromotionMenu>
                  )}
                </div>
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
              <br />
              {score ? score[Opponent?.id || ""] || 0 : 0}
            </div>
          )}
        </UserWrapper>
        {gameEnded?.status && (
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
              <br />
              {score ? score[MePlayer?.id || ""] || 0 : 0}
            </div>
          )}
        </UserWrapper>
      </GameInfoWrapper>
    </div>
  );
};

export default Board;
