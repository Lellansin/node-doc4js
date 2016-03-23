'use strict';

var fs = require('fs');
var util = require('util');

var comment = require('./comment');

/**
 * Formatter the code with API's Comment
 */
exports.format = function(path) {
  var content = fs.readFileSync(path).toString();
  return format(content);
};

var format = function(content) {
  var res = [];
  var list = content.split(/[\n]/).map(function(line, index) {
    if (!line.trim()) {
      return false;
    }
    if (isFuncLine(line)) {
      res.push(comment.getMethodHead(line));
    }
    res.push(line);
  });

  return res.join('\n');
};

var isFuncLine = function(line) {
  return line.indexOf('function') >= 0;
};

/**
 * Generate Markdown Document
 */
exports.generate = function(path) {
  var content = fs.readFileSync(path).toString();

  
};
