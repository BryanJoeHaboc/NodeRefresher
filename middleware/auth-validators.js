const { body } = require("express-validator/check");
const User = require("../models/user.model");

const postSignUpValidator = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .custom((value, { req }) => {
      return User.findOne({ where: { email: value } }).then((user) => {
        if (user) {
          return Promise.reject("User already exists");
        }
      });
    })
    .normalizeEmail(),
  body("firstName")
    .not()
    .isEmpty()
    .withMessage("Please enter a valid First Name")
    .trim(),
  body("lastName")
    .not()
    .isEmpty()
    .withMessage("Please enter a valid Last Name")
    .trim(),
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

const postLoginValidator = [
  body("email", "Invalid Email or password")
    .isEmail()
    .withMessage("Please enter a valid email")
    .custom((value, { req }) => {
      return User.findOne({ where: { email: value } }).then((user) => {
        return !user ? false : true;
      });
    })
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Please enter your password"),
];

const postAddProductValidator = [
  body("title")
    .isString()
    .withMessage("Title must be alphanumeric characters only.")
    .isLength({ min: 3 })
    .withMessage("Title must be atleast three characters long.")
    .trim(),
  body("imageUrl").isURL().withMessage("Enter a valid image URL"),
  body("price").isFloat().withMessage("Please input a valid price value"),
  body("description")
    .isString()
    .withMessage("Description must be alphanumeric characters only.")
    .isLength({ min: 8, max: 400 })
    .withMessage("Description must be atleast eight characters long.")
    .trim(),
];

const postEditProductValidator = [
  body("title")
    .isString()
    .withMessage("Title must be alphanumeric characters only.")
    .isLength({ min: 3 })
    .withMessage("Title must be atleast three characters long.")
    .trim(),
  body("imageUrl").isURL().withMessage("Enter a valid image URL"),
  body("price").isFloat().withMessage("Please input a valid price value"),
  body("description")
    .isString()
    .withMessage("Description must be alphanumeric characters only.")
    .isLength({ min: 8, max: 400 })
    .withMessage("Description must be atleast eight characters long.")
    .trim(),
];

module.exports = {
  postSignUpValidator,
  postLoginValidator,
  postAddProductValidator,
  postEditProductValidator,
};
