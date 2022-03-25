const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "e-commerce",
  password: "t1t@y123",
});

module.exports = pool.promise();
