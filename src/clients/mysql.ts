import { Sequelize } from "sequelize";

const MySQLClient = new Sequelize("heytutor-test", "admin", "kbdZZeiS", {
  host: "10518",
  port: 10518,
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
});

export default MySQLClient;
