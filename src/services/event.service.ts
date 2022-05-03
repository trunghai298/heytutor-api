import UserPost from "../models/user-post.model";
import MySQLClient from "../clients/mysql";
import Event from "../models/event.model";
import { BadRequestError, NotFoundError } from "../utils/errors";
import UserEvent from "../models/user-event.model";
import { pick, compact, map, filter, flattenDeep, difference } from "lodash";
import Post from "../models/post.model";
import User from "../models/user.model";
import { Op, Sequelize } from "sequelize";
import RankingService from "./ranking.service";
import BanService from "./ban.service";
import ReportService from "./report.service";
import UserEventService from "./user-event.service";
import usersService from "./users.service";
import Admin from "../models/admin.model";
import console from "console";

/**
 * To create a new event
 */
const create = async (ctx, payload) => {
  try {
    const event = await Event.create(payload);
    return event;
  } catch (error) {
    console.log(error);
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
        message: "Không tìm thấy sự kiện.",
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
      message: "Không thể chỉnh sửa sự kiện.",
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
      message: "Không xóa được sự kiện.",
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
      field: "eventId",
      message: "Không tìm thấy sự kiện.",
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
      message: "Không tìm thấy sự kiện.",
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
      message: "Không tìm thấy sự kiện.",
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
      message: "Không tìm thấy sự kiện.",
    });
  }
};

const getTotalPostInEvent = async (eventId) => {
  try {
    const posts = await UserPost.findAll({
      where: {
        eventId,
      },
      raw: true,
    });
    return posts.length;
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
        const postDetail = await Post.findOne({
          where: { id: post.postId },
          raw: true,
        });

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
        return { ...post, postData: postDetail, registerUsers, supporterUsers };
      })
    );

    return finalRes;
  } catch (error) {
    throw new NotFoundError({
      field: "eventId",
      message: "Sự kiện này không có vấn đề nào.",
    });
  }
};

const listEventByUser = async (ctx) => {
  const { user } = ctx;
  const today = new Date(Date.now());
  try {
    const listEvent = await UserEvent.findAll({
      where: {
        userId: user.id,
      },
      attributes: ["eventId"],
      raw: true,
    });

    const EventStats = await Promise.all(
      map(listEvent, async (event) => {
        const lists = await Event.findOne({
          where: {
            id: event.eventId,
            isApproved: 1,
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

    const eventstat = compact(EventStats);

    const listEventDetail = await Promise.all(
      map(eventstat, async (event) => {
        const eventStats = await getEventUserPostDetail(user.id, event.id);
        return eventStats;
      })
    );

    return compact(listEventDetail);
  } catch (error) {
    throw new NotFoundError({
      field: "ctx",
      // message: "Không tìm thấy người dùng này.",
      message: error,
    });
  }
};

const listEventByAdmin = async (ctx) => {
  const { user } = ctx;
  try {
    const listEvent = await MySQLClient.query(
      `SELECT * FROM Events WHERE JSON_CONTAINS(JSON_EXTRACT(Events.adminId, '$[*]'), '${user.id}') AND endAt > now() AND isApproved = 1`,
      { type: "SELECT" }
    );

    return listEvent;
  } catch (error) {
    throw new NotFoundError({
      field: "ctx",
      message: "Không tìm thấy cộng tác viên này.",
    });
  }
};

const getUserRoleInEvent = async (userId, eventId) => {
  try {
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
      message: "Không tìm thấy sự kiện này.",
    });
  }
};

const getPostOfUserInEvent = async (userId, eventId) => {
  try {
    const listPostsOfUser = await UserPost.findAll({
      where: {
        userId,
        eventId,
        isDone: {
          [Op.ne]: 1,
        },
      },
      raw: true,
    });
    return listPostsOfUser;
  } catch (error) {
    throw new NotFoundError({
      field: "eventId",
      // message: "Không tìm thấy sự kiện này.",
      message: error,
    });
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
    throw new NotFoundError({
      field: "eventId",
      message: "Không tìm thấy sự kiện này.",
    });
  }
};

const getEventUserPostDetail = async (userId, eventId) => {
  try {
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

    const postNearDeadline = await getPostNearEndInEvent(eventId);
    const postNoRegister = await getPostNoRegisterInEvent(eventId);
    const eventUserPosts = await getPostOfUserInEvent(userId, eventId);
    const eventDetail = await getEventDetail(eventId);
    const totalPost = await getTotalPostInEvent(eventId);
    return {
      eventContent: eventDetail,
      listPostInEventOfUser: eventUserPosts.length,
      listPostNearDeadline: postNearDeadline.length,
      listNonRegisterPost: postNoRegister.length,
      listUserRequestor: requestorList.length,
      totalPost,
    };
  } catch (error) {
    console.log(error);

    throw new NotFoundError({
      field: "eventId",
      message: error,
    });
  }
};

const getListEventNotEnroll = async (ctx, limit, offset) => {
  const { user } = ctx;
  const today = new Date(Date.now());
  try {
    const eventsEnrolled = await UserEvent.findAll({
      where: {
        userId: user.id,
      },
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("eventId")), "eventId"],
      ],
      raw: true,
    });

    let eventIds = [];

    for (const userEvent of eventsEnrolled) {
      eventIds.push(userEvent.eventId);
    }

    console.log(eventIds);

    const eventsActive = await Event.findAll({
      where: {
        isApproved: 1,
        endAt: {
          [Op.gt]: today,
        },
      },
      attributes: ["id"],
      raw: true,
    });

    let activeEvents = [];

    for (const userEvent of eventsActive) {
      activeEvents.push(userEvent.id);
    }

    console.log(activeEvents);

    const listEventActive = await difference(activeEvents, eventIds);

    console.log(listEventActive);

    const listEventNotEnroll = await Promise.all(
      map(listEventActive, async (event) => {
        if (event !== null) {
          const eventDetail = await getEventDetail(event);
          const eventUser = await getEventUser(event);
          const listPost = await getNumberPostOfEvent(event);
          const listPostDone = await getPostDoneInEvent(event);
          // const listActiveUsers = await listActiveUser(event.eventId);
          return { eventDetail, eventUser, listPost, listPostDone };
        }
      })
    );

    return compact(listEventNotEnroll);

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
    throw new NotFoundError({
      field: "ctx",
      message: "Không tìm thấy nguời dùng này.",
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

const getEventByDuration = async () => {
  try {
    const listEvent = Event.findAll({
      where: {
        isApproved: 1,
      },
      raw: true,
    });

    let mapShortTerm = [];
    let mapShortTerm1 = [];

    for (const event of await listEvent) {
      const endDate = event.endAt.getTime();
      const startDate = event.startAt.getTime();

      if (endDate - startDate < 1000 * 60 * 60 * 24 * 7) {
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
      const startDate = event.startAt.getTime();

      if (endDate - startDate > 1000 * 60 * 60 * 24 * 7) {
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
      message: "Không tìm thấy sự kiện này.",
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
        return posts;
      })
    );
    return compact(listPosts);
  } catch (error) {
    throw new NotFoundError({
      field: "eventId",
      message: "Không tìm thấy sự kiện này.",
    });
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
    throw new NotFoundError({
      field: "eventId",
      message: "Không tìm thấy sự kiện này.",
    });
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
    throw new NotFoundError({
      field: "eventId",
      message: "Không tìm thấy sự kiện này.",
    });
  }
};

const getEventForCreatePost = async () => {
  const today = new Date(Date.now());

  try {
    const res = await Event.findAll({
      where: {
        isApproved: 1,
        endAt: {
          [Op.gt]: today,
        },
      },
      attributes: ["id", "title", "hashtag"],
      raw: true,
    });
    return res;
  } catch (error) {
    throw new NotFoundError({
      field: "",
      message: "Không tìm thấy sự kiện nào.",
    });
  }
};

const approveEvent = async (ctx, eventId) => {
  const { user } = ctx;

  try {
    if (user.role === "superadmin" || user.role === "Admin") {
      const eventDetail = await Event.FindOne({
        where: {
          id: eventId,
          isApproved: 0,
        },
        raw: true,
      });

      const res = Event.update(
        {
          isApproved: 1,
          approveBy: user.id,
          adminId: [eventDetail.createdId],
        },
        {
          where: {
            eventId,
          },
        }
      );

      return res;
    } else if (user.role !== "superadmin" && user.role !== "Admin") {
      throw new BadRequestError({
        field: "ctx",
        message: "Bạn không có quyền chỉnh sửa thông tin này.",
      });
    }
  } catch (error) {
    throw new NotFoundError({
      field: "eventId",
      message: "Không tìm thấy sự kiện",
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
      message: "Không tìm thấy cộng tác viên này.",
    });
  }
};

const countUserReportInEventOfCollaborator = async (userId) => {
  try {
    const currentTime = new Date(Date.now());

    // const listActiveEvent = await MySQLClient.query(
    //   `SELECT * FROM Events WHERE JSON_CONTAINS(JSON_EXTRACT(Events.adminId, '$[*]'), '${userId}') AND endAt > now() AND isApproved = 1`,
    //   { type: "SELECT" }
    // );

    const listEvents = await MySQLClient.query(
      `SELECT * FROM Events WHERE JSON_CONTAINS(JSON_EXTRACT(Events.adminId, '$[*]'), '${userId}') AND isApproved = 1`,
      { type: "SELECT" }
    );

    const listActiveEvent = filter(
      listEvents,
      (item) => item.endAt > currentTime
    );
    const listUserOfAllEvent = await Promise.all(
      map(listEvents, async (event) => {
        const users = await UserEventService.listUserOfEvent(event.id);
        return users;
      })
    );

    const listUserOfActiveEvent = await Promise.all(
      map(listActiveEvent, async (event) => {
        const users = await UserEventService.listUserOfEvent(event.id);
        return users;
      })
    );

    const listReportInEvent = await Promise.all(
      map(listEvents, async (event) => {
        const report = await ReportService.listReportInEvent(event.id);
        return report;
      })
    );

    return {
      listUserOfAllEvent: flattenDeep(listUserOfAllEvent).length,
      listUserOfActiveEvent: flattenDeep(listUserOfActiveEvent).length,
      listReportInEvent: flattenDeep(listReportInEvent).length,
    };
  } catch (error) {
    console.log(error);

    throw new NotFoundError({
      field: "userId",
      message: "Không tìm thấy cộng tác viên này.",
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
      message: "Không tìm thấy cộng tác viên này.",
    });
  }
};

const getListUserEventsManageByCollaborator = async (ctx) => {
  const { user } = ctx;
  try {
    const listEvent = await countActiveEventOfCollaborator(user.id);

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
          attributes: ["id", "email", "name"],
          raw: true,
        });
        const getBanDetail = await BanService.getUserStatusInEvent(
          userEvent.userId,
          userEvent.eventId
        );
        const listReportNotResolved =
          await ReportService.listReportNotResolvedByUser(
            userEvent.userId,
            userEvent.eventId
          );

        const listReported = await ReportService.listAllReportOfUser(
          userEvent.userId
        );
        if (listReportNotResolved.reportDetail.length > 0) {
          return {
            rankInfo: getUserRank,
            eventInfo: getEvent,
            userInfo: getUserDetail,
            userBanInfo: getBanDetail,
            nbOfNotResolvedReport: listReportNotResolved,
            nbOfReport: listReported,
          };
        } else {
          return null;
        }
      })
    );

    return userEventData.filter(Boolean);
  } catch (error) {
    throw new NotFoundError({
      field: "ctx",
      message: "Không tìm thấy tài khoản này.",
    });
  }
};

const listEventManageByCollaborator = async (collabId) => {
  try {
    const listEvent = await countActiveEventOfCollaborator(collabId);
    const res = await Promise.all(
      map(listEvent, async (event) => {
        const adminApproved = await Admin.findOne({
          where: { id: event.approveBy },
          attributes: ["name"],
          raw: true,
        });
        const listUsers = await UserEventService.listUserOfEvent(event.id);
        const listReport = await ReportService.listReportInEvent(event.id);

        const result = {
          eventDetail: event,
          adminApproved: adminApproved.name,
          listUserInEvent: flattenDeep(listUsers),
          listReportInEvent: flattenDeep(listReport),
        };
        return result;
      })
    );

    return res;
  } catch (error) {
    throw new NotFoundError({
      field: "collabId",
      message: "Không tìm thấy cộng tác viên này.",
    });
  }
};

const listEventNotApproveByCollaborator = async (collabId) => {
  const currentTime = new Date(Date.now());
  try {
    const listEvent = await Event.findAll({
      where: {
        createId: collabId,
        isApproved: 0,
        endAt: {
          [Op.gt]: currentTime,
        },
      },
      raw: true,
    });

    return listEvent;
  } catch (error) {
    throw new NotFoundError({
      field: "collabId",
      message: "Không tìm thấy cộng tác viên này.",
    });
  }
};

const listCollaboratorInfo = async (ctx) => {
  const { user } = ctx;

  try {
    if (user.role === "superadmin" || user.role === "Admin") {
      const listCollaborator = await Admin.findAll({
        where: {
          role: "ctv1",
        },
        attributes: ["id", "name", "isActive", "updatedBy"],
        raw: true,
      });

      const res = await Promise.all(
        map(listCollaborator, async (collaborator) => {
          const info = await listEventManageByCollaborator(collaborator.id);
          return { ...collaborator, info };
        })
      );

      return res;
    } else if (user.role !== "superadmin" && user.role !== "Admin") {
      throw new BadRequestError({
        field: "ctx",
        message: "Bạn không có quyền chỉnh sửa thông tin này.",
      });
    }
  } catch (error) {
    console.log(error);

    throw new NotFoundError({
      field: "listCollaborator",
      message: "Không tìm thấy cộng tác viên này.",
    });
  }
};

const assignEventAdmin = async (ctx, payload) => {
  const { user } = ctx;
  const { eventId, collaboratorId } = payload;
  let list = [];
  try {
    const listAdmins = await Event.findOne({
      where: {
        id: eventId,
        isApproved: 1,
      },
      attributes: ["adminId"],
      raw: true,
    });

    if (!listAdmins) {
      throw new BadRequestError({
        field: "eventId",
        message: "Không tìm thấy sự kiện.",
      });
    }

    const isAdmin = await listAdmins.adminId.includes(user.id);

    const admins = listAdmins.adminId;

    if (isAdmin === true) {
      await list.push(...admins, collaboratorId);

      const res = await Event.update(
        {
          adminId: list,
        },
        {
          where: {
            id: eventId,
          },
        }
      );

      return { status: 200 };
    } else if (isAdmin === false) {
      throw new BadRequestError({
        field: "ctx",
        message: "Bạn không có quyền chỉnh sửa thông tin này.",
      });
    }
  } catch (error) {
    throw new NotFoundError({
      field: "eventId",
      message: "Không tìm thấy sự kiện này.",
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
  listCollaboratorInfo,
  listEventByAdmin,
  assignEventAdmin,
  countUserReportInEventOfCollaborator,
  listEventNotApproveByCollaborator,
};
