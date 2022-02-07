import CourseController from "../controller/course";

export default (app) => {
  app.post("/course", CourseController.create);
};
