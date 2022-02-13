import StudentServices from "../services/student";

const fetch = (req, res, next) => {
  StudentServices.fetchById(req.params.stdId)
    .then((student) => res.json(student))
    .catch(next);
};

const list = (req, res, next) => {
  StudentServices.list(req.query.limit, req.query.offset)
    .then((students) => res.json(students))
    .catch(next);
};

export default {
  fetch,
  list,
};
