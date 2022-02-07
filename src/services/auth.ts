import * as JWTUtils from "../utils/jwt";

export const anonymous = async (ctx: any) => JWTUtils.sign({ ctx });
