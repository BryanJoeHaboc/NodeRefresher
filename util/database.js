require("dotenv").config();
const Sequelize = require("sequelize");

const mysqlConfig = {
  database: "e-commerce",
  username: "root",
  password: "",
  dialect: "mysql",
};

async function getSecretFromGoogle() {
  if (process.env.NODE_ENV === "production") {
    console.log("pumasok sa production");
    mysqlConfig.password = process.env.DB_PW_PROD;
    mysqlConfig.dialectOptions = {
      socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
    };
  } else {
    console.log("pumasok sa deployment");
    mysqlConfig.password = process.env.DB_PW_DEV;
    mysqlConfig.host = process.env.DB_HOST_DEV;
  }
}
getSecretFromGoogle();

const sequelize = new Sequelize(mysqlConfig);

sequelize
  .authenticate()
  .then((res) => console.log("Connection has been established successfully."))
  .catch((err) => console.error("Unable to connect to the database:", err));

module.exports = sequelize;
