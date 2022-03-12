import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface CourseInstance extends Model {
  id: number;
  courseId: number;
  deptId: number;
  courseName: string;
  courseCode: string;
}

const Course = MySQLClient.define<CourseInstance>("Course", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  courseId: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  deptId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  courseName: {
    type: DataTypes.STRING,
  },
  courseCode: {
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

export default Course;
