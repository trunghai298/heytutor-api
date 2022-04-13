import EventServices from "../services/event.service";
import AdminServices from "../services/admin.service";

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
}

const systemDetailsInXDays = (req, res, next) => {
  AdminServices.systemDetailsInXDays(req.query.nbOfDays)
  .then((result) => res.json(result))
  .catch(next);
}

const getListUserEventInfo = (req, res, next) => {
  EventServices.getListUserEventsManageByCollaborator(req.ctx)
  .then((result) => res.json(result))
  .catch(next); 
}

export default {
  addCollaborator,
  updateCollaborator,
  listAllCollaborator,
  systemDetailsInXDays,
  getListUserEventInfo,
};
