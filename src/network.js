const express = require("express");
var app = express();
var router = express.Router();

var portNumber = 12345;

app.listen(portNumber, function () {
  console.log('Example app listening on port 12345 !');
});

app.post(
  "/ask",
  async (req, res, next) => {

    try {
      console.log("Successfully returned POST request")
      // Return the latest block in the ch

      return res.status(200).json("success");
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }
);