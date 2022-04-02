const { check, body } = require("express-validator/check");

const postSignUpValidator = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("firstName")
    .not()
    .isEmpty()
    .withMessage("Please enter a valid First Name"),
  body("lastName")
    .not()
    .isEmpty()
    .withMessage("Please enter a valid Last Name"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be atleast six characters long"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords have to match!");
    }
    return true;
  }),
  // .isStrongPassword()
  // .withMessage("Please provide a strong password"),
];

module.exports = {
  postSignUpValidator,
};
