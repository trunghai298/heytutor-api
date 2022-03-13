import { uploadFile } from './../utils/file';
import UserPostController from "../controller/user-post.controller";

export default (app) => {
  app.get("/user-post/stats", UserPostController.getPostStats);
  app.update("/update-user-status", UserPostController.getPostStats);
};
