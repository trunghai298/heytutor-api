import StudentServices from "../services/student.service";

const fetch = (req, res, next) => {
  StudentServices.fetchById(req.params.id)
    .then((student) => res.json(student))
    .catch(next);
};

const list = (req, res, next) => {
  StudentServices.list(req.query.limit, req.query.offset)
    .then((students) => res.json(students))
    .catch(next);
};

const subjectGroupByMajor = (req, res, next) => {
  StudentServices.subjectGroupByMajor()
  .then((student) => res.json(student))
  .catch(next);
}

export default {
  fetch,
  list,
  subjectGroupByMajor,
};
