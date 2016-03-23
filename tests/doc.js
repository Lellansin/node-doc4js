var doc = require('..');

if (false) {
  var content = require('./_test_file');
  console.log(doc.format(content));
}

if (true) {
  var file = '/Users/Lellansin/Documents/github/perf-web-server/src/apis/alarm.js';
  console.log(doc.generate(file));
}
