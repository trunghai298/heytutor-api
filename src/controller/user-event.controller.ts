import UserEventServices from "../services/user-event.service";

const list = (req, res, next) => {
  UserEventServices.list(req.body)
    .then((result) => res.json(result))
    .catch(next);
};

const registerEvent = (req, res, next) => {
  UserEventServices.registerEvent(req.body)
    .then((result) => res.json(result))
    .catch(next);
};

export default {
  list,
  registerEvent,
};
