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
    allowNull: false,
    type: DataTypes.STRING,
  },
  password: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  address: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  phone: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  facebook: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  role: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  permissions: {
    allowNull: true,
    type: DataTypes.STRING,
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
