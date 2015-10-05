# ds18x20-rest

ds18x20-rest provides REST API for DS18x20 temperature sensors.

[![NPM](https://nodei.co/npm/ds18x20-rest.png?downloads=true)](https://nodei.co/npm/ds18x20-rest/)

## Installation

    $ npm install ds18x20-rest

## Usage

A config file will automatically be created for you if an existing config file is not found at the location you specified. You will be prompted for values when you first run the server. Alternatively, you may manually create a config file with the following format:

 Below is a sample
of a config file which defines two sensors: `mytemp1` and `mytemp2`:

```js
{
  "sensors": {
    "mytemp1": "28-000004d5037e",
    "mytemp2": "28-000004d48d1d"
  },
  "port": "8080"
}
```

The server is started as follows:

    $ ds18x20-rest path/to/config.json

*Note*: If you do not specify a path to a config file, the server will look for one at 'config.json'.

## API

When the server is running, the following REST API is available:

### `GET /temperatures`

Returns temperatures from all sensors. Example:
```
{"mytemp1":21.7,"mytemp2":21.0}
```

### `GET /temperature/name`

Returns temperature reading from sensor `name`.

Example: `/temperature/mytemp1`
```
21.7
```
