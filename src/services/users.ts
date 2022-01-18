import { MySQLClient } from "../clients/mysql";
import { User } from "../models/users";

export class UserServices {
  static list = async (params: any = {}, ctx: any = {}) => {
    const limit = parseInt(params.limit, 10);
    const offset = parseInt(params.offset, 10) || 0;

    const users = await Users({
      where: {
        isAdmin: {
          [MySQLClient.Op.ne]: 1,
        },
      },
      raw: true,
      offset,
      limit,
      order: [["createdAt", "desc"]],
    });

    return users;
  };
}
