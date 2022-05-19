require("dotenv").config();
const Sequelize = require("sequelize");

let dbPw = process.env.DB_PW_DEV;
let dbHost = process.env.DB_HOST_DEV;

if (process.env.NODE_ENV === "production") {
  dbPw = process.env.DB_PW_ENV;
}

const sequelize = new Sequelize("e-commerce", "root", dbPw, {
  dialect: "mysql",
  host: dbHost,
});

module.exports = sequelize;
