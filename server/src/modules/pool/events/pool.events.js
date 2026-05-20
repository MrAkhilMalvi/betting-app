import { getIO } from "../../../config/socket/socket.js";

export const emitPoolCreated = (pool) => {
  getIO().emit("pool:created", pool);
};

export const emitPoolUpdated = (pool) => {
  getIO().emit("pool:updated", pool);
};

export const emitPoolLocked = (poolId) => {
  getIO().emit("pool:locked", {
    poolId,
  });
};

export const emitPoolCountdown = (remaining) => {
  getIO().emit("pool:countdown", {
    remaining,
  });
};

export const emitPoolWinner = (data) => {
  getIO().emit("pool:winner", data);
};

export const emitPoolCompleted = (poolId) => {
  getIO().emit("pool:completed", {
    poolId,
  });
};
