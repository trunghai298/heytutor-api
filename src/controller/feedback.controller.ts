import FeedbackService from "../services/feedback.service";

const addNewFeedback = (req, res, next) => {
  FeedbackService.newFeedback(req.ctx, req.body)
    .then((result) => res.json(result))
    .catch(next);
};

export default {
  addNewFeedback,
};
