const path = require("path");

// NOTE: refers to the filename which our app runs (app.js)
module.exports = path.dirname(require.main.filename);
