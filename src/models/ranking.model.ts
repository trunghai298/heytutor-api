import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface RankingInstance extends Model {
  userId: number;
  rankPoint: number;
  voteCount: number;
}

const Ranking = MySQLClient.define<RankingInstance>("Ranking", {
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  rankPoint: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  voteCount: {
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
