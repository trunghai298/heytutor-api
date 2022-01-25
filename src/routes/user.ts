import UserController from "../controller/user";

export default (app: any) => {
  app.get("/user/:email", UserController.fetchByEmail);
};
