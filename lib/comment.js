'use strict';

const path = require('path');

const FUNC = 'function';
const ID = {
  NULL: 'null',
  STRING: 'string',
  PARAM: 'param',
  OBJECT: 'object'
};

/*
 * Parse Comment to Object
 */
exports.parse = function(text) {
  var list = text.split('\n');
  var comments = list.slice(1, list.length - 1);
  var firstLine = comments.shift();
  var result = {
    name : stripslashes(firstLine),
    indent: getIndent(firstLine, true)
  };

  for (let line of comments) {
    var item = parse(line);
    switch(item.id) {
      case ID.STRING: break;
      case ID.NULL: break;
      case ID.PARAM:
        if (!result['@param']) {
          result['@param'] = [];
        }
        result['@param'].push({ type: item.type , value: item.value });
        break;
      case ID.OBJECT:
        result[item.key] = item.value;
        break;
      default:
        throw new Error('Unknow comment tag `' + line + '`');
    }
  }
  return result;
};

var parse = function(line) {
  var content = stripslashes(line);

  if (!content)
    return { id: ID.NULL };

  if (content[0] !== '@')
    return { id: ID.STRING, value: content};

  var key;
  var value = content.replace(/\@[\w\d]+/, function(text) {
    key = text;
    return '';
  }).trim();

  if (key === '@param') {
    var info = getCommentParam(value);
    return { id: ID.PARAM, 'key': key, type: info.type , value: info.value }
  }

  return { id: ID.OBJECT, key: key, value: value };
};

var stripslashes = function(str) {
  return str.replace(/^[\s]*\*[\s]*/, '');
};

var getCommentParam = function(str) {
  var type;
  var value = str.replace(/\{[\w]+\}/, function(text) {
    type = text;
    return '';
  }).trim();
  return {type, value};
};


/*
 * Generate comment by code line
 */
exports.generate = function(text, decorators, fileName) {
  if (/class/.test(text)) {
    return getClassComment(text, decorators, fileName || 'module.exports');
  } else if (/async|function/.test(text)) {
    return getMethodComment(text, decorators, fileName || 'module.exports');
  }
};

var getClassComment = function(text, decorators, fileName) {
  let indent = getIndent(text);
  let name = getClassName(text, fileName);
  return getComment(indent, name, [], null, decorators);
};

var getMethodComment = function(text, decorators, fileName) {
  let line = text
    .replace(/async[\s]+function/, 'function')
    .replace(/function[\s]+async/, 'function')
    .replace(/async/, 'function');

  let indent = getIndent(line);
  let name = getFuncName(line, fileName);
  let args = getArgs(line);

  return getComment(indent, name, args, null, decorators);
};

// todo upgrade
var getIndent = (line, flag) => {
  var res;
  line.replace(/^[\s]*/, (text) => {
    res = text.length;
  });
  return flag ? res - 1 : res;
};

var getClassName = function(line) {
  let re = line.match(/[\w\W]+class (\w[\w\d$_]*)/);
  if (re && re[1]) {
    return re[1];
  }

  return line;
};

var getFuncName = function(line, fileName) {
  let re = line.match(/[\w\W]+function[^\(]*/);
  let text = re && re[0] ? re[0] : line;

  if (text.indexOf('exports.') >= 0) {
    let res = text.match(/exports.(\w[\w\d$_]*)/);
    return res[1] ? res[1] : undefined;
  }

  if (/module.exports[\s]*=[\s]*function[\s]*\(/.test(line)) {
    return path.basename(fileName, '.js');
  }

  if (/=[\s]*function/.test(line)) {
    let res = line.match(/([\w_][\w\d$_]*)[\s]*=[\s]*function/);
    return res[1] ? res[1] : undefined;
  }

  let res = line.match(/function[\s]*([\w_][\w\d$_]*)/);
  if (res && res[1]) {
    return res[1];
  }
  return text.slice(text.indexOf(FUNC) + FUNC.length).trim() || undefined;
};

var getArgs = function(line) {
  let re = line.slice(line.indexOf(FUNC) + FUNC.length).match(new RegExp(/\([\w\W]+\)/));
  if (!re || !re[0]) {
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

  return {
    detail, content
  };
};
