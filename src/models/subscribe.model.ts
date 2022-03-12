import { Model, DataTypes } from "sequelize";
import MySQLClient from "../clients/mysql";

interface SubscribeInstance extends Model {
    id: number;
    requesterId: number;
    subscriberId: string;
    requestId: number;
}

const Subscribe = MySQLClient.define<SubscribeInstance>("Subscribe", {
    id: {
        allowNull: false,
        autoIncrement:true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
    },
    requesterId: {
        type: DataTypes.INTEGER.UNSIGNED,
    },
    subscriberId: {
        type: DataTypes.STRING,
    },
    requestId: {
        type: DataTypes.INTEGER.UNSIGNED
    },
});

export default Subscribe;