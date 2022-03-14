import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";
import Event from "./event.model";
interface UserEventInstance extends Model {
  id: number;
  userId: number;
  eventId: number;
  isSupporter: boolean;
  isRequestor: boolean;
}

const UserEvent = MySQLClient.define<UserEventInstance>("UserEvent", {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  eventId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  isSupporter: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  isRequestor: {
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

Event.hasMany(UserEvent, { foreignKey: "id" });
UserEvent.belongsTo(Event, { foreignKey: "eventId" });

export default UserEvent;
