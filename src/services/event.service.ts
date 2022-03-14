import UserPost from "../models/user-post.model";
import MySQLClient from "../clients/mysql";
import Event from "../models/event.model";
import { BadRequestError, NotFoundError } from "../utils/errors";
import UserEvent from "../models/user-event.model";
import { map } from "lodash";
import { isEmpty, omit, pick } from "lodash";
import Post from "../models/post.model";
import User from "../models/user.model";

/**
 * To create a new event
 */
const create = async (payload) => {
  try {
    const event = await Event.create(payload);
    return event;
  } catch (error) {
    throw new BadRequestError({
      field: "eventId",
      message: "Failed to create this item.",
    });
  }
};

/**
 * To edit an existed event
 */
const edit = async (payload) => {
  const transaction = await MySQLClient.transaction();
  try {
    const { eventId, content } = payload;
    const post = await Event.findOne({ where: { id: eventId } });

    if (!post) {
      throw new NotFoundError({
        field: "id",
        message: "Event is not found",
      });
    }

    const updatedEvent = await Event.update(
      { content },
      { where: { id: eventId }, transaction }
    );
    await transaction.commit();
    return updatedEvent;
  } catch (error) {
    await transaction.rollback();
    throw new BadRequestError({
      field: "eventId",
      message: "Failed to edit this item.",
    });
  }
};

/**
 * To delete an existed event
 */
const deleteEvent = async (eventId: string) => {
  const transaction = await MySQLClient.transaction();
  try {
    await Event.destroy({ where: { id: eventId }, transaction });
    await transaction.commit();
  } catch (error) {
    if (transaction) transaction.rollback();
    throw new BadRequestError({
      field: "eventId",
      message: "Failed to delete this item.",
    });
  }
};

const getEventStats = async (eventId) => {
  try {
    const [listEventPost, listEventUser, listEventDetail] = await Promise.all([
      getNumberPostOfEvent(eventId),
      getEventUser(eventId),
      getEventDetail(eventId),
    ]);
    return {
      listEventPost,
      listEventUser,
      listEventDetail,
    };
  } catch (error) {
    console.log(error);

    throw new NotFoundError({
      field: "eventId",
      message: "Event is not found",
    });
  }
};

const getNumberPostOfEvent = async (eventId) => {
  try {
    const numberOfPost = await UserPost.count({
      where: {
        eventId,
      },
    });
    return numberOfPost;
  } catch (error) {
    throw new NotFoundError({
      field: "eventId",
      message: "Event is not found",
    });
  }
};

const getEventUser = async (eventId) => {
  try {
    const listSupporter = await UserEvent.findAll({
      where: {
        eventId,
        isSupporter: 1,
      },
      include: [User],
      raw: true,
    });
    const supportList = map(listSupporter, (user) => {
      const pickFields = pick(user, ["userId", "User.name", "User.email"]);
      return pickFields;
    });
    const listRequestor = await UserEvent.findAll({
      where: {
        eventId,
        isRequestor: 1,
      },
      include: [User],
      raw: true,
    });
    const requestorList = map(listRequestor, (user) => {
      const pickFields = pick(user, ["userId", "User.name", "User.email"]);
      return pickFields;
    });
    const numberOfUser = await UserEvent.findAll({
      where: {
        eventId,
      },
      group: ["userId"],
    });

    return {
      listUserSupporter: supportList,
      listUserRequestor: requestorList,
      numberOfUser: numberOfUser.length,
    };
  } catch (error) {
    throw new NotFoundError({
      field: "eventId",
      message: "Event is not found",
    });
  }
};

const getEventDetail = async (id) => {
  try {
    const eventDetail = await Event.findAll({
      where: {
        id,
      },
    });
    return { eventDetail };
  } catch (error) {
    console.log(error);

    throw new NotFoundError({
      field: "eventId",
      message: "Event is not found",
    });
  }
};

const getPostOfEvent = async (eventId) => {
  try {
    const listUsers = await UserPost.findAll({
      where: {
        eventId,
      },
      include: [Post],
      attributes: ["postId"],
      group: ["postId"],
      raw: true,
    });
    const res = map(listUsers, (user) => {
      const pickFields = omit(user, ["postId"]);
      return pickFields;
    });
    return res;
  } catch (error) {
    throw new NotFoundError({
      field: "eventId",
      message: "Event has no supporter.",
    });
  }
};

const listEventByUser = async (ctx) => {
  try {
    const userId = ctx?.user?.id || 2;

    const listEvent = await UserEvent.findAll({
      where: {
        userId,
      },
      include: [Event],
      attributes: ["eventId"],
      raw: true,
      logging: true,
    });
    const res = map(listEvent, (event) => {
      const pickFields = omit(event, ["eventId", "createdAt", "updatedAt"]);
      return pickFields;
    });
    return res;
  } catch (error) {
    throw new NotFoundError({
      field: "userId",
      message: "User is not found",
    });
  }
};

// const getTotalUserOfEvent = async(eventId) => {
//   try {
//     const events = UserEvent.count({
//       where: {
//         eventId,
//       },
//     });
//     return events;
//   } catch (error) {
//      throw new NotFoundError({
//       field: "eventId",
//       message: "Event is not found",
//     });
//   }
// }

// const getListEventByDuration = async(duration) => {
//   try {
//     const listEvent = await Event.findAll();
//     map(listEvent, evt => {

//     })
//   } catch (error) {

//   }
// }

export default {
  create,
  edit,
  deleteEvent,
  getNumberPostOfEvent,
  getEventUser,
  getPostOfEvent,
  listEventByUser,
  getEventStats,
};
