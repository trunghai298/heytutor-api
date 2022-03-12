import SearchController from "../controller/search";

export default (app) => {
  app.get("/search", SearchController.search);
};
