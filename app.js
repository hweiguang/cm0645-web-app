var express = require('express')
var app = express()

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(8080, function() {
  console.log('Node app is running on port 8080');
});
