import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface UserInstance extends Model {
  id: number;
  name: string;
  email: string;
  password: string;
  stdId: string;
  postCount: number;
  rateCount: number;
  isBanned: boolean;
  googleId: string;
  isAdmin: boolean;
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
  postCount: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  rateCount: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  isBanned: {
    type: DataTypes.BOOLEAN,
  },
  googleId: {
    type: DataTypes.STRING,
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
  },
});

export default User;
