import ReportController from "../controller/report.controller";


export default (app) => {
    app
    .put('/report/create-report', ReportController)
}