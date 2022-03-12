import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface EventRegisterInstance extends Model {
  eventId: number;
  studentId: number;
  rollStudent: number;
}

const EventRegister = MySQLClient.define<EventRegisterInstance>(
  "EventRegister",
  {
    eventId: {
      type: DataTypes.INTEGER.UNSIGNED,
    },
    studentId: {
      type: DataTypes.INTEGER.UNSIGNED,
    },
    rollStudent: {
      type: DataTypes.INTEGER.UNSIGNED,
    },
  }
);

export default EventRegister;
