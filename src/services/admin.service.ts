import Admin from "../models/admin.model";
import Activity from "../models/activity.model";
import usersService from "./users.service";

const addCollaborator = async (ctx, payload) => {
  const { email, password, name, role, permission } = payload;
  const userId = ctx?.user?.id || 2;
  try {
    const user = await Admin.findOne({
      where: { email },
      raw: true,
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
  const { email, password, name, role, permission } = payload;
  const userId = ctx?.user?.id || 2;
  try {
    const admin = await Admin.findAll({
      where: { email },
    });
    if (admin.length !== 0) {
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
        })
      ).name;
      const log = await Activity.create({
        userId,
        username,
        action: "update",
        content: `collaborator ${name}`,
      });
      return {
        log,
      };
    } else {
      return {
        message: "User did not existed",
      };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

const listAllCollaborator = async () => {
  try {
    const listCollaborator = await Admin.findAll();
    return listCollaborator;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export default {
  addCollaborator,
  updateCollaborator,
  listAllCollaborator,
};
