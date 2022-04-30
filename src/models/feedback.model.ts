import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface IFeedbackInstance extends Model {
  id: number;
  userId: number;
  postId: number;
  type: number;
  score: number;
  reason: string;
  content: string;
  fromUserId: number;
}

const Feedback = MySQLClient.define<IFeedbackInstance>("Feedback", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  userId: {
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  postId: {
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  type: {
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  score: {
    allowNull: false,
    type: DataTypes.DOUBLE,
  },
    allowNull: false,
  reason: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  content: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  fromUserId: {
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: MySQLClient.literal("CURRENT_TIMESTAMP"),
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: MySQLClient.literal("CURRENT_TIMESTAMP"),
  },
});

export default Feedback;
