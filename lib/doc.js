'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var glob = require("glob");
var mkdirp = require("mkdirp");

var comment = require('./comment');

/**
 * Formatter the code with API's Comment
 */
exports.format = function(content) {
  return format(content);
};

exports.formatFile = function(path) {
  var content = fs.readFileSync(path).toString();
  return format(content);
};

exports.formatDir = function(srcDir, destDir) {
  var files = glob.sync(path.join(srcDir, "**/*.js"));

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var destFile = getDestPath(srcDir, file, destDir);
    console.log('destFile', destFile);
    mkdirp.sync(path.dirname(destFile));
    fs.writeFileSync(
      destFile,
      format(fs.readFileSync(file).toString())
    );
  }

};

var getDestPath = function(src, file, dest) {
  return path.join(dest, file.slice(src.length));
}

var format = function(content) {
  var res = [];
  var decorators = [],
    decoFlag = false;
  content.split(/[\n]/).map(function(line, index) {
    if (!line.trim()) return false;

    if (isDecorator(line)) {
      decoFlag = true;
      decorators.push(line);
      return;
    }

    if (isFuncLine(line) && !hasComment(res[res.length - 1])) {
      // insert format Comment
      res.push(comment.parse(line, decorators));
    }

    if (decoFlag) {
      for (let item of decorators) {
        res.push(item);
      }
      decoFlag = false;
      decorators = [];
    }

    res.push(line);
  });

  return res.join('\n');
};

var isFuncLine = function(line) {
  return line.indexOf('function') >= 0 ||
    line.indexOf('async') >= 0 ||
    line.indexOf('class') >= 0;
};

var isDecorator = function(line) {
  return /^[\s]*\@\w[\d\w_$]*/.test(line);
}

var hasComment = function(line) {
  return /\*\//.test(line) ||
    /^[\s]*\/\//.test(line);
}

/**
 * Generate Markdown Document
 */
exports.generate = function(path) {
  var content = fs.readFileSync(path).toString();


};
