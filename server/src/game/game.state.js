// src/game/game.state.js

export let gameState = "waiting";
export let currentRoundId = null;

export const setGameState = (state) => {
  gameState = state;
};

export const setCurrentRound = (id) => {
  currentRoundId = id;
};