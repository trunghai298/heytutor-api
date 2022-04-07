import ReportService from "../services/report.service";

const createReport = (req, res, next) => {
  ReportService.createReport(req.ctx, req.body)
    .then((result) => res.json(result))
    .catch(next);
};

const listReportResolvedByUser = (req, res, next) => {
  ReportService.listReportResolvedByUser(req.body.userId)
    .then((result) => res.json(result))
    .catch(next);
};

const listReportNotResolvedByUser = (req, res, next) => {
  ReportService.listReportNotResolvedByUser(req.body.userId)
    .then((result) => res.json(result))
    .catch(next);
};

export default {
  createReport,
  listReportResolvedByUser,
  listReportNotResolvedByUser,
};
