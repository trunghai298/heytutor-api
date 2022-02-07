import StudentServices from "../services/student";

const fetch = (req, res, next) => {
  StudentServices.fetchById(req.params.stdId)
    .then((student) => res.json(student))
    .catch(next);
};

export default {
  fetch,
};
