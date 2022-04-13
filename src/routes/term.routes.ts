import TermController from "../controller/term.controller";

export default (app) => {
  app.post("/term", TermController.addTerm)
  .put("/update-term", TermController.updateTerm)
};
