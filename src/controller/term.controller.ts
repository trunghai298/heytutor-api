import TermServices from "../services/term.service";

const addTerm = (req, res, next) => {
  TermServices.addTerm(req.body)
    .then((term) => res.json(term))
    .catch(next);
};

const updateTerm = (req, res, next) => {
  TermServices.updateTerm(req.body.id, req.body.payload)
  .then((term) => res.json(term))
  .catch(next);
}

export default {
  addTerm,
  updateTerm,
};
