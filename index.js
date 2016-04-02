var express = require('express'),
    app = express();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(3000, function () {
    console.log('House Hunter listening on port 3000!');
});
