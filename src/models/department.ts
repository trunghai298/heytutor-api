import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface DepartmentInstance extends Model {
  id: number;
  termId: number;
  deptName: string;
}

const Department = MySQLClient.define<DepartmentInstance>("Department", {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  termId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  deptName: {
    type: DataTypes.STRING,
  },
});

export default Department;
