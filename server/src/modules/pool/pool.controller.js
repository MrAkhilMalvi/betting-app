import * as service from "./pool.service.js";

export const joinPool = async (req, res, next) => {
  try {
    const result = await service.joinPool(
      req.user.id,
      req.body.poolId
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const createPool = async (req, res, next) => {
  try {
    const pool = await service.createPool(req.body);
    res.json(pool);
  } catch (err) {
    next(err);
  }
};

export const drawWinner = async (req, res, next) => {
  try {
    const result = await service.drawWinner(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getActivePool = async (req, res, next) => {
  try {
    const pool = await service.getActivePool();

    if (!pool) {
      return res.status(404).json({
        message: "No active pool",
      });
    }

    res.json(pool);
  } catch (err) {
    next(err);
  }
};