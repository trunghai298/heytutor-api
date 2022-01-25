import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface StudentInstance extends Model {
  id: number;
  stdCode: string;
  rollNumber: string;
  fullName: number;
  classId: number;
  major: string;
}

const Student = MySQLClient.define<StudentInstance>("Student", {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  stdCode: {
    type: DataTypes.STRING,
  },
  rollNumber: {
    type: DataTypes.STRING,
  },
  fullName: {
    type: DataTypes.STRING,
  },
  classId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  major: {
    type: DataTypes.STRING,
  },
});

export default Student;
