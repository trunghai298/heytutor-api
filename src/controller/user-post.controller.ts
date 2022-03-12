import UserPostServices from "../services/user-post.service";

const list = (req, res, next) => {
  UserPostServices.list(req.body)
    .then((result) => res.json(result))
    .catch(next);
};

export default {
  list,
};
