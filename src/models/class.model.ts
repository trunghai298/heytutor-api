import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface ClassInstance extends Model {
  id: number;
  classId: number;
  deptId: number;
  courseId: number;
  className: string;
}

const Class = MySQLClient.define<ClassInstance>("Class", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  classId: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  deptId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  courseId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  className: {
    type: DataTypes.STRING,
  },
});

export default Class;
