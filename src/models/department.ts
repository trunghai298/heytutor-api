import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface DepartmentInstance extends Model {
  id: number;
  deptId: number;
  termId: number;
  deptName: string;
}

const Department = MySQLClient.define<DepartmentInstance>("Department", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  deptId: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  termId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  deptName: {
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

export default Department;
