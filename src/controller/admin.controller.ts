import * as AdminServices from "../services/admin.service";
import { Response, NextFunction } from "express";

const fetch = async (req: any, res: Response, next: NextFunction) => {
  try {
    const response = await AdminServices.fetch(req.ctx);
    res.json({ response });
  } catch (e) {
    next(e);
  }
};

export default {
  fetch,
};
