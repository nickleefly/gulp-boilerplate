var $ = jQuery = require('jquery');
console.log('from Feature B');

$(function () {
  var message = '<p>from Feature A</p>';
  $('body').append(message);
})