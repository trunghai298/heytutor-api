import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";
import Event from "./event.model";
import User from "./user.model";
interface UserEventInstance extends Model {
  id: number;
  userId: number;
  eventId: number;
  isSupporter: boolean;
  isRequestor: boolean;
  adminId: any;

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
  adminId: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: null,
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

User.hasMany(UserEvent, { foreignKey: "id" });
UserEvent.belongsTo(User, { foreignKey: "userId" });

export default UserEvent;
