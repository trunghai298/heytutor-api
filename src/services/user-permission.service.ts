import { map } from "lodash";
import UserEvent from "../models/user-event.model";
import User from "../models/user.model";
import Ban from "../models/ban.model";
import Event from "../models/event.model";
import UserPermission from "../models/user-permission.model";
import { BadRequestError } from "../utils/errors";
const { Op } = require("sequelize");

//Run first time to get all permission.
const initPermission = async () => {
  try {
    const listUser = await User.findAll({
      attributes: ["id"],
      raw: true,
    });

    console.log("123");

    const userPermission = await Promise.all(
      map(listUser, async (user) => {
        const payload = {
          userId: user.id,
          canPost: 1,
          canRegister: 1,
          canComment: 1,
          eventId: null,
        };

        await createPermission(payload);
      })
    );

    console.log("456");

    const listUserEvent = await UserEvent.findAll({
      attributes: ["userId", "eventId"],
      raw: true,
    });

    const eventPermission = await Promise.all(
      map(listUserEvent, async (userEvent) => {
        const payload = {
          userId: userEvent.userId,
          canPost: 1,
          canRegister: 1,
          canComment: 1,
          eventId: userEvent.eventId,
        };

        await createPermission(payload);
      })
    );
  } catch (error) {
    return error;
  }
};

const checkUserCreatePostPermission = async (userId, eventId) => {
  try {
    const canPost = await UserPermission.findOne({
      where: {
        userId: userId,
        eventId: eventId,
      },
      attributes: ["canPost"],
      raw: true,
    });

    if (canPost.canPost === 1) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return error;
  }
};

const checkUserRegisterPermission = async (userId, eventId) => {
  try {
    const canPost = await UserPermission.findOne({
      where: {
        userId: userId,
        eventId: eventId,
      },
      attributes: ["canRegister"],
      raw: true,
    });

    if (canPost.canRegister === 1) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return error;
  }
};

// Run 1 time per days
const checkEventPermission = async () => {
  const today = new Date(Date.now());

  try {
    const listEvent = await Event.findAll({
      where: {
        endAt: {
          [Op.lt]: today,
        },
      },
      attributes: ["id"],
      raw: true,
    });

    const res = await Promise.all(
      map(listEvent, async (event) => {
        await UserPermission.update(
          {
            canPost: 0,
            canRegister: 0,
            canComment: 0,
          },
          {
            where: {
              eventId: event.id,
            },
          }
        );
      })
    );

    return "Success!!!";
  } catch (error) {
    return error;
  }
};

const createPermission = async (payload) => {
  const { userId, canPost, canRegister, canComment, eventId } = payload;
  try {
    await UserPermission.create({
      userId: userId,
      canPost: canPost,
      canRegister: canRegister,
      canComment: canComment,
      eventId: eventId,
    });

    return "Success!!!";
  } catch (error) {
    console.log(error);
    
  }
};

const checkBan = async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  try {
    const listBan = await Ban.findAll({
      where: {
        banDate: {
          [Op.gt]: thirtyMinutesAgo,
        },
      },
      raw: true,
    });

    const res = await Promise.all(
      map(listBan, async (ban) => {
        if (
          ban.type === "1-1" ||
          ban.type === "1-2" ||
          ban.type === "1-3" ||
          ban.type === "1-4"
        ) {
          const permission = await UserPermission.update(
            {
              canPost: 0,
            },
            {
              where: {
                userId: ban.userId,
                eventId: ban.eventId,
              },
            }
          );
        } else if (
          ban.type === "2-1" ||
          ban.type === "2-2" ||
          ban.type === "2-3" ||
          ban.type === "2-4"
        ) {
          const permission = await UserPermission.update(
            {
              canRegister: 0,
            },
            {
              where: {
                userId: ban.userId,
                eventId: ban.eventId,
              },
            }
          );
        } else if (
          ban.type === "3-1" ||
          ban.type === "3-2" ||
          ban.type === "3-3" ||
          ban.type === "3-4"
        ) {
          const permission = await UserPermission.update(
            {
              canComment: 0,
            },
            {
              where: {
                userId: ban.userId,
                eventId: ban.eventId,
              },
            }
          );
        }
      })
    );

    return "Success!!!";
  } catch (error) {
    console.log(error);

    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

const checkUnBan = async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  try {
    const listBan = await Ban.findAll({
      where: {
        unbanDate: {
          [Op.gt]: thirtyMinutesAgo,
        },
      },
      raw: true,
    });

    const res = await Promise.all(
      map(listBan, async (ban) => {
        if (
          ban.type === "1-1" ||
          ban.type === "1-2" ||
          ban.type === "1-3" ||
          ban.type === "1-4"
        ) {
          const permission = await UserPermission.update(
            {
              canPost: 1,
            },
            {
              where: {
                userId: ban.userId,
                eventId: ban.eventId,
              },
            }
          );
        } else if (
          ban.type === "2-1" ||
          ban.type === "2-2" ||
          ban.type === "2-3" ||
          ban.type === "2-4"
        ) {
          const permission = await UserPermission.update(
            {
              canRegister: 1,
            },
            {
              where: {
                userId: ban.userId,
                eventId: ban.eventId,
              },
            }
          );
        } else if (
          ban.type === "3-1" ||
          ban.type === "3-2" ||
          ban.type === "3-3" ||
          ban.type === "3-4"
        ) {
          const permission = await UserPermission.update(
            {
              canComment: 1,
            },
            {
              where: {
                userId: ban.userId,
                eventId: ban.eventId,
              },
            }
          );
        }
      })
    );

    return "Success!!!";
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

export default {
  checkBan,
  checkUnBan,
  initPermission,
  createPermission,
  checkEventPermission,
  checkUserCreatePostPermission,
  checkUserRegisterPermission,
};
