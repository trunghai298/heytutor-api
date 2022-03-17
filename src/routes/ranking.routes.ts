import RaningController from "../controller/ranking";

export default (app) => {
  app.post("/user-ranking", RaningController.getRanking);
};
