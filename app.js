// Importing modules
var MbedConnectorApi = require('mbed-connector-api');
var express = require('express');
var path = require('path');
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

var magXResourceURI = '/mag/0/x';
var magYResourceURI = '/mag/0/y';
var magZResourceURI = '/mag/0/z';

var temperatureResourceURI = '/weather/0/temperature';
var humidityResourceURI = '/weather/0/humidity';
var lightResourceURI = '/weather/0/light';

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

var sockets = [];
var server = http.Server(app);
var io = ioLib(server);

// Setup sockets for updating web UI
io.on('connection', function (socket) {
  // Add new client to array of client upon connection
  sockets.push(socket);

  // Get LED status
  mbedConnectorApi.getResourceValue(frdmK64Endpoint, ledRedResourceURI, function(error, value) {
    if (error) console.error(error);
      socket.emit('toggle-value', {
        id: 'red-toggle-switch',
        value: value
      });
  });

  mbedConnectorApi.getResourceValue(frdmK64Endpoint, ledGreenResourceURI, function(error, value) {
    if (error) console.error(error);
      socket.emit('toggle-value', {
        id: 'green-toggle-switch',
        value: value
      });
  });

  mbedConnectorApi.getResourceValue(frdmK64Endpoint, ledBlueResourceURI, function(error, value) {
    if (error) console.error(error);
      socket.emit('toggle-value', {
        id: 'blue-toggle-switch',
        value: value
      });
  });

  // Toggling the checkbox
  socket.on('toggle-switch', function(data) {
    mbedConnectorApi.putResourceValue(frdmK64Endpoint, data.id, data.value, function(error) {
      if (error) console.error(error);
    });
  });

  socket.on('subscribe', function() {
    // Subscribe to accelerometer X value
    mbedConnectorApi.putResourceSubscription(frdmK64Endpoint, accXResourceURI, function(error) {
      if (error) console.error(error);
    });

    // Subscribe to accelerometer Y value
    mbedConnectorApi.putResourceSubscription(frdmK64Endpoint, accYResourceURI, function(error) {
      if (error) console.error(error);
    });

    // Subscribe to accelerometer Z value
    mbedConnectorApi.putResourceSubscription(frdmK64Endpoint, accZResourceURI, function(error) {
      if (error) console.error(error);
    });

    // Subscribe to magnetometer X value
    mbedConnectorApi.putResourceSubscription(frdmK64Endpoint, magXResourceURI, function(error) {
      if (error) console.error(error);
    });

    // Subscribe to magnetometer Y value
    mbedConnectorApi.putResourceSubscription(frdmK64Endpoint, magYResourceURI, function(error) {
      if (error) console.error(error);
    });

    // Subscribe to magnetometer Z value
    mbedConnectorApi.putResourceSubscription(frdmK64Endpoint, magZResourceURI, function(error) {
      if (error) console.error(error);
    });

    // Subscribe to light sensor value
    mbedConnectorApi.putResourceSubscription(frdmK64Endpoint, lightResourceURI, function(error) {
      if (error) console.error(error);
    });

    // Subscribe to humidity sensor value
    mbedConnectorApi.putResourceSubscription(frdmK64Endpoint, humidityResourceURI, function(error) {
      if (error) console.error(error);
    });

    // Subscribe to temperature sensor value
    mbedConnectorApi.putResourceSubscription(frdmK64Endpoint, temperatureResourceURI, function(error) {
      if (error) console.error(error);
    });
  });

  socket.on('disconnect', function() {
    // Remove this socket from the array when a user closes their browser
    var index = sockets.indexOf(socket);
    if (index >= 0) {
      sockets.splice(index, 1);
    }
  })
});

// Notification callback
mbedConnectorApi.on('notification', function(notification) {
  var path = notification.path;
  var payload = notification.payload;
  sockets.forEach(function(socket) {
    socket.emit('notifications', {
      id: path,
      value: payload
    });
  })
});

// Start the app
server.listen(port, function() {
  // Set up the notification channel (pull notifications)
  mbedConnectorApi.startLongPolling(function(error) {
    if (error) console.error(error);
    console.log('App listening on port %s', port);
  })
});
