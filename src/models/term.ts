import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface TermInstance extends Model {
  id: number;
  termName: string;
}

const Term = MySQLClient.define<TermInstance>("Term", {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  termName: {
    type: DataTypes.STRING,
  },
});

export default Term;
