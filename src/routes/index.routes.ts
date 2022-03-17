import User from "./user.routes";
import Term from "./term.routes";
import Message from "./message.routes";
import Conversation from "./conversation.routes";
import Class from "./class.routes";
import Course from "./course.routes";
import Department from "./department.routes";
import Event from "./event.routes";
import Student from "./student.routes";
import Post from "./post.routes";
import Comment from "./comment.routes";
import Auth from "./auth.routes";
import File from "./file.routes";
import UserEvent from "./user-event.routes";
import UserPost from "./user-post.routes";
import Ranking from "./ranking.routes";

export default (app: any) => {
  Auth(app);
  User(app);
  Term(app);
  Message(app);
  Conversation(app);
  Class(app);
  Course(app);
  Department(app);
  Event(app);
  Student(app);
  Post(app);
  Comment(app);
  File(app);
  UserEvent(app);
  UserPost(app);
  Ranking(app);
};
