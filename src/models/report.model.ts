import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface ReportInstance extends Model {
  id: number;
  userId: number;
  postId: number;
  reason: string;
  content: string;
  createdAt: Date;
  eventId: number;
  commentId: number;
}

const Report = MySQLClient.define<ReportInstance>("Report", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  postId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  reason: {
    type: DataTypes.STRING,
  },
  content: {
    type: DataTypes.STRING,
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
  eventId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  commentId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
});

export default Report;
