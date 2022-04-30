import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface IBanInstance extends Model {
  id: number;
  userId: number;
  type: string;
  banDate: string;
  unbanDate: string;
  banBy: number;
  updateBy: number;
  eventId: number;
}

const Ban = MySQLClient.define<IBanInstance>("Ban", {
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
  type: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  banDate: {
    allowNull: false,
    type: DataTypes.DATE,
  },
  unbanDate: {
    allowNull: false,
    type: DataTypes.DATE,
  },
  banBy: {
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  updateBy: {
    allowNull: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  eventId: {
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

export default Ban;
