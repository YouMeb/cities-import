'user strict';

var fs = require('fs');
var parser = require('./lib');
var indexed = {};

fs.createReadStream('./data/alternateNames.txt')
  .pipe(parser.alternateNames())
  .pipe(parser.filter(function (record) {
    return record.isolanguage === 'zh';
  }))
  .on('data', function (record) {
    console.log(record.geonameid);
    indexed[record.geonameid] = record.alternateName;
  })
  .once('end', function () {
    fs.writeFileSync('./alternames.json', JSON.stringify(indexed));
  });
