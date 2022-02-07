import ClassServices from "../services/class";

const create = (req, res, next) => {
  ClassServices.addClass(req.body)
    .then((c) => res.json(c))
    .catch(next);
};

export default {
  create,
};
