import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface TimeTableInstance extends Model {
  id: number;
  classId: number;
  subjects: string;
}

const TimeTable = MySQLClient.define<TimeTableInstance>("TimeTable", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  classId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  subjects: {
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

export default TimeTable;
