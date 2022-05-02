import UserPostServices from "../services/user-post.service";

const getPostStats = (req, res, next) => {
  UserPostServices.getPostStats(req.ctx, req.query.filters)
    .then((result) => res.json(result))
    .catch(next);
};

const getListMyRequests = (req, res, next) => {
  UserPostServices.getListMyRequests(req.ctx, req.query.limit, req.query.offset)
    .then((result) => res.json(result))
    .catch(next);
};

const listRegistedRequests = (req, res, next) => {
  UserPostServices.listRegistedRequests(req.ctx, req.query)
    .then((result) => res.json(result))
    .catch(next);
};

const removeRegister = (req, res, next) => {
  UserPostServices.removeRegister(req.ctx, req.body)
    .then((result) => res.json(result))
    .catch(next);
};

const addSupporter = (req, res, next) => {
  UserPostServices.addSupporter(req.ctx, req.body)
    .then((result) => res.json(result))
    .catch(next);
};

const addRegister = (req, res, next) => {
  UserPostServices.addRegister(req.ctx, req.body.postId)
    .then((result) => res.json(result))
    .catch(next);
};

const unregister = (req, res, next) => {
  UserPostServices.cancelRegister(req.ctx, req.body)
    .then((result) => res.json(result))
    .catch(next);
};

const unsupport = (req, res, next) => {
  UserPostServices.unsupport(req.ctx, req.body)
    .then((result) => res.json(result))
    .catch(next);
};
const getRegisteredNearDeadline = async (req, res, next) => {
  UserPostServices.getRegisteredNearDeadline(req.ctx)
    .then((result) => res.json(result))
    .catch(next);
};

const postDoneOfUser = async (req, res, next) => {
  UserPostServices.postDoneOfUser(req.ctx)
    .then((result) => res.json(result))
    .catch(next);
};

export default {
  getPostStats,
  getListMyRequests,
  listRegistedRequests,
  removeRegister,
  addSupporter,
  unregister,
  unsupport,
  addRegister,
  getRegisteredNearDeadline,
  postDoneOfUser,
};
