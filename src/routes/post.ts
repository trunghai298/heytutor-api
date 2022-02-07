import PostController from "../controller/post";

export default (app) => {
  app
    .post("/post", PostController.create)
    .put("/post/:id", PostController.edit)
    .delete("/post/:id", PostController.deletePost);
};
