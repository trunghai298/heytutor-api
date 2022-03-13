import UserPostServices from "../services/user-post.service";

const getPostStats = (req, res, next) => {
  UserPostServices.getPostStats(req.ctx)
    .then((result) => res.json(result))
    .catch(next);
};

const updatePostStatus = (req, res, next) => {
  UserPostServices.updatePostStatus(req.body)
    .then((result) => res.json(result))
    .catch(next);
};

export default {
  getPostStats,
  updatePostStatus,
};
