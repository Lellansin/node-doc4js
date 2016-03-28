'use strict';

exports.output = function(data, filename, indent) {
  if (data && data.length) {
    return output(data, filename, indent);
  }
  return { content:'', index:'' };
};

var output = function(list, filename, indentGlobal) {
  indentGlobal = indentGlobal ? indentGlobal : 0;
  var content = '', index = Array(indentGlobal).fill(' ').join('') + `* ${filename}\n`;;

  for (let item of list) {
    var name = item.name;
    var indent = (item.indent / 2) + 1;
    var pre = indent > 0 ? Array(indent + indentGlobal).fill('#').join('') : '';

    content += `\n${pre} [${name}](id='${replaceBlank(name)}')` + '\n';
    index += Array((indent + indentGlobal) * 2).fill(' ').join('') + `* [${replaceBlank(name)}](#${replaceBlank(name)})\n`;

    if (!!item['@param']) {
      let list = item['@param'];
      content += '\n`参数`' + '\n'; // todo 保留字
      content += '|类型|名称|\n';
      content += '|---|---|\n';

      for (var i = 0; i < list.length; i++) {
        let param = list[i];
        content += '|' + param.type + '|' + param.value + '|\n';
      }
    }

    if (!!item['@router']) {
      content += '\n`请求`' + '\n';
      let obj = eval('(' + item['@router'] + ')');

      content += '|类型|名称|\n';
      content += '|---|---|\n';
      for (var key in  obj) {
        content += '|' + key + '|' + obj[key] + '|\n';
      }
    }

    if (!!item['@required']) {
      content += '\n`Require`' + '\n';
      let obj = eval('(' + item['@required'] + ')');

      content += '|类型|名称|\n';
      content += '|---|---|\n';
      for (var key in  obj) {
        content += '|' + key + '|' + obj[key] + '|\n';
      }
    }
  }

  return { content, index };
};

var replaceBlank = function(str) {
  return str.replace(/\s/g, '_');
};
