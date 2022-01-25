import { Sequelize } from "sequelize";

const MySQLClient = new Sequelize(
  process.env.DB_NAME || "hey_tutors",
  process.env.DB_USER || "",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "",
    port: parseInt(process.env.DB_PORT || "", 10) || 3306,
    dialect: "mysql",
    pool: {
      max: 110,
      min: 0,
      acquire: 1000000,
      idle: 200000,
    },
    dialectOptions: { decimalNumbers: true, multipleStatements: true },
    logging: false, //console.log,
    timezone: "+07:00",
  }
);

export default MySQLClient;
