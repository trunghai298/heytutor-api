import PostServices from "../services/post.service";

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

const numberPplCommentedInPost = (req, res, next) => {
  PostServices.countPeopleCmtOfPost(req.params.postId)
  .then((comment) => res.json(comment))
  .catch(next);
};

const requestsInfoByUser = (req, res, next) => {
  PostServices.getListPostByUser(req.params.filter, req.params.limit, req.params.offset)
  .then((request) => res.json(request))
  .catch(next);
}

export default {
  list,
  create,
  edit,
  deletePost,
  numberPplCommentedInPost,
  requestsInfoByUser,
};
