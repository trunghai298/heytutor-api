import SuggestServices from "../services/suggest.service";

const suggestHome = (req, res, next) => {
  SuggestServices.suggestHome(req.ctx)
    .then((data) => res.json(data))
    .catch(next);
};

const listCourse = (req, res, next) => {
  SuggestServices.getListCourse()
    .then((data) => res.json(data))
    .catch(next);
};

export default {
  suggestHome,
  listCourse,
};
