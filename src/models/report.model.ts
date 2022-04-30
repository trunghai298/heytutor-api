import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface ReportInstance extends Model {
  id: number;
  userId: number;
  postId: number;
  reason: string;
  content: string;
  eventId: number;
  commentId: number;
  reportedBy: number;
  isResolved: boolean;
  resolvedBy: number;
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
    allowNull: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  reason: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  content: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  eventId: {
    allowNull: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  commentId: {
    allowNull: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  reportedBy: {
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  isResolved: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  resolvedBy: {
    allowNull: true,
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

export default Report;
