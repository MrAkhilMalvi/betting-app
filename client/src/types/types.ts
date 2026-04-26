export type GameState = 'waiting' | 'running' | 'crashed';



export interface User {
  id: string;
  username: string;
  email?: string;
  mobile?: string;
  avatarUrl?: string;
}

export type AuthMethod = 'email' | 'mobile' | 'google';

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