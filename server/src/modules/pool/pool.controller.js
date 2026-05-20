import * as service from "./pool.service.js";

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

export const joinPool = async (req, res, next) => {
  try {
    const result = await service.joinPool(req.user.id, req.body.poolId);

    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const createPool = async (req, res, next) => {
  try {
    const result = await service.createPool(req.body);

    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getPoolHistory = async (req, res, next) => {
  try {
    const pools = await service.getPoolHistory();

    res.json(pools);
  } catch (err) {
    next(err);
  }
};

export const getPoolById = async (req, res, next) => {
  try {
    const pool = await service.getPoolById(req.params.poolId);

    if (!pool) {
      return res.status(404).json({
        message: "Pool not found",
      });
    }

    res.json(pool);
  } catch (err) {
    next(err);
  }
};
