import TermController from "../controller/term";

export default (app) => {
  app.post("/term", TermController.addTerm);
};
