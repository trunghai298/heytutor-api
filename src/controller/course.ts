import CourseServices from "../services/course";

const create = (req, res, next) => {
  CourseServices.addCourse(req.body)
    .then((c) => res.json(c))
    .catch(next);
};

export default {
  create,
};
