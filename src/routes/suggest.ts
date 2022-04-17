import SuggestController from "../controller/suggest.controller";

export default (app) => {
  app.get("/suggest-home", SuggestController.suggestHome);
};
