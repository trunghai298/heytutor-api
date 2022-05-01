import ClassController from "../controller/class.controller";

export default (app) => {
  app
    .post("/class", ClassController.create)
    .get("/count-class", ClassController.count)
    .get("/list-class", ClassController.list);
};
