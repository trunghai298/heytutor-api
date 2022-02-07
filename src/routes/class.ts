import ClassController from "../controller/class";

export default (app) => {
  app.post("/class", ClassController.create);
};
