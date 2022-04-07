import UserPermissionService from "../services/user-permission.service";
const cron = require("node-cron");

const checkBan = () => {
  cron.schedule("*/30 * * * *", async function () {
    await UserPermissionService.checkBan();
    await UserPermissionService.checkUnBan();
  });
};

export default {
  checkBan,
};
