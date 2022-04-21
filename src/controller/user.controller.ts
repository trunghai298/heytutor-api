import PinServices from "../services/pin.services";
import UserServices from "../services/users.service";

const fetchByEmail = (req, res, next) => {
  UserServices.fetchByEmail(req.params.email)
    .then((user) => res.json(user))
    .catch(next);
};

const getUser = (req, res, next) => {
  UserServices.getUserInfoById(req.params.userId)
    .then((user) => res.json(user))
    .catch(next);
};

const getUserPostStats = (req, res, next) => {
  UserServices.getUserPostStats(req.params.userId)
    .then((data) => res.json(data))
    .catch(next);
};

const getSupporterStats = (req, res, next) => {
  UserServices.getSupporterStats(req.params.userId)
    .then((data) => res.json(data))
    .catch(next);
};

const searchSuggest = (req, res, next) => {
  UserServices.searchSuggest(req.body.key)
    .then((data) => res.json(data))
    .catch(next);
};

const createPostPin = async (req, res, next) => {
  PinServices.createPostPin(req.ctx, req.body.postId)
  .then((data) => res.json(data))
  .catch(next);
}

const userUnPinPost = async (req, res, next) => {
  PinServices.userUnPinPost(req.ctx, req.body.postId)
  .then((data) => res.json(data))
  .catch(next);
}

export default {
  fetchByEmail,
  getUser,
  getUserPostStats,
  getSupporterStats,
  searchSuggest,
  createPostPin,
  userUnPinPost,
};
