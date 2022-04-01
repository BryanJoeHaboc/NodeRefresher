const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const User = require("../models/user.model");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

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
          })
            .then((user) => {
              user.createCart().then((result) => {
                res.redirect("/login");
                transporter.sendMail({
                  from: "bryanjoehaboc241@gmail.com",
                  to: email,
                  subject: "Signup succeeded",
                  html: "<h1> You successfully signed up! </h1>",
                });
              });
            })
            .catch((err) => console.log(err));
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

const getPasswordReset = (req, res) => {
  const errorMessage = getErrorMessage(req);
  res.render("auth/password-reset", {
    pageTitle: "Reset Password",
    path: "/reset",
    isLoggedIn: false,
    errorMessage,
  });
};

module.exports = {
  getLogin,
  getSignUp,
  getPasswordReset,
  postLogin,
  postLogout,
  postSignUp,
};
