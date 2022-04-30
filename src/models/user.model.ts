import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";
interface UserInstance extends Model {
  id: number;
  name: string;
  email: string;
  password: string;
  stdId: string;
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
  stdId: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  googleId: {
    allowNull: true,
    type: DataTypes.STRING,
  },
  summary: {
    allowNull: true,
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
