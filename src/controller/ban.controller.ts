import BanServices from "../services/ban.service";
import { Response, NextFunction } from "express";

// const list = async (req: any, res: Response, next: NextFunction) => {
//   try {
//     const response = await BanServices.list(req.ctx);
//     res.json({ response });
//   } catch (e) {
//     next(e);
//   }
// };

const createBan = (req, res, next) => {
  BanServices.createBan(req.ctx, req.body)
    .then((ban) => res.json(ban))
    .catch(next);
};

const updateBan = (req, res, next) => {
  BanServices.updateBan(req.ctx, req.body)
    .then((ban) => res.json(ban))
    .catch(next);
};

export default {
  // list,
  createBan,
  updateBan,
};
