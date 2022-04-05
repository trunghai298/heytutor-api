import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface ReportInstance extends Model {
  id: number;
  userId: number;
  postId: number;
  reason: string;
  content: string;
  createdAt: Date;
}

const Report = MySQLClient.define<ReportInstance>("Report", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  postId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  reason: {
    type: DataTypes.STRING,
  },
  content: {
    type: DataTypes.STRING,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: MySQLClient.literal("CURRENT_TIMESTAMP"),
  },
});

export default Report;
