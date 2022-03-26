import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface RankingInstance extends Model {
  userId: number;
  rankPoint: number;
  creditPoint: number;
  voteCount: number;
  requestPoint: number;
  requestVoteCount: number;
}

const Ranking = MySQLClient.define<RankingInstance>("Ranking", {
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  rankPoint: {
    type: DataTypes.DOUBLE,
  },
  creditPoint: {
    type: DataTypes.DOUBLE,
  },
  voteCount: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  requestPoint: {
    type: DataTypes.DOUBLE,
  },
  requestVoteCount: {
    type: DataTypes.INTEGER.UNSIGNED,
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
