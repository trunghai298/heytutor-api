import EventService from "../services/event.service";
import PinServices from "../services/pin.services";
import AdminServices from "../services/admin.service";
import RankingService from "../services/ranking.service";
import ReportService from "../services/report.service";

const createAdmin = (req, res, next) => {
  try {
    AdminServices.createAdmin().then((result) =>
      res.json({ success: true, username: "root" })
    );
  } catch (error) {
    next(error);
  }
};

const addCollaborator = (req, res, next) => {
  AdminServices.addCollaborator(req.ctx, req.body)
    .then((result) => res.json(result))
    .catch(next);
};

const updateCollaborator = (req, res, next) => {
  AdminServices.updateCollaborator(req.ctx, req.body)
    .then((result) => res.json(result))
    .catch(next);
};

// const listAllCollaborator = (req, res, next) => {
//   AdminServices.listAllCollaborator()
//     .then((result) => res.json(result))
//     .catch(next);
// };

const systemDetailsInXDays = (req, res, next) => {
  AdminServices.systemDetailsInXDays(req.ctx, req.query.nbOfDays)
    .then((result) => res.json(result))
    .catch(next);
};

const approveEvent = async (req, res, next) => {
  EventService.approveEvent(req.ctx, req.body.eventId)
    .then((result) => res.json(result))
    .catch(next);
};

const listCollaborator = async (req, res, next) => {
  AdminServices.listCollaborator(req.ctx)
    .then((result) => res.json(result))
    .catch(next);
};

const getListUserEventInfo = (req, res, next) => {
  EventService.getListUserEventsManageByCollaborator(req.ctx)
    .then((result) => res.json(result))
    .catch(next);
};

const getActiveEventOfCollaborator = (req, res, next) => {
  EventService.listEventManageByCollaborator(req.ctx)
    .then((evt) => res.json(evt))
    .catch(next);
};

const listCollaboratorInfo = (req, res, next) => {
  EventService.listCollaboratorInfo(req.ctx)
    .then((result) => res.json(result))
    .catch(next);
};

const addEventPin = async (req, res, next) => {
  PinServices.addEventPin(req.ctx, req.body.eventId)
    .then((result) => res.json(result))
    .catch(next);
};

const deleteEventPin = async (req, res, next) => {
  PinServices.deleteEventPin(req.ctx, req.body.eventId)
    .then((result) => res.json(result))
    .catch(next);
};

const listPostManage = async (req, res, next) => {
  AdminServices.listPostManage(req.ctx)
    .then((results) => res.json(results))
    .catch(next);
};

const getPinEvent = async (req, res, next) => {
  PinServices.getPinEvent(req.ctx)
    .then((result) => res.json(result))
    .catch(next);
};

const getTop10UserRanking = async (req, res, next) => {
  RankingService.getTop10User(req.ctx)
    .then((result) => res.json(result))
    .catch(next);
};

const collaboratorInfo = async (req, res, next) => {
  AdminServices.collaboratorInfo(req.ctx, req.body.userId)
    .then((result) => res.json(result))
    .catch(next);
};

const assignEventAdmin = async (req, res, next) => {
  EventService.assignEventAdmin(req.ctx, req.body)
    .then((result) => res.json(result))
    .catch(next);
};

const getListReportOfUser = async (req, res, next) => {
  ReportService.listReportOfUser(req.query.userId, req.query.eventId)
    .then((result) => res.json(result))
    .catch(next);
};

export default {
  createAdmin,
  addCollaborator,
  updateCollaborator,
  // listAllCollaborator,
  systemDetailsInXDays,
  approveEvent,
  getListUserEventInfo,
  listCollaborator,
  getActiveEventOfCollaborator,
  listCollaboratorInfo,
  addEventPin,
  deleteEventPin,
  listPostManage,
  getPinEvent,
  getTop10UserRanking,
  collaboratorInfo,
  assignEventAdmin,
  getListReportOfUser,
};
