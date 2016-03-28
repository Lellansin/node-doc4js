'use strict';


exports.output = function(data) {
  return output(data);
};

var output = function(list) {
  var content = '';
  for (let item of list) {
    var name = item.name;
    var indent = (item.indent / 2) + 1;
    var pre = Array(indent).fill('#').join('');

    content += `\n${pre} ${name}` + '\n';

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
      let keys = Object.keys(obj);

      content += '|类型|名称|\n';
      content += '|---|---|\n';
      for (var key in  obj) {
        content += '|' + key + '|' + obj[key] + '\n';
      }
    }

    if (!!item['@required']) {
      content += '\n`Require`' + '\n';
      content += item['@required'] + '\n';
    }

  }
  return content;
};

var data = [ { name: 'DailyPerfController', indent: 0 },
  { name: 'get',
    indent: 2,
    '@router': '{method: \'get\', path: \'/v1/perfdaily\'}',
    '@required': '{query: \'domain\'}',
    '@param': [{ type: '{type}', value: 'ctx' }] },
  { name: 'create',
    indent: 2,
    '@router': '{method: \'post\', path: \'/v1/perfdaily\'}',
    '@required': '{body: [\'data\', \'domain\']}',
    '@param': [{ type: '{type}', value: 'ctx' }] } ];

console.log(output(data));
