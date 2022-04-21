import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface IPinInstance extends Model {
  id: number;
  postId: number;
  eventId: number;
  pinBy: number;
  userPin: string;
}

const Pin = MySQLClient.define<IPinInstance>("Pin", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  postId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  eventId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  pinBy: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  userPin: {
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
});

export default Pin;
