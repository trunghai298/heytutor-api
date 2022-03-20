import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface IActivityInstance extends Model {
  id: number;
  userId: number;
  username: string;
  action: string;
  content: string;
}

const Activity = MySQLClient.define<IActivityInstance>("Activity", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  username: {
    type: DataTypes.STRING,
  },
  action: {
    type: DataTypes.STRING,
  },
  content: {
    type: DataTypes.TEXT,
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

export default Activity;
