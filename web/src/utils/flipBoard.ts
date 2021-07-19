export const getFlippedBoard = (grid: any[][]) => {
  const newGrid = Array(8)
    .fill(0)
    .map((_) => Array(8).fill(0));

  for (const i in grid) {
    for (const j in grid[i]) {
      newGrid[7 - Number(i)][7 - Number(j)] = grid[i][j];
    }
  }

  return newGrid;
};
