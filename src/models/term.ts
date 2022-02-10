import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface TermInstance extends Model {
  id: number;
  termId: number;
  termName: string;
}

const Term = MySQLClient.define<TermInstance>("Term", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  termId: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  termName: {
    type: DataTypes.STRING,
  },
});

export default Term;
