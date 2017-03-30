$(document).ready(function() {
  var $settingsToggler = $('#settings_toggler'),
    $settingsBlock = $('.settings'),
    $settingsCurrent = $('.settings .current code'),
    targetElement = document.querySelector('.canvas'),
    targetElementGradient = window.getComputedStyle(targetElement),
    $targetElement = $('.canvas'),
    $buttonSave = $('.settings button'),
    $buttonRandom = $('.canvas #random'),
    $buttonGO = $('.settings #go');

  $settingsCurrent.html($targetElement.css('background-image'));
  $settingsBlock.hide();

  $settingsToggler.click(function () {
    $settingsBlock.slideToggle('fast');
  });
  $buttonSave.click(function (e) {
    e.preventDefault();
    $settingsToggler.trigger("click");
  });
  $buttonRandom.click(function (e) {
    e.preventDefault();
    var targetGradientString = gradients[randomInteger(0, gradients.length - 1)];
    targetElement.gradientTransition(targetGradientString, 1500, 60);
  });

  var directions = ['top', 'right', 'bottom','left', 'top right', 'bottom right', 'bottom left', 'top left', 'right top', 'right bottom', 'left bottom', 'left top' ];

  function randomInteger(min, max) {
    var rand = min + Math.random() * (max - min)
    rand = Math.round(rand);
    return rand;
  }

  var gradients = [];
  $.getJSON( "js/demogradients.json", function( data ) {
    for (var gr in data) {
      // var string = 'linear-gradient(to ' + directions[1] + ', ' + data[gr].colors[0] + ' 0%' + ', ' + data[gr].colors[1] + ' 100%' + ')';
      var string = 'linear-gradient(to ' + directions[randomInteger(0, directions.length - 1)] + ', ' + data[gr].colors[0] + ' 0%' + ', ' + data[gr].colors[1] + ' 100%' + ')';
      gradients.push(string);
    }
  });


});