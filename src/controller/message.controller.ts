import MessageServices from "../services/message.service";

const create = (req, res, next) => {
  MessageServices.create(req.body, req.ctx)
    .then((msg) => res.json(msg))
    .catch(next);
};

const list = (req, res, next) => {
  MessageServices.listMessages(req.query)
    .then((msg) => res.json(msg))
    .catch(next);
};

const checkUnreadMessage = (req, res, next) => {
  MessageServices.checkUnreadMessage(req.ctx, req.query)
  .then((msg) => res.json(msg))
  .catch(next);
}

export default {
  create,
  list,
  checkUnreadMessage,
};
