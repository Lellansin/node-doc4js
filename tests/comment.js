var comment = require('../lib/comment');


var line = 'exports.error = async function (query, {limit, skip, sort}, { name }) {';
console.log(comment.getMethodHead(line));
