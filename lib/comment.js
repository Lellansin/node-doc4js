var FUNC = 'function';

exports.getMethodHead = function(line) {
  line = line
    .replace(/async[\s]+function/, 'function')
    .replace(/function[\s]+async/, 'function');

  var name = getName(line);
  var args = getArgs(line);

  return getMethodHead(name, args);
};

var getName = function(line) {
  var re = line.match(/[\w\W]+function[^\(]*/);
  var text = re[0] ? re[0] : line;

  if (text.indexOf('exports.') >= 0) {
    var res = text.match(/exports.(\w[\w\d$_]*)/);
    return res[1] ? res[1] : undefined;
  }

  if (/=[\s]*function/.test(line)) {
    var res = line.match(/([\w_][\w\d$_]*)[\s]*=[\s]*function/);
    return res[1] ? res[1] : undefined;
  }

  return text.slice(text.indexOf(FUNC) + FUNC.length).trim() || undefined;
};

var getArgs = function(line) {
  var re = line.slice(line.indexOf(FUNC) + FUNC.length).match(new RegExp(/\([\w\W]+\)/));
  if (!re[0]) {
    return [];
  }
  var resv = [], str = re[0];
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
      return value;
    });
};

var getMethodHead = function(name, args, returns) {

  var doc = '\n/**\n * ' + name + '\n *\n';

  args.forEach(function(item) {
    doc += ' * @param {type} ' + item + '\n';
  });

  if (returns) {
    doc += ' * @return {type} ' + returns;
  }

  doc += ' */';

  return doc;
}
