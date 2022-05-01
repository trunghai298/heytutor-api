import CourseServices from "../services/course.service";

const create = (req, res, next) => {
  CourseServices.addCourse(req.body)
    .then((c) => res.json(c))
    .catch(next);
};

const list = (req, res, next) => {
  CourseServices.list(req.query.limit, req.query.offset)
    .then((students) => res.json(students))
    .catch(next);
};

const count = (req, res, next) => {
  CourseServices.count()
    .then((students) => res.json(students))
    .catch(next);
};

export default {
  create,
  list,
  count,
};
