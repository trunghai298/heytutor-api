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

const getEventPost = (req, res, next) => {
  EventServices.getEventPost(req.params.eventId)
    .then((evt) => res.json(evt))
    .catch(next);
};


const getEventUser = (req, res, next) => {
  EventServices.getEventUser(req.params.eventId)
    .then((evt) => res.json(evt))
    .catch(next);
};

export default {
  create,
  edit,
  deleteEvent,
  getEventPost,
  getEventUser,
};
