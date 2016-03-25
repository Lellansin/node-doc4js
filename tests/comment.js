var comment = require('../lib/comment');


// var line = 'exports.error = async function (query, {limit, skip, sort}, { name }) {';
// var line = "export var email = function(message, receivers = 'frontend@ele.me', subject = 'Perf 通知') {";
var line = "module.exports = class AlarmController {";
console.log(comment.parse(line));
