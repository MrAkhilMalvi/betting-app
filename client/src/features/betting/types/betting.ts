
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

export interface Bet {
  id: string;
  userId: string;
  amount: number;
  payout?: number;
  status: string;
  multiplier: number;
}

export interface History {
  id: string;
  crashPoint: number;
}

export interface GameStore {
  multiplier: number;
  gameState: string;
  roundId: string | null;
  hasBet: boolean;
  betId: string | null;
  balance: number;
  timeRemaining: number;
  isLoading: boolean;
  liveBets: Bet[];
  history: History[];
  bonusClaimed: boolean;

  // setters
  setMultiplier: (value: number) => void;
  setGameState: (value: string) => void;
  setRoundId: (value: string | null) => void;
  setHasBet: (value: boolean) => void;
  setBonusClaimed: (value: boolean) => void;
  setBetId: (value: string | null) => void;
  setBalance: (value: number) => void;
  setTimeRemaining: (value: number) => void;
  setLoading: (value: boolean) => void;
  addLiveBet: (bet: Bet) => void;
  addHistory: (item: History) => void;
  clearLiveBets: () => void;
}