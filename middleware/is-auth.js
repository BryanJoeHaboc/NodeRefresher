const jwt = require("jsonwebtoken");

const passToErrorMiddleware = (err, next) => {
  console.log("err", err);
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
};

async function checkIfAuthenticated(req, res, next) {
  try {
    const authHeader = req.get("Authorization");
    console.log(req.body);
    if (!authHeader) {
      const error = new Error("Not authenticated");
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;

    decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken) {
      const error = new Error("Not authenticated.");
      error.statusCode = 401;
      throw error;
    }

    req.userId = decodedToken.userId;
  } catch (err) {
    passToErrorMiddleware(err, next);
  }

  next();
}

module.exports = {
  checkIfAuthenticated,
};
