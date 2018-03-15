var customColors = [
  ['#000428', '#004EB0'],
  ['#34E89E', '#0F3443'],
  ['#0B486B', '#FF6217'],
  ['#5614B0', '#DBD65C'],
  ['#E55D87', '#5FC3E4']
];

var directions = ['top', 'right', 'bottom', 'left', 'top right', 'bottom right', 'bottom left', 'top left', 'right top', 'right bottom', 'left bottom', 'left top'];

function randomInteger(min, max) {
  var rand = min + Math.random() * (max - min);
  rand = Math.round(rand);
  return rand;
}

function createHexGradientString(data) {
  data.direction = data.direction || 'to right';
  data.colors = data.colors || [
    ['#ffffff', 0],
    ['#ffffff', 100]
  ];


  var string = '',
    colors = '';

  for (var i = 0; i < data.colors.length; i++) {
    colors += data.colors[i].join(' ') + '%';
    if (data.colors[i + 1]) {
      colors += ', '
    }
  }
  string = 'linear-gradient(' + data.direction + ', ' + colors + ')';

  return string;
}



var gradients = [];
$.getJSON("js/demogradients.json", function (data) {
  for (var gr in data) {
    // var string = 'linear-gradient(to ' + directions[1] + ', ' + data[gr].colors[0] + ' 0%' + ', ' + data[gr].colors[1] + ' 100%' + ')';
    var string = 'linear-gradient(to ' + directions[randomInteger(0, directions.length - 1)] + ', ' + data[gr].colors[0] + ' 0%' + ', ' + data[gr].colors[1] + ' 100%' + ')';
    gradients.push(string);
  }
});

$(document).ready(function () {
  var $settingsToggler = $('#settings_toggler'),
    targetElement = document.querySelector('.canvas'),
    $targetElement = $(targetElement),
    $settingsBlock = $('.settings'),
    $settingsCurrent = $settingsBlock.find('#currentGradientString'),
    $buttonSaved = $('#go'),
    $buttonRandom = $('#random'),
    $customSettings = $('#gradient_settings'),
    $colors = $('.color'),
    $customColors = $colors.find('input[type="radio"]'),
    $customColorsCustomValue = $colors.find('input[type="text"]'),
    $directions = $('.direction'),
    $customDirections = $directions.find('input[type="radio"]'),
    $customDirectionsCustomValue = $directions.find('input[type="text"]'),
    $duration = $('.duration'),
    $easing = $('.easing'),
    $customEasing = $('input[type="radio"]', $easing),
    $customEasingField = $('input[type="text"]', $easing),
    customGradient = {},
    borderBottomColor = $('section', $(this)).css('border-bottom-color');

  function triggerSettingsClick() {
    console.log($buttonSaved.prop("disabled"));
    
    if ($buttonSaved.prop("disabled")) {
      $buttonSaved.click(function () {
        $customSettings.trigger('click');
      });
    } else {
      $buttonSaved.off('click', $buttonSaved, this);
    }
  }

  $settingsCurrent.val($targetElement.css('background-image'));
  $settingsBlock.hide();
  $buttonSaved.prop("disabled", true);

  $customColors.each(function (index) {
    $(this).data({
      firstColor: [customColors[index][0], 0],
      secondColor: [customColors[index][1], 100]
    });
    var gradientString = createHexGradientString({
      direction: 'to right',
      colors: [$(this).data().firstColor, $(this).data().secondColor]
    });
    $(this).css('background-image', gradientString);
  });
  $customDirections.each(function (index) {
    var angle;
    switch ($(this).attr('data-direction')) {
      case 't':
        $(this).data({
          direction: 'to top'
        });
        angle = 0;
        break;
      case 'r':
        $(this).data({
          direction: 'to right'
        });
        angle = 90;
        break;
      case 'b':
        $(this).data({
          direction: 'to bottom'
        });
        angle = 180;
        break;
      case 'l':
        $(this).data({
          direction: 'to left'
        });
        angle = -90;
        break;
      case 'rt':
        $(this).data({
          direction: 'to right top'
        });
        angle = 45;
        break;
      case 'rb':
        $(this).data({
          direction: 'to right bottom'
        });
        angle = -225;
        break;
      case 'lb':
        $(this).data({
          direction: 'to left bottom'
        });
        angle = 225;
        break;
      case 'lt':
        $(this).data({
          direction: 'to left top'
        });
        angle = -45;
        break;
    }

    $(this).css('transform', 'rotate(' + angle + 'deg)');
  });

  $settingsCurrent.on('change', function () {
    $(targetElement).css('background-image', $(this).val());
  });

  $colors.on('change', function (event) {
    var colors = [],
      values;
    if (event.target.getAttribute('type') == 'radio') {
      var $checkedElement = $customColors.filter(':checked');
      values = [$checkedElement.data().firstColor.join(' '), $checkedElement.data().secondColor.join(' ')];
      $customColorsCustomValue.val('');
    } else {
      values = event.target.value.split(', ');
      $customColors.prop("checked", false);
    }
    for (var i = 0; i < values.length; i++) {
      colors.push(values[i].split(' '));
    }
    customGradient.colors = colors;
  });
  $directions.on('change', function (event) {
    // $customDirections.prop("checked", false);
    var direction = '',
      values;
    if (event.target.getAttribute('type') == 'radio') {
      var $checkedElement = $customDirections.filter(':checked');
      direction = $checkedElement.data().direction;
      $customDirectionsCustomValue.val('');
    } else {
      direction = event.target.value + 'deg';
      $customDirections.prop("checked", false);
    }
    customGradient.direction = direction;
  });
  $easing.find('.options').on('change', function (event) {
    var easing = '',
      values;
    if (event.target.getAttribute('type') == 'radio') {
      var $checkedElement = $customEasing.filter(':checked');
      customGradient.easing = $checkedElement.data().easing;
    }
  });
  $duration.on('change', function (event) {
    customGradient.duration = event.target.value;
  });
  
  $customSettings.submit(function (event) {
    event.preventDefault();
    if (!customGradient.colors) {
      $colors.css('border-bottom-color', 'red');
    } else if (!customGradient.direction) {
      $directions.css('border-bottom-color', 'red');
    } else {
      $('section', $(this)).css('border-bottom-color', borderBottomColor);
      $buttonSaved.prop("disabled", false);
      customGradient.string = createHexGradientString({
        direction: customGradient.direction,
        colors: customGradient.colors
      });
      $settingsToggler.trigger("click");
    }
  });

  $settingsToggler.click(function () {
    $settingsBlock.slideToggle('fast');
  });

  $buttonRandom.click(function (e) {
    e.preventDefault();
    var targetGradientString = gradients[randomInteger(0, gradients.length - 1)];
    targetElement.gradientTransition(targetGradientString, 1500, 60);
  });
  $buttonSaved.click(function (e) {
    e.preventDefault();
    console.log('111');    
    triggerSettingsClick();
    targetElement.gradientTransition(customGradient.string, customGradient.duration, 60, customGradient.easing);
  });
});