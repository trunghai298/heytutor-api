import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface CourseInstance extends Model {
  id: number;
  deptId: number;
  courseName: string;
}

const Course = MySQLClient.define<CourseInstance>("Course", {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  deptId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  courseName: {
    type: DataTypes.STRING,
  },
});

export default Course;
