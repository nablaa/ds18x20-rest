#!/usr/bin/env node

"use strict";
var fs = require("fs");
var nconf = require("nconf");
var express = require('express');
var expressRest = require('express-rest');
var sensor = require('ds18x20');
var app = express();
var rest = expressRest(app);

var isLoaded = sensor.isDriverLoaded();
console.log("Is sensor driver loaded: " + isLoaded);

var args = process.argv.slice(2);
var configFile = args[0];

if (!fs.existsSync(configFile)) {
  console.log("Config file does not exist: " + configFile);
  console.log("Give proper config file as an argument");
  process.exit(1);
}

console.log("Config file: " + configFile);

nconf.file({ file: configFile });

var sensors = nconf.get("sensors");
var port = nconf.get("port");

rest.get("/temperatures", function(req, rest) {
  sensor.getAll(function (err, tempObj) {
    if (tempObj === undefined) {
      console.log(err);
      rest.serviceUnavailable(err);
    } else {
      var temps = {};
      for (var name in sensors) {
        var id = sensors[name];
        temps[name] = tempObj[id];
      }
      rest.ok(temps);
    }
  });
});

rest.get("/temperature/:name", function(req, rest) {
  var name = req.params.name;
  var id = sensors[name];

  if (id === undefined) {
    rest.notFound();
    return;
  }

  sensor.get(id, function (err, temp) {
    if (temp === undefined) {
      console.log(err);
      rest.serviceUnavailable(err);
    } else {
      rest.ok(temp);
    }
  });
});

console.log("Server started at http://127.0.0.1:" + port);
app.listen(port);
