'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var glob = require("glob");
var mkdirp = require("mkdirp");

var comment = require('./comment');
var markdown = require('./markdown');

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
      format(fs.readFileSync(file).toString(), path.basename(file))
    );
  }
};

var getDestPath = function(src, file, dest) {
  return path.join(dest, file.slice(src.length));
};

var format = function(content, fileName) {
  var res = [];
  var decorators = [],
    decoFlag = false;
  content.split(/[\n]/).map(function(line) {
    if (!line.trim()) {
      res.push(line);
      return;
    }

    if (isDecorator(line)) {
      decoFlag = true;
      decorators.push(line);
      return;
    }

    let lastLine = getLastLine(res);

    // insert format Comment
    if (isFuncLine(line) && !hasComment(lastLine)) {
      // remove last blank line
      if (isEmptyLine(lastLine)) {
        res.pop();
      }
      res.push(comment.generate(line, decorators, fileName));
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
  return notAnonymousFunc(line) ||
    line.indexOf('async ') >= 0 ||
    line.indexOf('class ') >= 0;
};

var notAnonymousFunc = function(line) {
  return (line.indexOf('function') >= 0) &&
    !/[,(][\s]*function/.test(line);
};

var isDecorator = function(line) {
  return /^[\s]*\@\w[\d\w_$]*/.test(line);
};

var isEmptyLine = function(line) {
  return /^[\s]*$/.test(line);
};

var getLastLine = function(lines) {
  return lines[lines.length - 1];
};

var hasComment = function(line) {
  return /\*\//.test(line) || // todo upgrade
    /^[\s]*\/\//.test(line);
};

/**
 * Generate Markdown Document
 */
exports.generate = function(content) {
  // var content = fs.readFileSync(filePath);
  return generate(content.toString());
};

var generate = function(content, filename, indent) {
  var list = [];
  var re = content.match(/\/\*[\w\W]+?\*\//g);

  if (re && re.length > 0) {
    for (let item of re) {
      list.push(
        comment.parse(item));
    }
  }

  return markdown.output(list, filename, indent);
};

exports.generateDir = function(srcDir) {
  var files = glob.sync(path.join(srcDir, "**/*.js"));
  var index = '',
    content = '';
  var srcDeep = getDirDeep(srcDir);
  var mapFlag = {};

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var indent = getDirDeep(file) - srcDeep;
    var dirname = path.dirname(file);
    var data = generate(fs.readFileSync(file).toString(), except(file, srcDir), indent);

    // if (!mapFlag[dirname]) {
    //   mapFlag[dirname] = true;
    //   if (indent >= 0) {
    //     index += Array(indent).fill(' ').join('') + '* `' + dirname + '`\n';
    //   }
    // }

    index += data.index;
    content += data.content;
  }

  console.log(index);
  console.log(content);

  return;
};

var except = function(dest, src) {
  return dest.replace(src, '');
};

var getDirDeep = function(filePath) {
  // todo update
  if (filePath[filePath.length - 1] === '/') {
    filePath += 'test';
  }

  var dir = path.dirname(filePath);
  var count = 0;

  for (let ch of dir) {
    if (ch === '/') {
      count++;
    }
  }

  return count;
};

// console.log(getDirDeep('/Users/Lellansin/Documents/github/node-doc4js/tests/apis//'));
// console.log(getDirDeep('/Users/Lellansin/Documents/github/node-doc4js/tests/apis/app.js'));


