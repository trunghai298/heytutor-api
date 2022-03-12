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

const listByUserRole = (req, res, next) => {
  PostServices.listPostByUser(req.query.limit, req.query.offset, req.ctx)
    .then((posts) => res.json(posts))
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

const likePost = (req, res, next) => {
  PostServices.likePost(req.body, req.ctx)
    .then((post) => res.json(post))
    .catch(next);
};

const deletePost = (req, res, next) => {
  PostServices.deletePost(req.params.postId)
    .then((post) => res.json(post))
    .catch(next);
};

const numberPplCommentedInPost = (req, res, next) => {
  PostServices.countPeopleCmtOfPost(req.params.postId)
    .then((comment) => res.json(comment))
    .catch(next);
};

const requestsInfoByUser = (req, res, next) => {
  PostServices.getListPostByUser(
    req.params.filter,
    req.params.limit,
    req.params.offset
  )
    .then((request) => res.json(request))
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
  likePost,
  listPostByUserId,
  listByUserRole,
  listAllPost,
  create,
  update,
  edit,
  deletePost,
  numberPplCommentedInPost,
  requestsInfoByUser,
};
