import UserPostController from "../controller/user-post.controller";

export default (app) => {
  app.get("/user-post/list", UserPostController.list);
};
