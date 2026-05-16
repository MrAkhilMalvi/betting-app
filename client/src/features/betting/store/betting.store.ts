import { create } from "zustand";
import { GameStore } from "../types/betting";

export const useGameStore = create<GameStore>((set) => ({
  multiplier: 1,
  gameState: "waiting",
  roundId: null,

  hasBet: false,
  betId: null,
  balance: 0,
  bonusClaimed: false,

  timeRemaining: 0,
  isLoading: false,

  liveBets: [],
  history: [],

  setMultiplier: (value) => set({ multiplier: value }),
  setGameState: (value) => set({ gameState: value }),
  setRoundId: (value) => set({ roundId: value }),
  setHasBet: (value) => set({ hasBet: value }),
  setBetId: (value) => set({ betId: value }),
  setBalance: (value) => set({ balance: value }),
  setBonusClaimed: (value) => set({ bonusClaimed: value }),
  setTimeRemaining: (value) => set({ timeRemaining: value }),
  setLoading: (value) => set({ isLoading: value }),
  addLiveBet: (bet) =>
    set((state) => ({ liveBets: [bet, ...state.liveBets.slice(0, 49)] })),
  addHistory: (item) =>
    set((state) => ({ history: [item, ...state.history.slice(0, 19)] })),
  clearLiveBets: () => set({ liveBets: [] }),
}));
