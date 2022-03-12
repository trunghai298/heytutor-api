import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface RateInstance extends Model {
  rateId: number;
  postId: number;
  userRateId: number;
  receiverRatedId: number;
  content: string;
}

const Rate = MySQLClient.define<RateInstance>("Rate", {
  rateId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  postId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  userRateId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  receiverRatedId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  content: {
    type: DataTypes.STRING,
  },
});

export default Rate;
