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
  /* background-color: #060c16; */
  background-color: ${(props) => (props.gray ? "white" : "#222935")};
`;
