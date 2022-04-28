import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface EventInstance extends Model {
  id: number;
  createId: number;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  startAt: Date;
  endAt: Date;
  hashtag: string;
  content: string;
  isApproved: boolean;
  approveBy: number;
  adminId: any;
  image: string;
}

const Event = MySQLClient.define<EventInstance>("Event", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  createId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: MySQLClient.literal("CURRENT_TIMESTAMP"),
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: MySQLClient.literal("CURRENT_TIMESTAMP"),
  },
  endAt: {
    type: DataTypes.DATE,
  },
  startAt: {
    type: DataTypes.DATE,
  },
  hashtag: {
    type: DataTypes.TEXT,
  },
  content: {
    type: DataTypes.TEXT,
  },
  image: {
    type: DataTypes.TEXT,
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  approveBy: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  adminId: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: null,
  },
});

export default Event;
