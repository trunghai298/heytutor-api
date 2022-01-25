import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface CommentInstance extends Model {
  id: number;
  postId: number;
  userId: number;
  isLiked: boolean;
  content: string;
  likeCount: number;
}

const Comment = MySQLClient.define<CommentInstance>("Comment", {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  senderId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  receiverId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  conversationId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  content: {
    type: DataTypes.STRING,
  },
  seenAt: {
    type: DataTypes.DATE,
  },
});

export default Comment;
