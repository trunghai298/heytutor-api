import EventServices from "../services/event.service";

const create = (req, res, next) => {
  EventServices.create(req.body)
    .then((evt) => res.json(evt))
    .catch(next);
};

const edit = (req, res, next) => {
  EventServices.edit(req.body)
    .then((evt) => res.json(evt))
    .catch(next);
};

const deleteEvent = (req, res, next) => {
  EventServices.deleteEvent(req.params.eventId)
    .then((evt) => res.json(evt))
    .catch(next);
};

const getNumberPostOfEvent = (req, res, next) => {
  EventServices.getNumberPostOfEvent(req.params.eventId)
    .then((evt) => res.json(evt))
    .catch(next);
};

const getEventUser = (req, res, next) => {
  EventServices.getEventUser(req.params.eventId)
    .then((evt) => res.json(evt))
    .catch(next);
};

const getEventStats = (req, res, next) => {
  EventServices.getEventStats(req.params.eventId)
    .then((evt) => res.json(evt))
    .catch(next);
};

const getEventByUser = (req, res, next) => {
  EventServices.listEventByUser(req.ctx)
    .then((evt) => res.json(evt))
    .catch(next);
};

const getEventUserPostDetail = (req, res, next) => {
  EventServices.getEventUserPostDetail(req.ctx, req.params.eventId)
    .then((evt) => res.json(evt))
    .catch(next);
};

const getUserRoleInEvent = (req, res, next) => {
  EventServices.getEventUserPostDetail(req.ctx, req.params.eventId)
    .then((evt) => res.json(evt))
    .catch(next);
};

const getEventByDuration = (req, res, next) => {
  EventServices.getEventByDuration()
    .then((evt) => res.json(evt))
    .catch(next);
};

// const listActiveUser = (req, res, next) => {
//   EventServices.listActiveUser(req.params.eventId)
//     .then((evt) => res.json(evt))
//     .catch(next);
// };

const getListEventNotEnroll = (req, res, next) => {
  EventServices.getListEventNotEnroll(
    req.ctx,
    req.query.limit,
    req.query.offset
  )
    .then((evt) => res.json(evt))
    .catch(next);
};

export default {
  create,
  edit,
  deleteEvent,
  getNumberPostOfEvent,
  getEventUser,
  getEventStats,
  getEventByUser,
  getEventUserPostDetail,
  getUserRoleInEvent,
  getEventByDuration,
  // listActiveUser,
  getListEventNotEnroll,
};
