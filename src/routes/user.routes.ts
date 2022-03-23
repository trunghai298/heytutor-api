import UserController from "../controller/user.controller";

export default (app: any) => {
  app
    .get("/user/:userId", UserController.getUser)
    .get("/user/:email", UserController.fetchByEmail)
    .get("/user-request-stats/:userId", UserController.getUserPostStats)
    .get("/supporter-request-stats/:userId", UserController.getSupporterStats);
};
