import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface IAdminInstance extends Model {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  permissions: string;
}

const Admin = MySQLClient.define<IAdminInstance>("Admin", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  email: {
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
  },
  name: {
    type: DataTypes.STRING,
  },
  role: {
    type: DataTypes.STRING,
  },
  permissions: {
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

export default Admin;
