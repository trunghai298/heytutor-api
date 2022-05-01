import CourseController from "../controller/course.controller";

export default (app) => {
  app
    .post("/course", CourseController.create)
    .get("/list-course", CourseController.list)
    .get("/count-course", CourseController.count);
};
