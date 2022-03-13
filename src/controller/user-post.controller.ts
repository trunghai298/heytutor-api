import UserPostServices from "../services/user-post.service";

const getPostStats = (req, res, next) => {
  UserPostServices.getPostStats(req.body.userId)
    .then((result) => res.json(result))
    .catch(next);
};

export default {
  getPostStats,
};
