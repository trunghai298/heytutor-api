export enum NOTI_TYPE {
  RequestRegister = "request_register",
  AcceptSupporter = "accept_supporter",
  RemoveRegister = "remove_register",
  CancelRegister = "cancel_register",
  ConfirmDone = "confirm_support_done",
  SysClosePost = "system_close_post",

  ReportUser = "report_user",
  ReportPost = "report_post",
  ReportComment = "report_comment",
  ReportTransaction = "report_transaction",

  BanRegister = "ban_register",
  BanPost = "ban_post",
  BanComment = "ban_comment",

  UnBanRegister = "un_ban_register",
  UnBanPost = "un_ban_post",
  UnBanComment = "un_ban_comment",

  UpdateBanRegister = "update_ban_register",
  UpdateBanPost = "update_ban_post",
  UpdateBanComment = "update_ban_comment",

  UpdatePermissionPost = "update_permission_can_post",
  UpdatePermissionComment = "update_permission_can_post",
  UpdatePermissionRegister = "update_permission_can_post",

  UserPinPost = "user_pin_post",
  UserUnPinPost = "user_un_pin_post",
  PinEvent = "admin_pin_event",
  UnPinEvent = "admin_un_pin_event",
  OverNumberPostPined = "over_number_posts_pined",
  SysUnPinPost = "system_un_pin_post",

  NewPost = "create_post",
  NewFeedback = "new_feedback",
  NewMessage = "new_message",
  NewComment = "new_comment",
  NewPermission = "create_permission",

  UpdateComment = "update_comment",
  UpdatePost = "update_post",

  JoinEvent = "join_event",
  UnJoinEvent = "unjoined_event",

  UpdateCollab = "update_collaborator",
  NewCollab = "add_collaborator",

  InexistentPost = "inexistent_post",

  InitPermission = "init_default_permission",
  CheckEventPermission = "daily_event_permission",

  RequestDone = "user_request_close_post",
}
