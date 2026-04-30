import * as service from "./bet.service.js";

export const placeBet = async (req, res, next) => {
  try {
    const bet = await service.placeBet(req.user.id, req.body.amount);
    res.json({ bet });
  } catch (err) {
    next(err);
  }
};

export const resolveBet = async (req, res, next) => {
  try {
    const result = await service.resolveBet(
      req.body.betId,
      req.body.multiplier
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};