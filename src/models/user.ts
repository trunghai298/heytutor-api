import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface UserInstance extends Model {
  id: number;
  name: string;
  email: string;
  stdId: string;
  postCount: number;
  rateCount: number;
  isBanned: boolean;
  googleId: string;
}

const User = MySQLClient.define<UserInstance>("User", {
  id: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  email: {
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
});

export default User;
