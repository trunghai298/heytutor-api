import DeptController from "../controller/department.controller";

export default (app) => {
  app.post("/dept", DeptController.create);
};
