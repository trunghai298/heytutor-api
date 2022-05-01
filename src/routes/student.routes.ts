import StdController from "../controller/student.controller";

export default (app: any) => {
  app
    .get("/student/:id", StdController.fetch)
    .get("/list-student", StdController.list)
    .get("/count-student", StdController.count)
    .get("/subject-by-major", StdController.subjectGroupByMajor);
};
