import * as service from "./wallet.service.js";

export const getWallet = async (req, res, next) => {
  try {
    const balance = await service.getWallet(req.user.id);
    res.json({ balance });
  } catch (err) {
    next(err);
  }
};