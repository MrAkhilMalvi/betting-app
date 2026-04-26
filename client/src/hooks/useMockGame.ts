import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, PlayerBet, GameHistory } from '../types/types';

export function useMockGame() {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [multiplier, setMultiplier] = useState(1.0);
  const [timeToStart, setTimeToStart] = useState(5);
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [players, setPlayers] = useState<PlayerBet[]>([]);
  
  const reqRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(0);

  // Generate random fake players
  const generatePlayers = () => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: `p-${i}`,
      username: `User${Math.floor(Math.random() * 9000) + 1000}`,
      betAmount: Math.floor(Math.random() * 500) + 10,
      cashedOut: false,
    }));
  };

  const startGameLoop = useCallback(() => {
    // Generate a weighted random crash point (mostly lower numbers, rare highs)
    const rand = Math.random();
    crashPointRef.current = Math.max(1.0, 1.0 / (1.0 - rand * 0.99)); 
    
    setGameState('running');
    setPlayers(generatePlayers());
    startTimeRef.current = performance.now();

    const updateMultiplier = (time: number) => {
      const elapsedMs = time - startTimeRef.current;
      // Exponential curve: 1.0 * e^(0.00006 * elapsedMs)
      const currentMult = Math.pow(Math.E, 0.00006 * elapsedMs);

      if (currentMult >= crashPointRef.current) {
        // CRASH
        setMultiplier(crashPointRef.current);
        setGameState('crashed');
        setHistory(prev => [{ id: Date.now().toString(), crashPoint: crashPointRef.current }, ...prev].slice(0, 20));
        
        // Wait 3 seconds, then go to waiting state
        setTimeout(() => {
          setGameState('waiting');
          setTimeToStart(5);
        }, 3000);
        return;
      }

      setMultiplier(currentMult);
      
      // Randomly cash out fake players
      setPlayers(prev => prev.map(p => {
        if (!p.cashedOut && Math.random() < 0.01) {
          return { ...p, cashedOut: true, multiplier: currentMult };
        }
        return p;
      }));

      reqRef.current = requestAnimationFrame(updateMultiplier);
    };

    reqRef.current = requestAnimationFrame(updateMultiplier);
  }, []);

  // Handle Waiting Countdown
  useEffect(() => {
    if (gameState === 'waiting') {
      const interval = setInterval(() => {
        setTimeToStart((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            startGameLoop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState, startGameLoop]);

  useEffect(() => {
    // Initial history mock
    setHistory(Array.from({ length: 15 }).map((_, i) => ({
      id: i.toString(),
      crashPoint: +(Math.random() * 3 + 1).toFixed(2)
    })));
    return () => cancelAnimationFrame(reqRef.current!);
  }, []);

  return { gameState, multiplier, timeToStart, history, players };
}