import { BadRequestError } from "../utils/errors";
import UserEvent from "../models/user-event.model";
import UserPermissionService from "./user-permission.service";

/**
 * To create a new term
 */
const list = async (payload) => {
  try {
    const res = await UserEvent.findAll({});
    return res;
  } catch (error) {
    throw new BadRequestError({
      field: "id",
      message: "Failed to create this item.",
    });
  }
};

const joinEvent = async (ctx, payload) => {
  const userId = ctx?.user?.id || 2;
  const { eventId, isSupporter, isRequestor } = payload;

  try {
    const res = await UserEvent.findOne({
      where: {
        userId,
        eventId,
      },
      attributes: ["isSupporter", "isRequestor"],
      raw: true,
    });

    if (res === null) {
      await UserEvent.create({
        userId: userId,
        eventId: eventId,
        isSupporter: isSupporter,
        isRequestor: isRequestor,
      });
      await UserPermissionService.createPermission({userId: userId, eventId: eventId});
    } else {
      await UserEvent.update(
        {
          isSupporter: isSupporter,
          isRequestor: isRequestor,
        },
        {
          where: { userId, eventId },
        }
      );
    }
  } catch (error) {
    throw new BadRequestError({
      field: "userId-eventId",
      message: "Failed to create this item.",
    });
  }
};

const unJoinEvent = async (ctx, event) => {
  const userId = ctx?.user?.id || 2;
  const eventId = event.eventId;
  try {
    const res = await UserEvent.destroy({
      where: {
        userId,
        eventId,
      }
    });

    return "UnJoin Success!!!";
  } catch (error) {
    throw new BadRequestError({
      field: "userId-eventId",
      message: "Failed to create this item.",
    });
  }
}

export default {
  list,
  joinEvent,
  unJoinEvent,
};
