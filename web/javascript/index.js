window.$ = jQuery = require('jquery');
var test = require("./test")();
var plugin = require('plugin');
require('bootstrap');

$(function () {
  var message = '<p>index message</p>';
  $('body').append(message);
  console.log('index.js loaded!');
  plugin();
  console.log(typeof $().modal);

})
