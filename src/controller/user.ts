import UserServices from "../services/users";

const fetchByEmail = (req, res, next) => {
  UserServices.fetchByEmail(req.params.email)
    .then((user) => res.json(user))
    .catch(next);
};

const getUserProfileById = (req, res, next) => {
  UserServices.getUserProfileById(req.params.userId)
    .then((user) => res.json(user))
    .catch(next);
};

export default {
  getUserProfileById,
  fetchByEmail,
};
