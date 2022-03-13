import UserPostController from "../controller/user-post.controller";

export default (app) => {
  app.get("/user-post/stats", UserPostController.getPostStats)
  app.put("/update-user-status", UserPostController.updatePostStatus);
};
