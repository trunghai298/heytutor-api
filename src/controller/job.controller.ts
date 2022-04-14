import UserPermissionService from "../services/user-permission.service";
const cron = require("node-cron");

const checkBan = () => {
  try {
    cron.schedule("*/30 * * * *", async function () {
      await UserPermissionService.checkBan();
      console.log("UserPermissionService checkBan success!");
      await UserPermissionService.checkUnBan();
      console.log("UserPermissionService checkUnBan success!");
    });
  } catch (error) {
    console.log(error);
  }
};

export default {
  checkBan,
};
