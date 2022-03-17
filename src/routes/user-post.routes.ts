import UserPostController from "../controller/user-post.controller";

export default (app) => {
  app
    .get("/user-post/stats", UserPostController.getPostStats)
    .get("/user-post/registered", UserPostController.listRegisteredRequests)
    .put("/update-user-status", UserPostController.updatePostStatus)
    .get(
      "/get-register-detail",
      UserPostController.countRegisterOfPost
    )

};
