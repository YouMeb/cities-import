'use strict';

var fs = require('fs');
var mysql = require('mysql');
var through2 = require('through2');
var parser = require('./lib');
var alternames = require('./alternames.json');

var tableName = 'geo_city';

var conn = mysql.createConnection({
  host: 'triplan.ccviyy04pm9j.us-west-2.rds.amazonaws.com',
  database: 'triplan_dev',
  user: 'triplan',
  password: 'pz2m3;YRP5iX'
});

conn.connect();

// country codes
function createCountryMap() {
  var map = {};

  conn.query('SELECT * FROM geo_country')
    .on('result', function (result) {
      map[result.country_code] = result;
    })
    .on('end', createSqlString.bind(null, map));
}

function createSqlString(map) {
  conn.destroy();

  fs.createReadStream('./data/cities1000.txt')
    .pipe(parser.geoname())
    .pipe(through2.obj(function (record, enc, cb) {
      var country = map[record.countryCode];

      if (!country) {
        return cb();
      }

      var name = alternames[record.geonameid];

      if (!name) {
        return cb();
      }

      var sql = ''
        + 'INSERT INTO geo_city (country_id, city_name, longitude, latitude, is_user) '
        + 'VALUES (' + [
          country.country_id,
          '\'' + name + '\'',
          record.longitude,
          record.latitude,
          1
        ].join(', ') + ');\n';

      this.push(sql);

      cb();
    }))
    .pipe(process.stdout);
}

createCountryMap();
