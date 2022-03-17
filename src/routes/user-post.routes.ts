import UserPostController from "../controller/user-post.controller";

export default (app) => {
  app.get("/user-post/stats", UserPostController.getPostStats);
  app.get("/user-post/registered", UserPostController.listRegisteredRequests);
  app.put("/update-user-status", UserPostController.updatePostStatus);
};
