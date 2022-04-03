import { BadRequestError } from "../utils/errors";
import Ban from "../models/ban.model";
const { Op } = require("sequelize");
import { map } from "lodash";

/**
 * To create a new class
 */
const list = async (ctx) => {
  try {
    const res = await Ban.findAll({});
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

const createBan = async (ctx, payload) => {
  const adminId = ctx?.admin?.id || 2;
  const { userId, type, banDate } = payload;
  // const banDate = new Date(Date.now());
  let unBanDate;
  try {
    if (type === "1-1" || type === "2-1" || type === "3-1") {
      unBanDate = new Date(banDate + 1 * 24 * 60 * 60 * 1000);
    } else if (type === "1-2" || type === "2-2" || type === "3-2") {
      unBanDate = new Date(banDate + 3 * 24 * 60 * 60 * 1000);
    } else if (type === "1-3" || type === "2-3" || type === "3-3") {
      unBanDate = new Date(banDate + 5 * 24 * 60 * 60 * 1000);
    } else if (type === "1-4" || type === "2-4" || type === "3-4") {
      unBanDate = new Date(banDate + 7 * 24 * 60 * 60 * 1000);
    }
    const res = await Ban.create({
      userId: userId,
      type: type,
      banDate: banDate,
      unbanDate: unBanDate,
      banBy: adminId,
    });

    return "Create Ban Success!!!";
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

// const deleteBan = async () => {
//   const today = new Date(Date.now());
//   try {
//     const listBan = await Ban.findAll({
//       where: {
//         unbanDate: {
//           [Op.gt]: today,
//         }
//       },
//       attributes: ["id"],
//       raw: true,
//     });

//     const res = await Promise.all(
//       map(listBan, async(ban) => {
//         await Ban.destroy({
//           where: {
//             id: ban.id,
//           }
//         })
//       })
//     )
//   } catch (error) {
//     return error;
//   }
// }

const updateBan = async (ctx, payload) => {
  const adminId = ctx?.admin?.id || 2;
  const { userId, type } = payload;
  const today = new Date(Date.now());
  // const banDate = new Date(Date.now());
  try {
    const ban = await Ban.findOne({
      where: {
        userId,
        unbanDate: {
          [Op.gt]: today,
        },
      },
      attributes: ["id", "banDate"],
      raw: true,
    });
    let tempUnBanDate;
    if (ban !== null) {
      if (type === "1-1" || type === "2-1" || type === "3-1") {
        tempUnBanDate = new Date(ban.banDate + 1 * 24 * 60 * 60 * 1000);
      } else if (type === "1-2" || type === "2-2" || type === "3-2") {
        tempUnBanDate = new Date(ban.banDate + 3 * 24 * 60 * 60 * 1000);
      } else if (type === "1-3" || type === "2-3" || type === "3-3") {
        tempUnBanDate = new Date(ban.banDate + 5 * 24 * 60 * 60 * 1000);
      } else if (type === "1-4" || type === "2-4" || type === "3-4") {
        tempUnBanDate = new Date(ban.banDate + 7 * 24 * 60 * 60 * 1000);
      }
      const res = await Ban.update(
        {
          unbanDate: tempUnBanDate,
          updateBy: adminId,
        },
        {
          where: {
            id: ban.id,
          },
        }
      );
      return "Update Ban Success!!!";
    } else {
      return "Ban expired!!!"
    }
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

export default {
  list,
  createBan,
  updateBan,
};
