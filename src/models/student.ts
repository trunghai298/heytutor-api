import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface StudentInstance extends Model {
  id: number;
  stdId: string;
  stdCode: string;
  fullName: number;
  classId: string;
  className: string;
  major: string;
  semester: string;
  subject: string;
}

const Student = MySQLClient.define<StudentInstance>("Student", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  stdId: {
    primaryKey: true,
    type: DataTypes.STRING,
  },
  stdCode: {
    type: DataTypes.STRING,
  },
  fullName: {
    type: DataTypes.STRING,
  },
  classId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  className: {
    type: DataTypes.STRING,
  },
  major: {
    type: DataTypes.STRING,
  },
  semester: {
    type: DataTypes.STRING,
  },
  subject: {
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

export default Student;
