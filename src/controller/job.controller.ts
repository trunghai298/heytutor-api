import UserPermissionService from '../services/user-permission.service';
const cron = require('node-cron');

const checkBan = ()  => {
  cron.schedule("*/30 * * * *", async function () {
    console.log("tetetettetes");
    UserPermissionService.checkBan();
    console.log("testt2");
    await UserPermissionService.checkUnBan();
    console.log("testt2333");
  });
};

export default {
  checkBan,
};
