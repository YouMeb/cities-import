'use strict';

var fs = require('fs');
var parser = require('./lib');

fs.createReadStream('./data/alternateNames.txt')
  .pipe(parser.count())
  .once('data', function (count) {
    console.log(count);
  });
