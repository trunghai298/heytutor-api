import UserServices from "../services/users";

const fetchByEmail = (req, res, next) => {
  UserServices.fetchByEmail(req.params.email)
    .then((user) => res.json(user))
    .catch(next);
};

export default {
  fetchByEmail,
};
