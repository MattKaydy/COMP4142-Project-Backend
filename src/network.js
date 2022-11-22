const express = require('express');
const app = express();
const portNumber = 12345;

app.listen(portNumber, function () {
  console.log('Example app listening on port 12345 !');
});

app.use(express.json());

app.post('/ask', async (req, res, next) => {
  console.log(req.body.answer);

  try {
    console.log('Successfully returned POST request');

    return res.status(200);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});
