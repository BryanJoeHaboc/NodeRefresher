const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

const getLogin = (req, res) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isLoggedIn: false,
  });
};

const postLogin = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            console.log(req.session.user);
            return res.redirect("/");
          }
        })
        .catch((err) => {
          console.log("error in dehashing", err);
          res.redirect("/login");
        });
    })
    .catch((err) => console.log("errorrrrrr", err));
};

const postLogout = (req, res) => {
  console.log("hello nasa post log out ako");
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
        return res.redirect("/signup");
      }
    })

    .catch((err) => console.log("errorrrrrrrrrrrrrrrrr", err));
};

const getSignUp = (req, res) => {
  res.render("auth/signup", {
    pageTitle: "Login",
    path: "/signup",
    isLoggedIn: false,
  });
};

module.exports = {
  getLogin,
  postLogin,
  postLogout,
  getSignUp,
  postSignUp,
};
