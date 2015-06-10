var $ = require("jquery");

var test = module.exports = function () {
  $(test.init);
  return test;

}

test.init = function () {
  var message = '<p>test message</p>';
  $('body').append(message);
  console.log('test.js loaded!');
}


