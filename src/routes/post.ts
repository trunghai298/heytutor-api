import PostController from "../controller/post";

export default (app) => {
  app
    .get("/listPostByUserId/:userId", PostController.listPostByUserId)
    .get("/list-post", PostController.list)
    .post("/post", PostController.create)
    .put("/post/:id", PostController.edit)
    .put("/update-post", PostController.update)
    .delete("/post/:id", PostController.deletePost);
};
