"use strict";
var fs = require("fs");
var nconf = require("nconf");
var express = require('express');
var sensor = require('ds18x20');
var app = express();

var isLoaded = sensor.isDriverLoaded();
console.log("Is sensor driver loaded: " + isLoaded);

nconf.argv()
 .env()
 .file({ file: "./config.json" });

var sensors = nconf.get("sensors");
var port = nconf.get("port");

app.get('/temperatures', function (req, res) {
  sensor.getAll(function (err, tempObj) {
    if (tempObj === undefined) {
      console.log(err);
      res.status(500).send("Error: " + err);
    } else {
      var temps = {};
      for (var name in sensors) {
        var id = sensors[name];
        temps[name] = tempObj[id];
      }
      res.send(temps);
    }
  });
});

app.get('/temperature/:name', function (req, res) {
  var name = req.params.name;
  var id = sensors[name];

  if (id === undefined) {
    res.status(404).send("Sensor name " + name + " not found");
    return;
  }

  sensor.get(id, function (err, temp) {
    if (temp === undefined) {
      console.log(err);
      res.status(500).send("Error: " + err);
    } else {
      res.send(temp);
    }
  });
});

console.log("Server started at http://127.0.0.1:" + port);
app.listen(port);
