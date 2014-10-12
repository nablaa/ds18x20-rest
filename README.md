# ds18x20-rest

ds18x20-rest provides REST API for DS18x20 temperature sensors.

## Installation

    $ npm install ds18x20-rest

## Usage

Before starting the server, a config file must be created. Below is a sample
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
