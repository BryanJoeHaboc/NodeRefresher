require("dotenv").config();

const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const { Op } = require("sequelize");

const User = require("../models/user.model");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
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
                //NOTE: HINDI PA GUMAGANA TO KASI UNDER REVIEW PA SENDGRID KO 4-1-2022
                transporter.sendMail({
                  from: process.env.SENDGRID_EMAIL,
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

const getResetPassword = (req, res) => {
  const errorMessage = getErrorMessage(req);
  res.render("auth/password-reset", {
    pageTitle: "Reset Password",
    path: "/reset",
    isLoggedIn: false,
    errorMessage,
  });
};

const postResetPassword = (req, res) => {
  const errorMessage = getErrorMessage(req);
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ where: { email: req.body.email } })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found");
          return res.rediect("reset");
        }

        return User.update(
          {
            resetToken: token,
            resetTokenExpirationDate: Date.now() + 3600000,
          },
          { where: { _id: user._id } }
        );
      })
      .then((result) => {
        console.log(result);
        res.redirect("/");
        //NOTE: HINDI PA GUMAGANA TO KASI UNDER REVIEW PA SENDGRID KO 4-1-2022
        transporter.sendMail({
          from: "someemail@example.com",
          to: req.body.email,
          subject: "Password Reset",
          html: `<p>You requested a password reset</p>
          <p>Click this <a href="http://localhost:3000/reset/${token} ">link</a> to set a new password</p>
          <p>This reset email is only valid for one hour</p>`,
        });
      })
      .catch((err) => console.log(err));
  });
};

//NOTE: HINDI PA GUMAGANA TO KASI UNDER REVIEW PA SENDGRID KO 4-1-2022
const getNewPassword = (req, res, next) => {
  const resetToken = req.params.token;
  User.findOne({
    where: {
      [Op.and]: [
        {
          resetToken,
        },
        {
          resetTokenExpirationDate: {
            [Op.gte]: Date.now(),
          },
        },
      ],
    },
  }).then((user) => {
    const errorMessage = getErrorMessage(req);

    res.render("auth/new-password", {
      path: "/new-password",
      pageTitle: "New Password",
      errorMessage,
      isLoggedIn: false,
      userId: user._id.toString(),
      passwordToken: resetToken,
    });
  });
};

const postNewPassword = (req, res, next) => {
  const { newPassword, userId, passwordToken } = req.body;
  let currentUser;
  bcrypt
    .hash(newPassword, 12)
    .then((hashedPassword) => {
      return User.update(
        {
          resetToken: undefined,
          resetTokenExpirationDate: undefined,
          password: hashedPassword,
        },
        { where: { _id: userId, resetToken: passwordToken } }
      );
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => console.log(err));
};

module.exports = {
  getLogin,
  getSignUp,
  getResetPassword,
  getNewPassword,
  postLogin,
  postLogout,
  postSignUp,
  postResetPassword,
  postNewPassword,
};
