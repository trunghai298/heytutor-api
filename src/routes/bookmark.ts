import BookmarkController from "../controller/bookmark";

export default (app) => {
  app
    .get("/list-bookmark", BookmarkController.listBookmark)
    .get("/list-bookmark-lite", BookmarkController.listBookmarkLite)
    .post("/add-bookmark", BookmarkController.addBookmark)
    .delete("/remove-bookmark", BookmarkController.removeBookmark);
};
