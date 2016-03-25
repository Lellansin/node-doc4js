var path = require('path');
var doc = require('..');

if (false) {
  var content = require('./_test_file');
  console.log(doc.format(content));
}

if (false) {
  var file = '/Users/Lellansin/Documents/github/perf-web-server/src/apis/alarm.js';
  var txt = doc.formatFile(file);
  console.log(txt);
}


if (true) {
  var src = '/Users/Lellansin/Documents/github/perf-web-server/src/';
  var dest = path.join(__dirname, './apis');
  var txt = doc.formatDir(src, dest);
  console.log(txt);
}

if (false) {
  var file = '/Users/Lellansin/Documents/github/perf-web-server/src/apis/alarm.js';
  console.log(doc.generate(file));
}
