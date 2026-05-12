
export type GameState = 'waiting' | 'running' | 'crashed';

export interface PlayerBet {
  id: string;
  username: string;
  betAmount: number;
  multiplier?: number;
  cashedOut: boolean;
}
export interface GameHistory {
  id: string;
  crashPoint: number;
}