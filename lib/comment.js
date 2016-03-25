'use strict';

const util = require('util');

const FUNC = 'function';

exports.parse = function(text, decorators) {
  if (/class/.test(text)) {
    return getClassComment(text, decorators);
  } else if (/async|function/.test(text)) {
    return getMethodComment(text, decorators);
  }
};

var getClassComment = function(text, decorators) {
  let indent = getIndent(text);
  let name = getClassName(text);
  return getComment(indent, name, [], null, decorators);
}

var getMethodComment = function(text, decorators) {
  let line = text
    .replace(/async[\s]+function/, 'function')
    .replace(/function[\s]+async/, 'function')
    .replace(/async/, 'function');

  let indent = getIndent(line);
  let name = getFuncName(line);
  let args = getArgs(line);

  return getComment(indent, name, args, null, decorators);
};

var getIndent = line => {
  var res;
  line.replace(/^[\s]*/, (text) => {
    res = text.length;
  });
  return res;
};

var getClassName = function(line) {
  let re = line.match(/[\w\W]+class (\w[\w\d$_]*)/);
  if (re && re[1]) {
    return re[1];
  }

  return line;
};

var getFuncName = function(line) {
  let re = line.match(/[\w\W]+function[^\(]*/);
  let text = re[0] ? re[0] : line;

  if (text.indexOf('exports.') >= 0) {
    let res = text.match(/exports.(\w[\w\d$_]*)/);
    return res[1] ? res[1] : undefined;
  }

  if (/=[\s]*function/.test(line)) {
    let res = line.match(/([\w_][\w\d$_]*)[\s]*=[\s]*function/);
    return res[1] ? res[1] : undefined;
  }

  return text.slice(text.indexOf(FUNC) + FUNC.length).trim() || undefined;
};

var getArgs = function(line) {
  let re = line.slice(line.indexOf(FUNC) + FUNC.length).match(new RegExp(/\([\w\W]+\)/));
  if (!re[0]) {
    return [];
  }
  let resv = [],
    str = re[0];
  return str
    .slice(1, str.length - 1)
    .replace(/\{[\w\W]+?\}/g, function(text) {
      resv.push(text);
      return '$';
    })
    .split(',')
    .map(function(value) {
      if (value.trim() == '$') {
        return resv.shift();
      }
      return value.trim();
    });
};

var getComment = function(indent, name, args, returns, decorators) {
  var pre = Array(indent).fill(' ').join('');
  var doc = '\n' +
    pre + '/** \n' +
    pre + ' * ' + name + '\n' +
    pre + ' *\n';

  decorators.forEach(function(item) {
    let obj = getDecorator(item);
    let detail = obj.detail;
    let content = obj.content;
    doc += pre + ' * ' + detail + ' ' + content + '\n';
  });

  args.forEach(function(item) {
    doc += pre + ' * @param {type} ' + item + '\n';
  });

  if (returns) {
    doc += pre + ' * @return {type} ' + returns;
  }

  doc += pre + ' */';

  return doc;
};

var getDecorator = function(line) {
  var detail, content;
  var re = line.match(/\@\w[\d\w_$]*/);
  if (re && re[0]) {
    detail = re[0];

    var re2 = line.match(/\(([\w\W]*)\)/);
    if (re2 && re2[0]) {
      content = re2[1];
    }
  }

  return {detail, content};
};

// var line = "@router({method: 'put', path: '/v1/alarm/:_id'})";
// console.log(getDecorator(line));


