import ReportService from "../services/report.service";
import PinServices from "../services/pin.services";
import UserServices from "../services/users.service";
import UserPostService from "../services/user-post.service";
// import FeedbackService from "../services/feedback.service";

const fetchByEmail = (req, res, next) => {
  UserServices.fetchByEmail(req.params.email)
    .then((user) => res.json(user))
    .catch(next);
};

const getUser = (req, res, next) => {
  UserServices.getUserInfoById(
    req.query.userId,
    req.query.limit,
    req.query.offset
  )
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

const userCreatePostPin = async (req, res, next) => {
  PinServices.createPostPin(req.ctx, req.body.postId)
    .then((data) => res.json(data))
    .catch(next);
};

const userUnPinPost = async (req, res, next) => {
  PinServices.userUnPinPost(req.ctx, req.body.postId)
    .then((data) => res.json(data))
    .catch(next);
};

const createReport = async (req, res, next) => {
  ReportService.createReport(req.ctx, req.body)
    .then((data) => res.json(data))
    .catch(next);
};

const requestPostDone = async (req, res, next) => {
  UserPostService.userRequestDone1vs1(req.ctx, req.query.postId)
    .then((data) => res.json(data))
    .catch(next);
};

// const feedbackByUser = async (req, res, next) => {
//   FeedbackService.feedbackByUser(
//     req.query.userId,
//     req.query.limit,
//     req.query.offset
//   )
//     .then((data) => res.json(data))
//     .catch(next);
// };

export default {
  fetchByEmail,
  getUser,
  getUserPostStats,
  getSupporterStats,
  searchSuggest,
  userCreatePostPin,
  userUnPinPost,
  createReport,
  requestPostDone,
  // feedbackByUser,
};
