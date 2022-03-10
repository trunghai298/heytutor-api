import PostController from "../controller/post.controller";

export default (app) => {
  app
    .get("/list-post", PostController.list)
    .post("/post", PostController.create)
    .put("/post/:id", PostController.edit)
    .delete("/post/:id", PostController.deletePost)
    .get(
      "/get-number-people-comment-of-post/:postId",
      PostController.numberPplCommentedInPost
    );
};
