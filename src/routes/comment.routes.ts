import CommentController from "../controller/comment.controller";

export default (app) => {
  app
    .get("/commentbypost", CommentController.listCommentByPost)
    .post("/comment", CommentController.create)
    .put("/comment/:id", CommentController.edit)
    .delete("/comment/:id", CommentController.deleteComment);
};
