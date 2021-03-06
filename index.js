var express  = require('express'),
    request  = require('request'),
    _        = require('underscore'),
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

                resolve(data);
            });
        });
    },
    getCrimeData = function(lat, lng) {
        var url = "https://data.police.uk/api/crimes-street/all-crime?date=2016-01";
        url += "&lat="+lat+"&lng="+lng;
        return new Promise(function(resolve, reject) {
            var obj = {};
            request({url:url}, function(err, res, body) {
                if (err) {
                    return reject(err);
                } else if (res.statusCode !== 200) {
                    err = new Error("Unexpected status code: " + res.statusCode);
                    err.res = res;
                    return reject(err);
                }
                body = JSON.parse(body);
                _.each(body, function(objBody) {
                    if (!_.has(obj, objBody.category)) {
                        obj[objBody.category] = 0;
                    }
                    obj[objBody.category]++;
                });
                resolve(obj);
            });
        });
    },
    getHouseData = function(data) {
        var url = "http://api.zoopla.co.uk/api/v1/property_listings.js?api_key=pk77v6rbuevs3nqzjk26bx9u&radius=1";
        url += data.bounds?"&lat_min="+data.bounds.southwest.lat+"&lat_max="+data.bounds.northeast.lat+"&lon_min="+data.bounds.northeast.lng+"&lon_max="+data.bounds.southwest.lng:"&lat_min="+data.viewport.southwest.lat+"&lat_max="+data.viewport.northeast.lat+"&lon_min="+data.viewport.northeast.lng+"&lon_max="+data.viewport.southwest.lng;
        return new Promise(function(resolve, reject) {
            request({url:url}, function(err, res, body) {
                if (err) {
                    return reject(err);
                } else if (res.statusCode !== 200) {
                    err = new Error("Unexpected status code: " + res.statusCode);
                    err.res = res;
                    return reject(err);
                }
                data = JSON.parse(body);

                resolve(data);
            });
        });
    };

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/search', function(req, res) {
    if (!req.query.address) {
        res.status(400).send('Bad Request');
    }
    var counter = 0,
        target;
    getLocationData(req.query.address).then(function(data) {
        getHouseData(data).then(function(data) {
            var newListing = [];
            target = data.listing.length;
            _.each(data.listing, function(obj) {
                getCrimeData(obj.latitude, obj.longitude).then(function(crime) {
                    obj.crime = crime;
                    newListing.push(obj);
                    data.listing = newListing;
                    counter++;
                    if (counter === target) {
                        res.send(data);
                    }
                });
            });
        });
    });
});

app.listen(3000, function () {
    console.log('House Hunter listening on port 3000!');
});
