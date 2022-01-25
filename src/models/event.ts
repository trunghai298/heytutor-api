import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface EventInstance extends Model {
  id: number;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  endAt: Date;
}

const Event = MySQLClient.define<EventInstance>("Event", {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  title: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.STRING,
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
  endAt: {
    type: DataTypes.DATE,
  },
});

export default Event;
