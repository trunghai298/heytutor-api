import EventServices from "../services/event";

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

export default {
  create,
  edit,
  deleteEvent,
};
