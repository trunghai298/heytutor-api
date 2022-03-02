import PostController from "../controller/post";

export default (app) => {
  app
    .get("/listPostByUserId/:userId", PostController.listPostByUserId)
    .get("/list-post-by-user-role", PostController.listByUserRole)
    .get("/list-all-post", PostController.listAllPost)
    .post("/post", PostController.create)
    .put("/post/:id", PostController.edit)
    .put("/update-post", PostController.update)
    .put("/like-post", PostController.likePost)
    .delete("/post/:id", PostController.deletePost);
};
