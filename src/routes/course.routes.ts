import CourseController from "../controller/course.controller";

export default (app) => {
  app.post("/course", CourseController.create);
};
