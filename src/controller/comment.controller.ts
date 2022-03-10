import CommentServices from "../services/comment.service";

const create = (req, res, next) => {
  CommentServices.create(req.body, req.ctx)
    .then((comment) => res.json(comment))
    .catch(next);
};

const edit = (req, res, next) => {
  CommentServices.edit(req.params.commentId, req.body, req.ctx)
    .then((comment) => res.json(comment))
    .catch(next);
};

const deleteComment = (req, res, next) => {
  CommentServices.deleteComment(req.params.commentId, req.ctx)
    .then((evt) => res.json(evt))
    .catch(next);
};

export default {
  create,
  edit,
  deleteComment,
};
