const User = require("../models/user.model");

const passToErrorMiddleware = (err, next) => {
  console.log("err", err);
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
};

const isAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await User.findOne({ where: { _id: userId } });

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (user.userType !== "admin") {
      const error = new Error("User not authorized");
      error.statusCode = 401;
      throw error;
    }

    next();
  } catch (error) {
    // NOTE: dito pasa pass to middleware
    passToErrorMiddleware(error, next);
  }
};

module.exports = {
  isAdmin,
};
