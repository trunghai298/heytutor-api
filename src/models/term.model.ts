import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface TermInstance extends Model {
  id: number;
  termId: number;
  termName: string;
  startDate: Date;
  endDate: Date;
}

const Term = MySQLClient.define<TermInstance>("Term", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  termId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  termName: {
    type: DataTypes.STRING,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
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

export default Term;
