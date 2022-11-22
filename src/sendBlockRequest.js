const express = require("express");
var router = express.Router();

var request = require('request');

request.post(
    'http://localhost:12345/ask',
    { json: { key: 'value' } },
    function (error, response, body) {
        console.log("POST REQUEST Sent!")
        if (!error && response.statusCode == 200) {
            console.log(body);
        }
    }
);