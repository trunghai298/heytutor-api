import UserPermissionService from "../services/user-permission.service"


const initPermission = (req, res, next) => {
    UserPermissionService.initPermission()
    .then((result) => res.json(result))
    .catch(next);
}

export default {
    initPermission,
}