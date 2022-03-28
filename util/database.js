const Sequelize = require("sequelize");

const sequelize = new Sequelize("e-commerce", "root", "t1t@y123", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
