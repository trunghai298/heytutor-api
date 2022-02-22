import PostServices from "../services/post";

const create = (req, res, next) => {
  PostServices.create(req.body)
    .then((post) => res.json(post))
    .catch(next);
};

const list = (req, res, next) => {
  PostServices.list(req.query.limit, req.query.offset)
    .then((posts) => res.json(posts))
    .catch(next);
};

const edit = (req, res, next) => {
  PostServices.edit(req.body)
    .then((post) => res.json(post))
    .catch(next);
};

const deletePost = (req, res, next) => {
  PostServices.deletePost(req.params.postId)
    .then((post) => res.json(post))
    .catch(next);
};

const listPostByUserId = (req, res, next) => {
  PostServices.listPostByUserId(
    req.params.userId,
    req.query.limit,
    req.query.offset
  )
    .then((posts) => res.json(posts))
    .catch(next);
};

export default {
  listPostByUserId,
  list,
  create,
  edit,
  deletePost,
};
