export enum NOTI_TYPE {
  RequestRegister = "request_register",
  AcceptSupporter = "accept_supporter",
  RemoveRegister = "remove_register",
  CancelRegister = "cancel_register",
  ConfirmDone = "confirm_support_done",

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

  UserPinPost = "user_pin_post",
  UserUnPinPost = "user_un_pin_post",
  OverNumberPostPined = "over_number_posts_pined",
  SysUnPinPost = "system_un_pin_post",

  NewFeedback = "new_feedback",
  NewMessage = "new_message",

  JoinEvent = "join_event",
  UnJoinEvent = "unjoined_event",
  UpdateCollab = "update_collaborator",
  NewCollab = "add_collaborator",

  InexistentPost = "inexistent_post",
}
