require("dotenv").config();
const Sequelize = require("sequelize");
const { accessSecretVersion } = require("../secretManager");

let dbPw = "";
let dbHost = "";

const mysqlConfig = {
  dialect: "mysql",
  host: dbHost,
};

function getSecretFromGoogle() {
  if (process.env.NODE_ENV === "production") {
    console.log("pumasok sa production");
    dbPw = accessSecretVersion(
      "projects/65293551526/secrets/ECOMMERCE_DB_PW_ENV/versions/latest"
    );
    const instanceConnectionName = accessSecretVersion(
      "projects/65293551526/secrets/ECOMMERCE_INSTANCE_CONNECTION_NAME/versions/latest"
    );
    mysqlConfig.host = "localhost";
    mysqlConfig.dialectOptions = {
      socketPath: `/cloudsql/${instanceConnectionName}`,
    };
  } else {
    console.log("pumasok sa deployment");
    dbPw = process.env.DB_PW_DEV;
    mysqlConfig.host = process.env.DB_HOST_DEV;
  }
}
getSecretFromGoogle();

const sequelize = new Sequelize("e-commerce", "root", dbPw, mysqlConfig);

module.exports = sequelize;
