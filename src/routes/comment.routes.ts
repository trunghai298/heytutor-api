import CommentController from "../controller/comment.controller";

export default (app) => {
  app
    .post("/comment", CommentController.create)
    .put("/comment/:id", CommentController.edit)
    .delete("/comment/:id", CommentController.deleteComment);
};
