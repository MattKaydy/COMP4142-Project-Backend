const express = require("express");
var router = express.Router();

var request = require('request');

var requestData = { answer: 42 };

var data = {
    url: 'http://localhost:12345/ask',
    json: true,
    body: { answer: 42}
}

request.post(data, function (error, response, body) {
        console.log("POST REQUEST Sent!")
        if (!error && response.statusCode == 200) {
            console.log(body);
        }
    }
);