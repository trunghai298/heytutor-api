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
}

const UserEvent = MySQLClient.define<UserEventInstance>("UserEvent", {
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
  eventId: {
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  isSupporter: {
    allowNull: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  isRequestor: {
    allowNull: true,
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

User.hasMany(UserEvent, { foreignKey: "id" });
UserEvent.belongsTo(User, { foreignKey: "userId" });

export default UserEvent;
