var $ = jQuery = require('jquery');
var test = require("./test")();
var plugin = require('plugin');
require('bootstrap');
require("jquery-ui");
var React = require('react');
var ReactDOM = require('react-dom');
var Hello = require('./react/helloworld.js')

ReactDOM.render(<Hello/>, document.getElementById('react-hello'));

$(function () {
  var message = '<p>index message</p>';
  $('body').append(message);
  console.log('index.js loaded!');
  plugin();
  console.log(typeof $().modal);

})
