export class Piece {
  x: number;
  y: number;
  name: string;
  playerId: string;

  constructor(x: number, y: number, name: string, playerId: string) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.playerId = playerId;
  }
}
