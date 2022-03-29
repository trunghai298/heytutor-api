import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface EventInstance extends Model {
  id: number;
  title: string;
  description: string;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  endAt: Date;
  hashtag: string;
}

const Event = MySQLClient.define<EventInstance>("Event", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  viewCount: {
    type: DataTypes.INTEGER.UNSIGNED,
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
    defaultValue: MySQLClient.literal("CURRENT_TIMESTAMP"),
  },
  hashtag: {
    type: DataTypes.TEXT,
  },
});

export default Event;
