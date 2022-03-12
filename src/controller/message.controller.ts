import MessageServices from "../services/message.service";

const create = (req, res, next) => {
  MessageServices.create(req.body, req.ctx)
    .then((msg) => res.json(msg))
    .catch(next);
};

const list = (req, res, next) => {
  MessageServices.listMessages(req.params, req.ctx)
    .then((msg) => res.json(msg))
    .catch(next);
};

export default {
  create,
  list,
};
