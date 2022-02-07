import DeptServices from "../services/department";

const create = (req, res, next) => {
  DeptServices.addDept(req.body)
    .then((dept) => res.json(dept))
    .catch(next);
};

export default {
  create,
};
