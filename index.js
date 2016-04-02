var express = require('express'),
    request = require('request'),
    app = express();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(3000, function () {
    console.log('House Hunter listening on port 3000!');
});
