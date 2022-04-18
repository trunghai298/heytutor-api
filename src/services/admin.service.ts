import { Op } from "sequelize";
import Admin from "../models/admin.model";
import Event from "../models/event.model";
import Activity from "../models/activity.model";
import Post from "../models/post.model";
import UserPost from "../models/user-post.model";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { map } from "lodash";
import EventService from "./event.service";
import { NOTI_TYPE } from "../constants/notification";
import NotificationService from "./notification.service";

const createAdmin = async () => {
  const admin = await Admin.findOne({ where: { name: "root" }, raw: true });

  if (admin) {
    return admin;
  }

  return Admin.create({
    email: "admin@heytutor.com",
    name: "root",
    password: "root",
    role: "superadmin",
    permissions: "all",
  });
};

const addCollaborator = async (ctx, payload) => {
  const { email, password, name, role, permission } = payload;
  const userId = ctx?.user?.id;
  try {
    const user = await Admin.findOne({
      where: { email },
    });
    if (user === null) {
      const res = await Admin.create({
        email,
        password,
        name,
        role,
        permission,
      });
      const username = await (
        await Admin.findOne({
          where: {
            id: userId,
          },
        })
      ).name;
      const log = await Activity.create({
        userId,
        username,
        action: "add",
        content: `new collaborator ${name}`,
      });

      const id = await Admin.count();
      const payload = {
        userId: id,
        notificationType: NOTI_TYPE.NewCollab,
        fromUserId: userId,
        fromUsername: username,
      };
      await NotificationService.create(payload);

      return {
        log,
      };
    } else {
      return {
        message: "User already existed",
      };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const updateCollaborator = async (ctx, payload) => {
  const { id, email, name, role, permission } = payload;
  const userId = ctx?.user?.id;
  try {
    const res = await Admin.update(
      {
        name,
        role,
        permission,
      },
      {
        where: {
          email,
        },
      }
    );
    const username = await (
      await Admin.findOne({
        where: {
          id: userId,
        },
        raw: true,
      })
    ).name;
    const log = await Activity.create({
      userId,
      username,
      action: "update",
      content: `collaborator ${name}`,
    });

    const payload = {
      userId: id,
      notificationType: NOTI_TYPE.UpdateCollab,
      fromUserId: userId,
      fromUsername: username,
    };
    await NotificationService.create(payload);
    return {
      log,
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

const listAllCollaborator = async () => {
  try {
    const listCollaborator = await Admin.findAll({ raw: true });
    return listCollaborator;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const listEventInXDays = async (nbFromDays, nbToDays) => {
  const currentDate = new Date(Date.now() - nbFromDays * 24 * 60 * 60 * 1000);
  const XDaysBefore = new Date(Date.now() - nbToDays * 24 * 60 * 60 * 1000);
  try {
    const list = await Event.findAll({
      where: {
        createdAt: {
          [Op.lt]: currentDate,
          [Op.gt]: XDaysBefore,
        },
      },
      raw: true,
    });
    return list;
  } catch (error) {
    return error;
  }
};

const listPostInXDays = async (nbFromDays, nbToDays) => {
  const currentDate = new Date(Date.now() - nbFromDays * 24 * 60 * 60 * 1000);
  const XDaysBefore = new Date(Date.now() - nbToDays * 24 * 60 * 60 * 1000);

  try {
    const list = await Post.findAll({
      where: {
        createdAt: {
          [Op.lt]: currentDate,
          [Op.gt]: XDaysBefore,
        },
      },
      raw: true,
    });

    return list;
  } catch (error) {
    return error;
  }
};

const listNewRegisterInXDays = async (nbFromDays, nbToDays) => {
  const currentDate = new Date(Date.now() - nbFromDays * 24 * 60 * 60 * 1000);
  const XDaysBefore = new Date(Date.now() - nbToDays * 24 * 60 * 60 * 1000);
  try {
    const list = await UserPost.findAll({
      where: {
        createdAt: {
          [Op.lt]: currentDate,
          [Op.gt]: XDaysBefore,
        },
      },
      raw: true,
    });

    let tempArray = [];
    for (const array of list) {
      if (array.registerId !== null && array.registerId.length !== 0) {
        if (tempArray.length === 0) {
          tempArray = array.registerId;
        } else if (tempArray.length !== 0) {
          tempArray = tempArray.concat(array.registerId);
        }
      }
    }

    const listNewRegisterInXDays = [...new Set(tempArray)];

    return listNewRegisterInXDays;
  } catch (error) {
    return error;
  }
};

const systemDetailsInXDays = async (nbOfDays) => {
  const twoTimeNbOfDays = nbOfDays * 2;

  try {
    const listEventsInXDays = await listEventInXDays(0, nbOfDays);
    const nbEventInXDays = listEventsInXDays.length;
    const listPostsInXDays = await listPostInXDays(0, nbOfDays);
    const nbOfNewPostInXDays = listPostsInXDays.length;
    const listAllNewRegisterInXDays = await listNewRegisterInXDays(0, nbOfDays);
    const nbOfNewRegisterInXDays = listAllNewRegisterInXDays.length;

    const listEventInPreviousXDays = await listEventInXDays(
      nbOfDays,
      twoTimeNbOfDays
    );
    const nbEventInPreviousXDays = listEventInPreviousXDays.length;
    const listPostsInPreviousXDays = await listPostInXDays(
      nbOfDays,
      twoTimeNbOfDays
    );
    const nbOfNewPostInPreviousXDays = listPostsInPreviousXDays.length;
    const listAllNewRegisterInPreviousXDays = await listNewRegisterInXDays(
      nbOfDays,
      twoTimeNbOfDays
    );
    const nbOfNewRegisterInPreviousXDays =
      listAllNewRegisterInPreviousXDays.length;

    let percentXdaysEventChange = nbEventInXDays * 100;
    if (nbEventInPreviousXDays !== 0) {
      percentXdaysEventChange =
        ((nbEventInXDays - nbEventInPreviousXDays) / nbEventInPreviousXDays) *
        100;
    }

    let percentXdaysPostChange = nbOfNewPostInXDays * 100;
    if (nbOfNewPostInPreviousXDays !== 0) {
      percentXdaysPostChange =
        ((nbOfNewPostInXDays - nbOfNewPostInPreviousXDays) /
          nbEventInPreviousXDays) *
        100;
    }

    let percentXdaysRegisterChange = nbOfNewRegisterInXDays * 100;
    if (nbOfNewRegisterInPreviousXDays !== 0) {
      percentXdaysRegisterChange =
        ((nbOfNewRegisterInXDays - nbOfNewRegisterInPreviousXDays) /
          nbOfNewRegisterInPreviousXDays) *
        100;
    }

    return {
      nbEventInXDays,
      percentXdaysEventChange,
      nbOfNewPostInXDays,
      percentXdaysPostChange,
      nbOfNewRegisterInXDays,
      percentXdaysRegisterChange,
    };
  } catch (error) {
    return error;
  }
};

const listCollaborator = async () => {
  try {
    const listCollaborators = await Admin.findAll({
      where: {
        [Op.or]: [{ role: "ctv1" }, { role: "ctv2" }],
      },
      raw: true,
      logging: true,
    });

    const res = await Promise.all(
      map(listCollaborators, async (user) => {
        const nbOfPendingEvents =
          await EventService.countPendingEventOfCollaborator(user.id);

        const nbOfActiveEvents =
          await EventService.countActiveEventOfCollaborator(user.id);

        const collaboratorInfo = {
          userInfo: user,
          nbOfPendingEvents: nbOfPendingEvents.length,
          nbOfActiveEvents: nbOfActiveEvents.length,
        };

        return collaboratorInfo;
      })
    );

    return res;
  } catch (error) {
    throw new NotFoundError({
      field: "userId",
      message: "Collaborator is not found",
    });
  }
};

export default {
  createAdmin,
  addCollaborator,
  updateCollaborator,
  listAllCollaborator,
  systemDetailsInXDays,
  listCollaborator,
};
