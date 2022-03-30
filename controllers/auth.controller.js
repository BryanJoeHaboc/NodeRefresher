exports.getLogin = (req, res) => {
  console.log("req.session", req.session);
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isLoggedIn: false,
  });
};

exports.postLogin = (req, res, next) => {
  console.log("req.session", req.session);
  req.session.isLoggedIn = true;
  res.redirect("/");
};
