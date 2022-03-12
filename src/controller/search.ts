import SearchServices from "../services/search";

const search = (req, res, next) => {
  SearchServices.search(req.query.query)
    .then((data) => res.json(data))
    .catch(next);
};

export default {
  search,
};
