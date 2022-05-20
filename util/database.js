require("dotenv").config();
const Sequelize = require("sequelize");
const { accessSecretVersion } = require("../secretManager");

let dbPw = "";
let dbHost = "";

function getSecretFromGoogle() {
  if (process.env.NODE_ENV === "production") {
    dbPw = accessSecretVersion(
      "projects/65293551526/secrets/ECOMMERCE_DB_PW_ENV/versions/latest"
    );
    dbHost = accessSecretVersion(
      "projects/65293551526/secrets/ECOMMERCE_DB_HOST_ENV/versions/latest"
    );
  } else {
    dbPw = process.env.DB_PW_DEV;
    dbHost = process.env.DB_HOST_DEV;
  }
}
getSecretFromGoogle();

const sequelize = new Sequelize("e-commerce", "root", dbPw, {
  dialect: "mysql",
  host: dbHost,
});

module.exports = sequelize;
