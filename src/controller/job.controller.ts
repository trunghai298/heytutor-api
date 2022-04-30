import UserPermissionService from "../services/user-permission.service";
const cron = require("node-cron");

const dailyCheck = () => {
  try {
    cron.schedule("*/30 * * * *", async function () {
      // await UserPermissionService.checkBan();
      // console.log("UserPermissionService checkBan success!");
      await UserPermissionService.checkUnBan();
      console.log("UserPermissionService checkUnBan success!");
    });
    cron.schedule("0 */2 * * *", async function () {
      await UserPermissionService.checkEventPermission();
      console.log("UserPermissionService checkEventPermission success!");
    });
  } catch (error) {
    console.log(error);
  }
};

export default {
  dailyCheck,
};
