import BookmarkServices from "../services/bookmark";

const listBookmark = (req, res, next) => {
  BookmarkServices.listBookmark(req.body)
    .then((result) => res.json(result))
    .catch(next);
};

export default {
  listBookmark,
};
