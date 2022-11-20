

class Network {

  // Build an hardcoded array with IP addresses

  // Send HTTP Post request to a list of hardcoded IP addresses for their blocks
  sendBlockRequest() {


  }


  // Receive HTTP Post request, send my blocks to the requester
  listenForRequest() {

    var http = require('http');
    http.createServer(function (req, res) {

      //When receive request, send something here:
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Hello World!');
    res.end();
        

  }).listen(8080);  

  }

}