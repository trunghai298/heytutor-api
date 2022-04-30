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
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  title: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  description: {
    allowNull: false,
    type: DataTypes.TEXT,
  },
  startAt: {
    allowNull: false,
    type: DataTypes.DATE,
  },
  endAt: {
    allowNull: false,
    type: DataTypes.DATE,
  },
  hashtag: {
    allowNull: true,
    type: DataTypes.TEXT,
  },
  content: {
    allowNull: false,
    type: DataTypes.TEXT,
  },
  image: {
    allowNull: false,
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
    defaultValue: null,
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

export default Event;
