import ReportController from "../controller/report.controller";


export default (app) => {
    app
    .put('/report/create-report', ReportController.createReport)
    .get('/report/list-unresolved', ReportController.listReportNotResolvedByUser)
    .get('report/list-resolved', ReportController.listReportResolvedByUser)
}