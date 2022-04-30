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
    allowNull: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  eventId: {
    allowNull: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  pinBy: {
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  userPin: {
    allowNull: false,
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
