import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface RecentInteractionInstance extends Model {
  id: number;
  userId: number;
  postId: number;
  action: string;
}

const RecentInteraction = MySQLClient.define<RecentInteractionInstance>(
  "RecentInteraction",
  {
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
    action: {
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
  }
);

export default RecentInteraction;
