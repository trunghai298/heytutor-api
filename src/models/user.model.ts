import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";
interface UserInstance extends Model {
  id: number;
  name: string;
  email: string;
  password: string;
  stdId: string;
  isBanned: boolean;
  googleId: string;
  summary: string;
  firstTimeLogin: boolean;
}

const User = MySQLClient.define<UserInstance>("User", {
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
  stdId: {
    type: DataTypes.STRING,
  },
  isBanned: {
    type: DataTypes.BOOLEAN,
  },
  googleId: {
    type: DataTypes.STRING,
  },
  summary: {
    type: DataTypes.STRING,
  },
  firstTimeLogin: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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

export default User;
