import UserPostController from "../controller/user-post.controller";

export default (app) => {
  app
    .get("/user-post/stats", UserPostController.getPostStats)
    .put("/update-user-status", UserPostController.updatePostStatus)
    .get(
      "/get-register-detail",
      UserPostController.countRegisterOfPost
    )

};
