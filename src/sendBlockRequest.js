const request = require('request');

const data = {
  url: 'http://localhost:12345/ask',
  json: true,
  body: { answer: 42 },
};

request.post(data, function (error, response, body) {
  console.log('POST REQUEST Sent!');
  if (!error && response.statusCode === 200) {
    console.log(body);
  }
});
