import UserPost from "../models/user-post.model";
import MySQLClient from "../clients/mysql";
import Event from "../models/event.model";
import { BadRequestError, NotFoundError } from "../utils/errors";
import UserEvent from "../models/user-event.model";
import { map } from "lodash";
import { pick } from "lodash";
import Post from "../models/post.model";
import User from "../models/user.model";
import { Op, Sequelize } from "sequelize";
import RankingService from "./ranking.service";
import BanService from "./ban.service";
import ReportService from "./report.service";
import UserEventService from "./user-event.service";
import usersService from "./users.service";
import Admin from "../models/admin.model";

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
      message: error,
    });
  }
};

/**
 * To delete an existed event
 */
const deleteEvent = async (eventId) => {
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
      numberOfPost: listEventPost,
      numberOfUser: listEventUser,
      eventDetail: listEventDetail,
    };
  } catch (error) {
    throw new NotFoundError({
      field: "postId",
      message: "Post is not found",
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
    const numberOfSP = await UserEvent.findAll({
      where: {
        eventId,
        isSupporter: 1,
      },
    });
    const numberOfRq = await UserEvent.findAll({
      where: {
        eventId,
        isRequestor: 1,
      },
    });
    const numberOfUser = await UserEvent.findAll({
      where: {
        eventId,
      },
    });

    return {
      numberOfSP: numberOfSP.length,
      numberOfRq: numberOfRq.length,
      numberOfUser: numberOfUser.length,
    };
  } catch (error) {
    throw new NotFoundError({
      field: "eventId",
      message: "Event is not found",
    });
  }
};

const getEventDetail = async (eventId) => {
  try {
    const eventDetail = await Event.findOne({
      where: {
        id: eventId,
      },
      raw: true,
    });
    return eventDetail;
  } catch (error) {
    console.log(error);

    throw new NotFoundError({
      field: "eventId",
      message: "Event is not found",
    });
  }
};

const getPostOfEvent = async (params) => {
  const { eventId, limit, offset } = params;

  try {
    const res = await UserPost.findAll({
      where: {
        eventId,
        postId: {
          [Op.ne]: null,
        },
        isDone: {
          [Op.ne]: 1,
        },
      },
      limit: limit || 20,
      offset: offset || 0,
      raw: true,
      order: [["createdAt", "DESC"]],
    });

    const finalRes = await Promise.all(
      map(res, async (post) => {
        let registerUsers = null;
        let supporterUsers = null;

        if (post.registerId) {
          registerUsers = await Promise.all(
            map(post.registerId, async (id) => {
              const registerUser = await usersService.getUserData(id);
              return {
                id,
                username: registerUser.name,
                email: registerUser.email,
                rankPoint: registerUser.rankPoint || 0,
                voteCount: registerUser.voteCount || 0,
              };
            })
          );
        }
        if (post.supporterId) {
          supporterUsers = await Promise.all(
            map(post.supporterId, async (id) => {
              const registerUser = await usersService.getUserData(id);
              return {
                id,
                username: registerUser.name,
                email: registerUser.email,
                rankPoint: registerUser.rankPoint || 0,
                voteCount: registerUser.voteCount || 0,
              };
            })
          );
        }
        return { ...post, registerUsers, supporterUsers };
      })
    );

    return finalRes;
  } catch (error) {
    throw new NotFoundError({
      field: "eventId",
      message: "Event has no post.",
    });
  }
};

const listEventByUser = async (ctx) => {
  const userId = ctx?.user?.id;
  const today = new Date(Date.now());
  try {
    const listEvent = await UserEvent.findAll({
      where: {
        userId,
      },
      attributes: ["eventId"],
      raw: true,
    });

    const EventStats = await Promise.all(
      map(listEvent, async (event) => {
        const lists = await Event.findOne({
          where: {
            id: event.eventId,
            endAt: {
              [Op.gt]: today,
            },
          },
          attributes: ["id"],
          raw: true,
        });
        return lists;
      })
    );

    const listEventDetail = await Promise.all(
      map(EventStats, async (event) => {
        if (event !== null) {
          const eventStats = await getEventUserPostDetail(userId, event.id);
          return eventStats;
        }
      })
    );

    // map(EventStats, async (event) => {
    //   console.log(event, "event", event.id);

    //   const eventStats = await getEventUserPostDetail(userId, event.id);
    //   mapEvent.push(eventStats);
    // });

    return {
      listEvent: listEventDetail,
    };
  } catch (error) {
    return error;
  }
};

const getUserRoleInEvent = async (ctx, eventId) => {
  try {
    const userId = ctx?.user?.id;

    const userRole = await UserEvent.findAll({
      where: {
        userId,
        eventId,
      },
      attributes: ["isSupporter", "isRequestor"],
      raw: true,
    });
    return userRole;
  } catch (error) {
    throw new NotFoundError({
      field: "eventId",
      message: "Event is not found",
    });
  }
};

const getPostOfUserInEvent = async (ctx, eventId) => {
  const userId = ctx?.user?.id;
  try {
    const listPostsOfUser = await UserPost.findAll({
      where: {
        userId,
        eventId,
      },
      raw: true,
    });
    return listPostsOfUser;
  } catch (error) {
    return error;
  }
};

// const listActiveUser = async (eventId) => {
//   try {
//     const listUser = await UserEvent.findAll({
//       where: {
//         eventId,
//         isRequestor: 1,
//       },
//       include: [User],
//       attributes: ["userId"],
//       raw: true,
//     });
//     const requestorList = map(listRequestor, (user) => {
//       const pickFields = pick(user, ["userId", "User.name", "User.email"]);
//       return pickFields;
//     });

//     const eventPosts = await getPostOfEvent(eventId);
//     return {
//       numberActiveRequestor: listActiveRequestor.length,
//       numberActiveSupporter: listActiveSupporter.length,
//     };
//   } catch (error) {
//     return error;
//   }
// };

const isActiveRequestor = async (userId, eventId) => {
  try {
    let count = 0;
    let boolean = false;
    if (isShortTermEvent(eventId)) {
      const listUser = await UserPost.findAll({
        where: {
          eventId,
          userId,
        },
        raw: true,
      });

      map(listUser, async (user) => {
        if (user.isDone === 1) {
          count++;
        }
      });

      if (listUser.length >= 3 && count >= 1) {
        boolean = true;
      }
    } else {
      const listUser = await UserPost.findAll({
        where: {
          eventId,
          userId,
        },
        raw: true,
      });

      map(listUser, async (user) => {
        if (user.isDone === 1) {
          count++;
        }
      });

      if (listUser.length >= 5 && count >= 2) {
        boolean = true;
      }
    }

    return boolean;
  } catch (error) {
    return error;
  }
};

const isActiveSupporter = async (userId, eventId) => {
  try {
    let countDone = 0;
    let countSupport = 0;
    let boolean = false;
    if (isShortTermEvent(eventId)) {
      const listUser = await UserPost.findAll({
        where: {
          eventId,
        },
        attributes: ["supporterId", "isDone"],
        raw: true,
      });

      map(listUser, async (user) => {
        if (user.supporterId != null) {
          if (user.supporterId.includes(userId)) {
            countSupport++;
          }
          if (user.isDone === 1) {
            countDone++;
          }
        }
      });

      if (countSupport >= 3 && countDone >= 1) {
        boolean = true;
      }
    } else {
      const listUser = await UserPost.findAll({
        where: {
          eventId,
        },
        attributes: ["supporterId", "isDone"],
        logging: true,
        raw: true,
      });

      map(listUser, async (user) => {
        if (user.supporterId != null) {
          if (user.supporterId.includes(userId)) {
            countSupport++;
          }
          if (user.isDone === 1) {
            countDone++;
          }
        }
      });

      if (countSupport >= 5 && countDone >= 2) {
        boolean = true;
      }
    }

    return boolean;
  } catch (error) {
    return error;
  }
};

const isShortTermEvent = async (eventId) => {
  try {
    const listShortTermEvents = (await getEventByDuration()).shortTermEvents;
    let boolean = false;
    for (let i = 0; i < listShortTermEvents.length; i++) {
      if (listShortTermEvents[i].eventDetail.id === parseInt(eventId)) {
        boolean = true;
      }
    }
    return boolean;
  } catch (error) {
    return error;
  }
};

const getEventUserPostDetail = async (ctx, eventId) => {
  try {
    // const listSupporter = await UserEvent.findAll({
    //   where: {
    //     eventId,
    //     isSupporter: 1,
    //   },
    //   include: [User],
    //   raw: true,
    // });
    // const supportList = map(listSupporter, (user) => {
    //   const pickFields = pick(user, ["userId", "User.name", "User.email"]);
    //   return pickFields;
    // });

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

    // const eventPosts = await getPostOfEvent(eventId);
    const postNearDeadline = await getPostNearEndInEvent(eventId);
    const postNoRegister = await getPostNoRegisterInEvent(eventId);
    const eventUserPosts = await getPostOfUserInEvent(ctx, eventId);
    const eventDetail = await getEventDetail(eventId);
    const eventRole = await getUserRoleInEvent(ctx, eventId);
    return {
      eventContent: eventDetail,
      // listUserSupporter: supportList,
      listPostInEventOfUser: eventUserPosts.length,
      listPostNearDeadline: postNearDeadline.length,
      listNonRegisterPost: postNoRegister.length,
      listUserRequestor: requestorList.length,
      // listPostOfEvent: eventPosts,
      userRoleInEvent: eventRole,
    };
  } catch (error) {
    throw new NotFoundError({
      field: "eventId",
      message: "Event is not found",
    });
  }
};

const getListEventNotEnroll = async (ctx, limit, offset) => {
  const userId = ctx?.user?.id;
  const today = new Date(Date.now());
  try {
    const eventNotEnroll = await UserEvent.findAll({
      where: {
        userId: {
          [Op.ne]: userId,
        },
      },
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("eventId")), "eventId"],
      ],
      raw: true,
      limit: parseInt(limit) || 3,
      offset: parseInt(offset) || 0,
    });

    const listEventActive = await Promise.all(
      map(eventNotEnroll, async (event) => {
        const eventData = await Event.findOne({
          where: {
            id: event.eventId,
            endAt: {
              [Op.gt]: today,
            },
          },
          attributes: ["id"],
          raw: true,
        });
        return eventData;
      })
    );

    const listEventNotEnroll = await Promise.all(
      map(listEventActive, async (event) => {
        if (event !== null) {
          const eventDetail = await getEventDetail(event.id);
          const eventUser = await getEventUser(event.id);
          const listPost = await getNumberPostOfEvent(event.id);
          const listPostDone = await getPostDoneInEvent(event.id);
          // const listActiveUsers = await listActiveUser(event.eventId);
          return { eventDetail, eventUser, listPost, listPostDone };
        }
      })
    );

    return listEventNotEnroll;

    // let difference = mapEventId.filter((x) => !mapEventUserId.includes(x));

    // let events = [];

    // for (let i = 0; i < difference.length; i++) {
    //   const eventDetail = await getEventDetail(difference[i]);
    //   const eventUser = await getEventUser(difference[i]);
    //   const listActiveUsers = await listActiveUser(difference[i]);
    //   const listPost = await getNumberPostOfEvent(difference[i]);
    //   const listPostDone = await getPostDoneInEvent(difference[i]);
    //   const res = {
    //     eventDetail,
    //     eventUser,
    //     listActiveUsers,
    //     listPost,
    //     listPostDone,
    //   };
    //   events.push(res);
    // }

    // return events;
  } catch (error) {
    return error;
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

const getEventByDuration = async () => {
  try {
    const listEvent = Event.findAll({});

    let mapShortTerm = [];
    let mapShortTerm1 = [];

    for (const event of await listEvent) {
      const endDate = event.endAt.getTime();
      const createDate = event.createdAt.getTime();

      if (endDate - createDate < 1000 * 60 * 60 * 24 * 7) {
        mapShortTerm.push(event);
      }
    }
    const shortTermEvents = await Promise.all(
      map(mapShortTerm, async (event) => {
        const shortEventData = await getEventStats(event.id);
        mapShortTerm1.push(shortEventData);
      })
    );

    let mapLongTerm = [];
    let mapLongTerm1 = [];

    for (const event of await listEvent) {
      const endDate = event.endAt.getTime();
      const createDate = event.createdAt.getTime();

      if (endDate - createDate > 1000 * 60 * 60 * 24 * 7) {
        mapLongTerm.push(event);
      }
    }
    const longTermEvents = await Promise.all(
      map(mapLongTerm, async (event) => {
        const longEventData = await getEventStats(event.id);
        mapLongTerm1.push(longEventData);
      })
    );

    return {
      shortTermEvents: mapShortTerm1,
      longTermEvents: mapLongTerm1,
    };
  } catch (error) {
    throw new NotFoundError({
      field: "eventId",
      message: "Event is not found",
    });
  }
};

const getPostNearEndInEvent = async (eventId) => {
  const deadlineDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const today = new Date(Date.now());
  try {
    const listEventPosts = await UserPost.findAll({
      where: {
        eventId,
      },
      raw: true,
    });

    let arrayPosts = [];

    const listPosts = await Promise.all(
      map(listEventPosts, async (post) => {
        const posts = await Post.findAll({
          where: {
            id: post.postId,
            deadline: {
              [Op.gt]: deadlineDate,
            },
          },
          raw: true,
        });

        if (posts.length !== 0) {
          // arrayPosts.push(posts);
          return posts;
        }
      })
    );
    return listPosts;
  } catch (error) {
    return error;
  }
};

const getPostNoRegisterInEvent = async (eventId) => {
  try {
    const listEventPosts = await UserPost.findAll({
      where: {
        eventId,
        registerId: null,
        supporterId: null,
      },
      raw: true,
    });

    return listEventPosts;
  } catch (error) {
    return error;
  }
};

const getPostDoneInEvent = async (eventId) => {
  try {
    const listPost = await UserPost.findAll({
      where: {
        eventId,
        isDone: 1,
      },
      raw: true,
    });

    return listPost.length;
  } catch (error) {
    return error;
  }
};

const getEventForCreatePost = async () => {
  const today = new Date(Date.now());

  try {
    const res = await Event.findAll({
      where: {
        endAt: {
          [Op.gt]: today,
        },
      },
      attributes: ["id", "title", "hashtag"],
      raw: true,
    });
    return res;
  } catch (error) {
    return error;
  }
};

const approveEvent = async (ctx, eventId) => {
  const adminId = ctx?.user?.id;

  try {
    const res = Event.update(
      {
        isApproved: 1,
        approveBy: adminId,
      },
      {
        where: {
          eventId,
        },
      }
    );

    return res;
  } catch (error) {
    throw new NotFoundError({
      field: "eventId",
      message: "Event is not found",
    });
  }
};

const countActiveEventOfCollaborator = async (userId) => {
  try {
    const listActiveEvent = await MySQLClient.query(
      `SELECT * FROM Events WHERE JSON_CONTAINS(JSON_EXTRACT(Events.adminId, '$[*]'), '${userId}') AND endAt > now() AND isApproved = 1`,
      { type: "SELECT" }
    );

    return listActiveEvent;
  } catch (error) {
    throw new NotFoundError({
      field: "userId",
      message: "Collaborator is not found",
    });
  }
};

const countPendingEventOfCollaborator = async (userId) => {
  try {
    const pendingEvent = await Event.findAll({
      where: {
        createId: userId,
        isApproved: 0,
      },
      raw: true,
    });

    return pendingEvent;
  } catch (error) {
    throw new NotFoundError({
      field: "userId",
      message: "Collaborator is not found",
    });
  }
};

const getListUserEventsManageByCollaborator = async (ctx) => {
  const userId = ctx?.user?.id;
  try {
    const listEvent = await countActiveEventOfCollaborator(userId);

    let a = [];

    const manageUserEventId = await Promise.all(
      map(listEvent, async (event) => {
        const listUserEvent = await UserEvent.findAll({
          where: {
            eventId: event.id,
          },
          attributes: ["userId", "eventId"],
          raw: true,
        });

        await a.push(...listUserEvent);
      })
    );

    const userEventData = await Promise.all(
      map(a, async (userEvent) => {
        const getUserRank = await RankingService.getUserRank(userEvent.userId);
        const getEvent = await getEventDetail(userEvent.eventId);
        const getUserDetail = await User.findOne({
          where: {
            id: userEvent.userId,
          },
          attributes: ["email", "name"],
          raw: true,
        });
        const getBanDetail = await BanService.getUserStatusInEvent(
          userEvent.userId,
          userEvent.eventId
        );
        const listReportNotResolved =
          await ReportService.listReportNotResolvedByUser(userEvent.userId);
        const listReported = await ReportService.listAllReportOfUser(
          userEvent.userId
        );

        return {
          rankInfo: getUserRank,
          eventInfo: getEvent,
          userInfo: getUserDetail,
          userBanInfo: getBanDetail,
          nbOfNotResolvedReport: listReportNotResolved,
          nbOfReport: listReported,
        };
      })
    );

    return userEventData;
  } catch (error) {
    throw new NotFoundError({
      field: "userId",
      message: "User is not found",
    });
  }
};

const listEventManageByCollaborator = async (userId) => {
  try {
    const listEvent = await countActiveEventOfCollaborator(userId);
    const res = await Promise.all(
      map(listEvent, async (event) => {
        const listUsers = await UserEventService.listUserOfEvent(event.id);
        const listReport = await ReportService.listReportInEvent(event.id);

        const result = {
          eventDetail: event,
          listUserInEvent: listUsers,
          listReportInEvent: listReport,
        };
        return result;
      })
    );

    return res;
  } catch (error) {
    throw new NotFoundError({
      field: "userId",
      message: "User is not found",
    });
  }
};

const collaboratorInfo = async () => {
  try {
    const listCollaborator = await Admin.findAll({
      where: {
        role: "ctv1",
      },
      attributes: ["id", "name"],
      raw: true,
    });

    console.log(listCollaborator);
    

    const res = await Promise.all(
      map(listCollaborator, async (collaborator) => {
        const info = await listEventManageByCollaborator(collaborator.id);
        return { ...collaborator, info};
      })
    );

    return res;
  } catch (error) {
    console.log(error);
    
    throw new NotFoundError({
      field: "listCollaborator",
      message: "Collaborator is not found",
    });
  }
};

export default {
  create,
  edit,
  deleteEvent,
  getNumberPostOfEvent,
  getEventUser,
  getPostOfEvent,
  listEventByUser,
  getEventStats,
  getEventUserPostDetail,
  getEventByDuration,
  // listActiveUser,
  getListEventNotEnroll,
  getEventForCreatePost,
  approveEvent,
  countActiveEventOfCollaborator,
  countPendingEventOfCollaborator,
  getListUserEventsManageByCollaborator,
  listEventManageByCollaborator,
  collaboratorInfo,
};
