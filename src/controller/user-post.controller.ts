import UserPostServices from "../services/user-post.service";

const getPostStats = (req, res, next) => {
  UserPostServices.getPostStats(req.ctx)
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
  UserPostServices.addRegister(req.ctx, req.body)
    .then((result) => res.json(result))
    .catch(next);
};

const unregister = (req, res, next) => {
  UserPostServices.unregister(req.ctx, req.body)
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
  addRegister,
};
