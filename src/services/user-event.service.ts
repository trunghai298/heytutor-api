import { BadRequestError, NotFoundError } from "../utils/errors";
import UserEvent from "../models/user-event.model";
import UserPermissionService from "./user-permission.service";
import { NOTI_TYPE } from "../constants/notification";
import NotificationService from "./notification.service";
import ActivityServices from "./activity.service";
import User from "../models/user.model";

/**
 * To create a new term
 */
const list = async () => {
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
  const userId = ctx?.user?.id;
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
      await UserPermissionService.createPermission({
        userId: userId,
        eventId: eventId,
      });
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
    // const payload = {
    //   userId: userId,
    //   eventId: eventId,
    //   notificationType: NOTI_TYPE.JoinEvent,
    // };
    // await NotificationService.create(payload);

    const username = await (
      await User.findOne({
        where: {
          id: userId,
        },
      })
    ).name;
    const log = await ActivityServices.create({
      userId,
      username,
      action: "Join Event",
      content: `${username} join event ${eventId}`,
    });

    return "Join Success!!!";
  } catch (error) {
    throw new BadRequestError({
      field: "userId-eventId",
      message: "Failed to create this item.",
    });
  }
};

const unJoinEvent = async (ctx, event) => {
  const userId = ctx?.user?.id;
  const eventId = event.eventId;
  try {
    const res = await UserEvent.destroy({
      where: {
        userId,
        eventId,
      },
    });
    // const payload = {
    //   userId: userId,
    //   eventId: eventId,
    //   notificationType: NOTI_TYPE.UnJoinEvent,
    // };
    // await NotificationService.create(payload);
    const username = await (
      await User.findOne({
        where: {
          id: userId,
        },
      })
    ).name;
    const log = await ActivityServices.create({
      userId,
      username,
      action: "unJoin Event",
      content: `${username} un join event ${eventId}`,
    });

    return "UnJoin Success!!!";
  } catch (error) {
    throw new BadRequestError({
      field: "userId-eventId",
      message: "Failed to create this item.",
    });
  }
};

const listUserOfEvent = async (eventId) => {
  try {
    const listUsers = await UserEvent.findAll({
      where: {
        eventId,
      },
      raw: true,
    });

    return { ...listUsers };
  } catch (error) {
    throw new NotFoundError({
      field: "eventId",
      message: "Event is not found",
    });
  }
};

export default {
  list,
  joinEvent,
  unJoinEvent,
  listUserOfEvent,
};
