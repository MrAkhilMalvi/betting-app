import { useEffect } from "react";
import { socket } from "@/providers/socket/socket";
import { useGameStore } from "../store/betting.store";

export const useGameSocket = () => {
  useEffect(() => {
    const handleGameInit = (data: any) => {
      const store = useGameStore.getState();
      store.setMultiplier(data.multiplier);
      store.setGameState(data.state);
      store.setRoundId(data.roundId);

      if (data.balance !== undefined) {
        store.setBalance(data.balance);
      }
    };

    const handleWaiting = (data: any) => {
      const store = useGameStore.getState();
      store.setGameState("waiting");
      store.setTimeRemaining(data.remaining);
    };

    const handleGameStart = (data: any) => {
      const store = useGameStore.getState();
      store.setGameState("running");
      store.setRoundId(data.roundId);
      store.clearLiveBets();
    };

    const handleGameUpdate = (data: any) => {  
      useGameStore.getState().setMultiplier(data.multiplier);
    };
    const handleGameCrash = (data: any) => {
      const store = useGameStore.getState();
      store.setGameState("crashed");
      store.setHasBet(false);
      store.setBetId(null);
      store.addHistory({
        id: data.roundId,
        crashPoint: data.multiplier,
      });
    };

    const handleNewBet = (bet: any) => {
      useGameStore.getState().addLiveBet(bet);
    };

const handleWalletUpdate = (data: any) => {
  useGameStore.getState().setBalance(data.balance);
};

    socket.on("game:init", handleGameInit);
    socket.on("game:waiting", handleWaiting);
    socket.on("game:start", handleGameStart);
    socket.on("game:update", handleGameUpdate);
    socket.on("game:crash", handleGameCrash);
    socket.on("bet:new", handleNewBet);
    socket.on("wallet:update", handleWalletUpdate);

    return () => {
      socket.off("game:init", handleGameInit);
      socket.off("game:waiting", handleWaiting);
      socket.off("game:start", handleGameStart);
      socket.off("game:update", handleGameUpdate);
      socket.off("game:crash", handleGameCrash);
      socket.off("bet:new", handleNewBet);
      socket.off("wallet:update", handleWalletUpdate);
    };
  }, []);
};
