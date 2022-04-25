import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface IAdminInstance extends Model {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  permissions: string;
  isActive: boolean;
  addBy: number;
  updatedBy: number;
  address: string;
  phone: string;
  facebook: string;
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
  address: {
    type: DataTypes.STRING,
  },
  phone: {
    type: DataTypes.STRING,
  },
  facebook: {
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
  isActive: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  updatedBy: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  addBy: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
});

export default Admin;
