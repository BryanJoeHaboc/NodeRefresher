const get404Page = (req, res, next) => {
  res.status(404).render("404", {
    pageTitle: "Page Not Found",
    path: "/404",
    isLoggedIn: req.session.isLoggedIn,
  });
};

const get500Page = (req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
    isLoggedIn: req.session.isLoggedIn,
  });
};

module.exports = {
  get404Page,
  get500Page,
};
