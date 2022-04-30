import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface IUserPermissionsInstance extends Model {
  id: number;
  userId: number;
  canPost: boolean;
  canRegister: boolean;
  canComment: boolean;
  eventId: number;
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
      allowNull: false,
      type: DataTypes.INTEGER.UNSIGNED,
    },
    canPost: {
      allowNull: false,
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 1,
    },
    canRegister: {
      allowNull: false,
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 1,
    },
    canComment: {
      allowNull: false,
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 1,
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
  }
);

export default UserPermission;
