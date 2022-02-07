import StdController from "../controller/student";

export default (app: any) => {
  app.get("/student/:id", StdController.fetch);
};
