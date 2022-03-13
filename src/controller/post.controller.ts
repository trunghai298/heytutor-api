import PostServices from "../services/post.service";

const create = (req, res, next) => {
  PostServices.create(req.body)
    .then((post) => res.json(post))
    .catch(next);
};

const update = (req, res, next) => {
  PostServices.update(req.body)
    .then((post) => res.json(post))
    .catch(next);
};

const listAllPost = (req, res, next) => {
  PostServices.listAllPost(req.query.limit, req.query.offset)
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

const getListPostByFilter = (req, res, next) => {
  PostServices.getListPostByFilter(req.body, req.ctx)
    .then((posts) => res.json(posts))
    .catch(next);
};

const listPostDetailByPostId = (req, res, next) => {
  PostServices.getAllDetailsByPostId(req.params.postId)
    .then((posts) => res.json(posts))
    .catch(next);
};

export default {
  listPostByUserId,
  listAllPost,
  create,
  update,
  edit,
  deletePost,
  getListPostByFilter,
  listPostDetailByPostId,
};
