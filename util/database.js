require("dotenv").config();
const Sequelize = require("sequelize");
const { accessSecretVersion } = require("../secretManager");

let dbPw = "";
let dbHost = "";

const mysqlConfig = {
  database: "e-commerce",
  username: "root",
  password: "",
  dialect: "mysql",
};

async function getSecretFromGoogle() {
  if (process.env.NODE_ENV === "production") {
    console.log("pumasok sa production");
    // mysqlConfig.password = await accessSecretVersion(
    //   "projects/65293551526/secrets/ECOMMERCE_DB_PW_ENV/versions/latest"
    // );
    // const instanceConnectionName = await accessSecretVersion(
    //   "projects/65293551526/secrets/ECOMMERCE_INSTANCE_CONNECTION_NAME/versions/latest"
    // );
    mysqlConfig.password = process.env.DB_PW_PROD;
    mysqlConfig.dialectOptions = {
      socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
    };
    console.log(mysqlConfig);
  } else {
    console.log("pumasok sa deployment");
    mysqlConfig.password = process.env.DB_PW_DEV;
    mysqlConfig.host = process.env.DB_HOST_DEV;
  }
}
getSecretFromGoogle();

const sequelize = new Sequelize(mysqlConfig);
console.log(sequelize);
sequelize
  .authenticate()
  .then((res) => console.log("Connection has been established successfully."))
  .catch((err) => console.error("Unable to connect to the database:", err));

module.exports = sequelize;
