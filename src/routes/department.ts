import DeptController from "../controller/department";

export default (app) => {
  app.post("/dept", DeptController.create);
};
