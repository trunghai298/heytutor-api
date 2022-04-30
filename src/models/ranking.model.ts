import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface RankingInstance extends Model {
  id: number;
  userId: number;
  rankPoint: number;
  creditPoint: number;
  voteCount: number;
  requestPoint: number;
  requestVoteCount: number;
}

const Ranking = MySQLClient.define<RankingInstance>("Ranking", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  userId: {
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  rankPoint: {
    allowNull: false,
    type: DataTypes.DOUBLE,
    defaultValue: 0,
  },
  creditPoint: {
    allowNull: false,
    type: DataTypes.DOUBLE,
    defaultValue: 0,
  },
  voteCount: {
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  requestPoint: {
    allowNull: false,
    type: DataTypes.DOUBLE,
    defaultValue: 0,
  },
  requestVoteCount: {
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
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

export default Ranking;
