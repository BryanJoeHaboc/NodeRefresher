const jwt = require("jsonwebtoken");
const { accessSecretVersion } = require("../secretManager");

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

    let jwtSecret = "";
    if (process.env.NODE_ENV === "production") {
      jwtSecret = await accessSecretVersion(
        "projects/65293551526/secrets/ECOMMERCE_JWT_SECRET/versions/latest"
      );
    } else {
      jwtSecret = process.env.JWT_SECRET;
    }
    decodedToken = jwt.verify(token, jwtSecret);

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
