var $ = jQuery = require('jquery');
console.log('from Feature A');
require('bootstrap');

var React = require('react');
var ReactDOM = require('react-dom');
var Hello = require('./react/helloworld.js')

ReactDOM.render(<Hello/>, document.getElementById('react-hello-world'));
$(function () {
  var message = '<p>from Feature A</p>';
  $('body').append(message);
  console.log(typeof $().modal);
})