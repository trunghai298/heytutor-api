import ClassController from "../controller/class.controller";

export default (app) => {
  app
    .post("/class", ClassController.create)
    .get("/list-class", ClassController.list);
};
