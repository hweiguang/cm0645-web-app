// Importing modules
var MbedConnectorApi = require('mbed-connector-api');
var express = require('express');
var path = require('path');
var async = require('async');
var ioLib = require('socket.io');
var http = require('http');

// Access key to mbed Device connector
var accessKey = process.env.ACCESS_KEY || "SwgkE7Q8UD9j5W4PP6lUw1PbUVe66EUDq2Ur3OfDqb6OoXsH0P3U0o1wBnOTv1oFXuAvAmAJofZHGgn47E7Lv1zVWI5yHjLAI4Su";

// Server port
var port = process.env.PORT || 8080;

// Device endpoint
var frdmK64Endpoint = 'd573a52a-f126-4525-acce-014b56c7f05a';

// Resource endpoints
var ledRedResourceURI = '/led/0/red';
var ledGreenResourceURI = '/led/0/green';
var ledBlueResourceURI = '/led/0/blue';

var accXResourceURI = '/acc/0/x';
var accYResourceURI = '/acc/0/y';
var accZResourceURI = '/acc/0/z';

// Instantiate an mbed Device Connector object
var mbedConnectorApi = new MbedConnectorApi({
  accessKey: accessKey
});

// Setting up the app
var app = express();

// Setting up the view directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Setting up the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set the port
app.set('port', port);

// Render the index page
app.get('/', function(request, response) {
  response.render('index');
});

// Handle unexpected server errors
app.use(function(err, req, res, next) {
  console.log(err.stack);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});

var sockets = [];
var server = http.Server(app);
var io = ioLib(server);

// Setup sockets for updating web UI
io.on('connection', function (socket) {
  // Add new client to array of client upon connection
  sockets.push(socket);

  socket.on('toggle-switch', function(data) {
    mbedConnectorApi.putResourceValue(frdmK64Endpoint, data.id, data.value, function(error) {
      if (error) throw error;
    });
  });

  socket.on('get-accelerometer-value', function() {
    mbedConnectorApi.getResourceValue(frdmK64Endpoint, accXResourceURI, function(error, value) {
      if (error) throw error;
      socket.emit('accelerometer-value', {
        id: 'acc-x-value',
        value: value
      });
    });

    mbedConnectorApi.getResourceValue(frdmK64Endpoint, accYResourceURI, function(error, value) {
      if (error) throw error;
      socket.emit('accelerometer-value', {
        id: 'acc-y-value',
        value: value
      });
    });

    mbedConnectorApi.getResourceValue(frdmK64Endpoint, accZResourceURI, function(error, value) {
      if (error) throw error;
      socket.emit('accelerometer-value', {
        id: 'acc-z-value',
        value: value
      });
    });
  });
});

// Notification callback
mbedConnectorApi.on('notification', function(notification) {
  console.log('Notification: ', notification);
});

// Start the app
server.listen(port, function() {
  // Set up the notification channel (pull notifications)
  mbedConnectorApi.startLongPolling(function(error) {
    if (error) throw error;
    console.log('App listening on port %s', port);
  })
});
