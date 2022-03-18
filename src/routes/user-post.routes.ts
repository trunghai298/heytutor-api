import UserPostController from "../controller/user-post.controller";

export default (app) => {
  app
    .get("/user-post/stats", UserPostController.getPostStats)
    .put("/update-user-status", UserPostController.updatePostStatus)
    .get("/user-post/registered", UserPostController.listRegistedRequests)
    .get("/user-post/my-request", UserPostController.getListMyRequests);
};
