import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface StudentInstance extends Model {
  id: number;
  stdId: string;
  stdCode: string;
  fullName: number;
  classId: number;
  major: string;
  imageUrl: string;
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
  major: {
    type: DataTypes.STRING,
  },
  imageUrl: {
    type: DataTypes.STRING,
  },
});

export default Student;
