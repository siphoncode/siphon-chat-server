var WebSocketServer = require('ws').Server;
var http = require('http');
var express = require('express');
var app = express();
var port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/'));

var server = http.createServer(app);
server.listen(port);
console.log('HTTP server listening on %d', port);

var wss = new WebSocketServer({server: server});
console.log('Websocket server created');

wss.broadcast = function(data) {
  for (var i in this.clients) {
    this.clients[i].send(data);
  }
};

var currentID = 0;

var pings = function(ws) {
  setTimeout(function() {
    if (ws.readyState != 1) return; // socket closed, stop sending pings
    ws.send('ping');
    pings(ws);
  }, 2000);
};

wss.on('connection', function(ws) {
  ws.id = currentID++; // give the user a sort-of unique ID
  console.log('New connection from #' + ws.id);
  ws.on('message', function(message) {
    wss.broadcast('[user-' + ws.id + '] ' + message);
  });

  // Prevent idle timeouts
  pings(ws);
});
