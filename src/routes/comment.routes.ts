import CommentController from "../controller/comment.controller";

export default (app) => {
  app
    .get("/api/comment/:postId", CommentController.listCommentByPost)
    .post("/comment", CommentController.create)
    .put("/comment/:id", CommentController.edit)
    .delete("/comment/:id", CommentController.deleteComment);
};
