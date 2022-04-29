import NotificationServices from "../services/notification.service";

const listNotification = (req, res, next) => {
  console.log("req ctx", req.ctx);
  NotificationServices.listNotification(req.ctx)
    .then((result) => res.json(result))
    .catch(next);
};

const readNoti = (req, res, next) => {
  NotificationServices.readNoti(req.body.notiId)
    .then((result) => res.json(result))
    .catch(next);
};

export default {
  listNotification,
  readNoti,
};
