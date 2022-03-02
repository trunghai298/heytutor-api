import BookmarkController from "../controller/bookmark";

export default (app) => {
  app.post("/list-bookmark", BookmarkController.listBookmark);
};
