import ClassServices from "../services/class.service";

const create = (req, res, next) => {
  ClassServices.addClass(req.body)
    .then((c) => res.json(c))
    .catch(next);
};

const list = (req, res, next) => {
  ClassServices.list(req.query.limit, req.query.offset)
    .then((students) => res.json(students))
    .catch(next);
};

export default {
  create,
  list,
};
