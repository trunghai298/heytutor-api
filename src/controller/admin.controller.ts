import EventService from "../services/event.service";
import PinServices from "../services/pin.services";
import AdminServices from "../services/admin.service";

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

const listAllCollaborator = (req, res, next) => {
  AdminServices.listAllCollaborator()
    .then((result) => res.json(result))
    .catch(next);
};

const systemDetailsInXDays = (req, res, next) => {
  AdminServices.systemDetailsInXDays(req.query.nbOfDays)
    .then((result) => res.json(result))
    .catch(next);
};

const approveEvent = async (req, res, next) => {
  EventService.approveEvent(req.ctx, req.body.eventId)
    .then((result) => res.json(result))
    .catch(next);
};

const listCollaborator = async (req, res, next) => {
  AdminServices.listCollaborator()
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

const collaboratorInfo = (req, res, next) => {
  EventService.collaboratorInfo()
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
  AdminServices.listPostManage()
    .then((results) => res.json(results))
    .catch(next);
};

const getPinEvent = async (req, res, next) => {
  PinServices.getPinEvent()
    .then((result) => res.json(result))
    .catch(next);
};

export default {
  createAdmin,
  addCollaborator,
  updateCollaborator,
  listAllCollaborator,
  systemDetailsInXDays,
  approveEvent,
  getListUserEventInfo,
  listCollaborator,
  getActiveEventOfCollaborator,
  collaboratorInfo,
  addEventPin,
  deleteEventPin,
  listPostManage,
  getPinEvent,
};
