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
}

const User = MySQLClient.define<UserInstance>("User", {
  id: {
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
});

export default User;
