import PostController from "../controller/post.controller";

export default (app) => {
  app
    .post("/post", PostController.create)
    .put("/post/:id", PostController.edit)
    .delete("/post/:id", PostController.deletePost)
    .get("/get-list-post-by-filter", PostController.getListPostByFilter)
    .get("/get-postdetail-by-postid/:postId", PostController.listPostDetailByPostId)
    .get("/get-list-hashtag", PostController.getListHashtag)
  };
