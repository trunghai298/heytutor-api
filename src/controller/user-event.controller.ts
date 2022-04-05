import UserEventServices from "../services/user-event.service";

const list = (req, res, next) => {
  UserEventServices.list(req.body)
    .then((result) => res.json(result))
    .catch(next);
};

const joinEvent = (req, res, next) => {
  UserEventServices.joinEvent(req.ctx, req.body)
    .then((result) => res.json(result))
    .catch(next);
};

const unJoinEvent = (req, res, next) => {  
  UserEventServices.unJoinEvent(req.ctx, req.body)
    .then((result) => res.json(result))
    .catch(next);
};

export default {
  list,
  joinEvent,
  unJoinEvent,
};
