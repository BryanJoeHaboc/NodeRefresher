const fs = require("fs");

const requestHandler = (req, res) => {
  const { url, method } = req;
  //   console.log(req);
  if (url === "/") {
    res.write("<html>");
    res.write("<head><title>Enter message</title></head>");
    res.write(
      "<body><form action='/message' method='POST'><input type='text' name='message'> <button type='submit'>Send Message</button></form></body>"
    );
    res.write("</html>");
    return res.end();
  }

  if (url === "/message" && method === "POST") {
    console.log("pasok sa /message");
    const body = [];
    req.on("data", (chunk) => {
      body.push(chunk);
      console.log(chunk);
    });

    req.on("end", () => {
      const parsedBody = Buffer.concat(body).toString();
      console.log(parsedBody);
      fs.writeFile("message.txt", parsedBody.split("=")[1], (err) => {
        // NOTE: code is in the /message path, we set the status to 302 in order to redirect to home page '/'
        res.statusCode = 302;
        res.setHeader("Location", "/");
        return res.end();
      });
    });
  }
};

module.exports = {
  requestHandler,
};
