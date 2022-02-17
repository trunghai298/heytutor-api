import multer from "multer";
import FileCtrl from "../controller/file";
import { Application } from "express";

const upload = multer({ storage: multer.memoryStorage() });

const routes = (app: Application) => {
  app.post(
    "/file/upload/:type",
    (req, res, next) => upload.array(req.params.type)(req, res, next),
    FileCtrl.upload
  );
};

export default routes;
