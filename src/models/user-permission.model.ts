import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface IUserPermissionsInstance extends Model {
  id: number;
  userId: number;
  canPost: boolean;
  canRegister: boolean;
  canComment: boolean;
}

const UserPermission = MySQLClient.define<IUserPermissionsInstance>(
  "UserPermissions",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
    },
    canPost: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 1,
    },
    canRegister: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 1,
    },
    canComment: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 1,
    },
  }
);

export default UserPermission;
