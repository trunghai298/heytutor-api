import BookmarkServices from "../services/bookmark";

const listBookmark = (req, res, next) => {
  BookmarkServices.listBookmark(req.ctx)
    .then((result) => res.json(result))
    .catch(next);
};

const listBookmarkLite = (req, res, next) => {
  BookmarkServices.listBookmarkLite(req.ctx)
    .then((result) => res.json(result))
    .catch(next);
};

const addBookmark = (req, res, next) => {
  BookmarkServices.addBookmark(req.body, req.ctx)
    .then((result) => res.json(result))
    .catch(next);
};

const removeBookmark = (req, res, next) => {
  BookmarkServices.removeBookmark(req.body, req.ctx)
    .then((result) => res.json(result))
    .catch(next);
};

export default {
  listBookmarkLite,
  removeBookmark,
  addBookmark,
  listBookmark,
};
