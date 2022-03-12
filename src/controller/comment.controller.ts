import CommentServices from "../services/comment.service";

const listCommentByPost = (req, res, next) => {
  CommentServices.listComments(
    req.body.postId,
    req.query.limit,
    req.query.offset
  )
    .then((comments) => res.json(comments))
    .catch(next);
};

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
  listCommentByPost,
  create,
  edit,
  deleteComment,
};
