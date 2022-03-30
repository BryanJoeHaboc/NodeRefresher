const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const sequelize = require("../util/database");

const store = new SequelizeStore({ db: sequelize });

const configSession = (app) => {
  app.use(
    session({
      secret: "hatdogidigididog",
      store: store,
      resave: false,
      proxy: true,
      saveUninitialized: false,
    })
  );
};

store
  // .sync({ force: true });
  .sync();

module.exports = configSession;
