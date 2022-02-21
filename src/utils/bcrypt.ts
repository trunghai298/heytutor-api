const bcrypt = require("bcryptjs");

const SALT_ROUND = 10;

export const encrypt = (plain: any) => bcrypt.hash(plain, SALT_ROUND);
export const compare = (plain: any, hash: any) => bcrypt.compare(plain, hash);
