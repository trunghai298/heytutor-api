import User from "./user";
import Term from "./term";
import Message from "./message";
import Conversation from "./conversation";
import Class from "./class";
import Course from "./course";
import Department from "./department";
import Event from "./event";
import Student from "./student";
import Post from "./post";
import Comment from "./comment";
import Auth from "./auth";

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
};
