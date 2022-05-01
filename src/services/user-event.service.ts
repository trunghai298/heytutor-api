import { BadRequestError, NotFoundError } from "../utils/errors";
import UserEvent from "../models/user-event.model";
import UserPermissionService from "./user-permission.service";
import ActivityServices from "./activity.service";

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
  const { user } = ctx;
  const { eventId, isSupporter, isRequestor } = payload;

  try {
    const res = await UserEvent.findOne({
      where: {
        userId: user.id,
        eventId,
      },
      attributes: ["isSupporter", "isRequestor"],
      raw: true,
    });

    if (res === null) {
      await UserEvent.create({
        userId: user.id,
        eventId: eventId,
        isSupporter: isSupporter,
        isRequestor: isRequestor,
      });
      await UserPermissionService.createPermission({
        userId: user.id,
        eventId: eventId,
      });
    } else {
      await UserEvent.update(
        {
          isSupporter: isSupporter,
          isRequestor: isRequestor,
        },
        {
          where: { userId: user.id, eventId },
        }
      );
    }

    await ActivityServices.create({
      userId: user.id,
      username: user.name,
      action: "join_event",
      content: `${user.name} tham gia sự kiện ${eventId}`,
    });

    return { status: 200 };
  } catch (error) {
    throw new BadRequestError({
      field: "userId-eventId",
      message: "Failed to create this item.",
    });
  }
};

const unJoinEvent = async (ctx, event) => {
  const { user } = ctx;
  const eventId = event.eventId;
  try {
    const res = await UserEvent.destroy({
      where: {
        userId: user.id,
        eventId,
      },
    });
    const log = await ActivityServices.create({
      userId: user.id,
      username: user.name,
      action: "unjoin_event",
      content: `${user.name} huỷ tham gia sự kiện ${eventId}`,
    });
    return { status: 200 };
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

    return listUsers;
  } catch (error) {
    throw new NotFoundError({
      field: "eventId",
      message: "Không tìm thấy sự kiện.",
    });
  }
};

const checkUserInEvent = async (ctx, eventId) => {
  const { user } = ctx;
  try {
    const isInEvent = await UserEvent.findOne({
      where: {
        userId: user.id,
        eventId: eventId,
      },
      raw: true,
    });

    return isInEvent ? true : false;
  } catch (error) {
    throw new NotFoundError({
      field: "eventId",
      message: "Không tìm thấy sự kiện.",
    });
  }
};

export default {
  list,
  joinEvent,
  unJoinEvent,
  listUserOfEvent,
  checkUserInEvent,
};
