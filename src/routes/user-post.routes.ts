import UserPostController from "../controller/user-post.controller";

export default (app) => {
  app
    .get("/user-post/stats", UserPostController.getPostStats)
    .get("/user-post/registered", UserPostController.listRegistedRequests)
    .get("/user-post/my-request", UserPostController.getListMyRequests)
    .put("/add-register", UserPostController.addRegister)
    .put("/remove-register", UserPostController.removeRegister)
    .put("/add-supporter", UserPostController.addSupporter)
    .put("/unregister", UserPostController.unregister)
    .put("/unsupport", UserPostController.unsupport)
    .get(
      "/get-registered-near-deadline",
      UserPostController.getRegisteredNearDeadline
    )
    .get("/post-done-of-user", UserPostController.postDoneOfUser);
};
