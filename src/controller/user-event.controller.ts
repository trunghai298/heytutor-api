import UserEventServices from "../services/user-event.service";

const list = (req, res, next) => {
  UserEventServices.list()
    .then((result) => res.json(result))
    .catch(next);
};

const joinEvent = (req, res, next) => {
  UserEventServices.joinEvent(req.ctx, req.query.eventId)
    .then((result) => res.json(result))
    .catch(next);
};

const unJoinEvent = (req, res, next) => {
  UserEventServices.unJoinEvent(req.ctx, req.query.eventId)
    .then((result) => res.json(result))
    .catch(next);
};

const checkUserInEvent = (req, res, next) => {
  UserEventServices.checkUserInEvent(req.ctx, req.query.eventId)
    .then((result) => res.json(result))
    .catch(next);
};

export default {
  list,
  joinEvent,
  unJoinEvent,
  checkUserInEvent,
};
