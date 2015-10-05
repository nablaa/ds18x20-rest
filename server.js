#!/usr/bin/env node

"use strict";

const DEFAULT_CONFIG = "config.json"

var fs = require("fs");
var nconf = require("nconf");
var prompt = require("prompt");
var async = require("async");
var express = require('express');
var expressRest = require('express-rest');
var sensor = require('ds18x20');
var app = express();
var rest = expressRest(app);

var isLoaded = sensor.isDriverLoaded();

if (!isLoaded) {
  console.log("You must first load the temperature driver on your Raspberry Pi:");
  console.log("   sudo modprobe w1-gpio && sudo modprobe w1-therm");
  process.exit();
}

var args = process.argv.slice(2);
var configFile;

if (args.length >= 1) {
  configFile = args[0];
} else {
  configFile = DEFAULT_CONFIG;
}

nconf.file(configFile);

// Automatically create a new config file if one does not exist
if (!fs.existsSync(configFile)) {

  console.log("No config file found. One will be automatically created in " + configFile);

  prompt.start();
  prompt.message = "Config";

  async.series({
      portPrompt: function(callback) {
        var schema = {
          properties: {
            port: {
              required: true,
              description: "What port to run server on?",
              default: "8080"
            }
          }
        };

        prompt.get(schema, callback);
      },
      sensorsPrompt: function (callback) {
        var schema = {
          properties: {}
        };
        
        var listOfDeviceIds = sensor.list();
        for (let i = 0; i < listOfDeviceIds.length; i++) {
          schema.properties[listOfDeviceIds[i]] = {
            required: true,
            description: "Enter name for " + listOfDeviceIds[i]
          }
        }
        
        prompt.get(schema, callback);
      }
    }, 
    // The final callback after all prompts.
    function(err, results) {
      if (!err) {
        nconf.set("port", results.portPrompt.port);

        var sensorList = {};
        for (var address in results.sensorsPrompt) {
          sensorList[results.sensorsPrompt[address]] = address;
        }

        nconf.set("sensors", sensorList);

        // Saving to disk is async, but we already have the values at this point. 
        nconf.save(function (err) {
            if (err) {
              console.error("Saving config failed. %s", configFile);
            }
          });


        startServer();
      }
    });
} else {
  startServer();
}

function startServer() {
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
}


