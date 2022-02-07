import TermServices from "../services/term";

const addTerm = (req, res, next) => {
  TermServices.addTerm(req.body)
    .then((term) => res.json(term))
    .catch(next);
};

export default {
  addTerm,
};
