window.plugin = function() {
  $('body').append('<p>This line was generated by a non common-js plugin that depends on jQuery!</p>');
  console.log('plugin loaded');
};
