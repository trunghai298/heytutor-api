import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface ConversationInstance extends Model {
  id: number;
  messageId: number;
  userId1: number;
  userId2: number;
}

const Conversation = MySQLClient.define<ConversationInstance>("Conversation", {
  id: {
    primaryKey: true,
    type: DataTypes.INTEGER.UNSIGNED,
  },
  messageId: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  userId1: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  userId2: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
});

export default Conversation;
