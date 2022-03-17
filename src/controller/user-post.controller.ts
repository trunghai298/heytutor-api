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

const listRegisteredRequests = (req, res, next) => {
  UserPostServices.listRegisteredRequests(
    req.ctx,
    req.query.limit,
    req.query.offset
  )
    .then((result) => res.json(result))
    .catch(next);
};

const countRegisterOfPost = (req, res, next) => {
  UserPostServices.countRegisterOfPost(req.ctx, req.query.limit, req.query.offset)
    .then((result) => res.json(result))
    .catch(next);
};

export default {
  getPostStats,
  updatePostStatus,
  listRegisteredRequests,
  countRegisterOfPost,
};
