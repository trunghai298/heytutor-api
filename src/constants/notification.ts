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

  NewFeedback = "new_feedback",
  NewMessage = "new_message",

  JoinEvent = "join_event",
  UnJoinEvent = "unjoined_event",
  UpdateCollab = "update_collaborator",
  NewCollab = "add_collaborator",
}
