const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

const getErrorMessage = (req) => {
  const messages = req.flash("error");
  let errorMessage = undefined;

  if (messages.length > 0) {
    errorMessage = messages[0];
  }

  return errorMessage;
};

const getLogin = (req, res) => {
  const errorMessage = getErrorMessage(req);

  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isLoggedIn: false,
    errorMessage,
  });
};

const postLogin = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ raw: true, nest: true, where: { email } })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/login");
      }

      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return res.redirect("/");
          }
          res.redirect("/login");
        })
        .catch((err) => {
          console.log("error in dehashing", err);
          res.redirect("/login");
        });
    })
    .catch((err) => console.log("errorrrrrr", err));
};

const postLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

const postSignUp = (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  User.findOne({ where: { email: email } })
    .then((user) => {
      if (!user) {
        return bcrypt.hash(password, 12).then((hashPassword) => {
          return User.create({
            firstName,
            lastName,
            email,
            password: hashPassword,
          }).then((user) => {
            user.createCart().then((result) => {
              res.redirect("/login");
            });
          });
        });
      } else {
        req.flash("error", "User already exists");
        return res.redirect("/signup");
      }
    })

    .catch((err) => console.log("error", err));
};

const getSignUp = (req, res) => {
  const errorMessage = getErrorMessage(req);
  res.render("auth/signup", {
    pageTitle: "Login",
    path: "/signup",
    isLoggedIn: false,
    errorMessage,
  });
};

module.exports = {
  getLogin,
  postLogin,
  postLogout,
  getSignUp,
  postSignUp,
};
