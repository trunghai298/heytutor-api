import ReportController from "../controller/report.controller";


export default (app) => {
    app
    .get('/testcheckreport', ReportController.test)
}