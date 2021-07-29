import styled from "styled-components";

export const BoardWrapper = styled.div`
  position: relative;
`;

export const GameOverWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  position: absolute;
  z-index: 3000;
  background-color: #00000073;

  h1 {
    font-size: 100px;
    color: #27e;
  }
`;

export const GameInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;
`;

export const UserWrapper = styled.div<{ active: boolean }>`
  height: 100px;
  width: 100%;
  border-top: 2px solid ${(props) => (!props.active ? "#060c16" : "white")};
  border-bottom: 2px solid ${(props) => (!props.active ? "#060c16" : "white")};
`;

export const Cell = styled.div<{ gray: boolean }>`
  width: 100px;
  height: 100px;
  position: relative;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -o-user-select: none;
  user-select: none;
  cursor: pointer;
  background-color: ${(props) => (props.gray ? "white" : "#222935")};
`;

export const PromotionMenu = styled.div`
  background-color: #060c16;
  padding: 5px 10px;

  border-radius: 4px;
  box-shadow: 3px -2px 10px 10px rgba(0, 0, 0, 0.5);
  transform: translateX(100px);
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 250;
  position: absolute;
  overflow: hidden;

  button {
    width: 80px;
    background-color: transparent;
    border: 0;
    color: white;
    cursor: pointer;
  }
`;

export const PieceButton = styled.button`
  border: 1px solid #222935 !important;
  box-shadow: 3px -2px 5px 5px rgba(11, 11, 11, 0.5);
  overflow: hidden;
  display: grid;
  place-items: center;
  background-color: transparent;
  border-radius: 5px;
  margin-bottom: 5px;
  height: 80px;
  width: 80px;
`;
