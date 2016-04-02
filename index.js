var express  = require('express'),
    request  = require('request'),
    app      = express(),
    location,
    rawLocation,
    that = this;

var getLocationData = function(address) {
        var url = "https://maps.googleapis.com/maps/api/geocode/json?&address=" + address;
        return new Promise(function(resolve, reject) {
            var data;
            request({url:url}, function (err, res, body) {
                if (err) {
                    return reject(err);
                } else if (res.statusCode !== 200) {
                    err = new Error("Unexpected status code: " + res.statusCode);
                    err.res = res;
                    return reject(err);
                }
                data = JSON.parse(body);
                that.location = data.formatted_address;
                data = data.results[0].geometry;
                that.rawLocation = data;
                console.log(data);
                resolve(data);
            });
        });
    };

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(3000, function () {
    console.log('House Hunter listening on port 3000!');
});
