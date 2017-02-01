function step(element, startGradient, diff) {
  var  startGradientParts = startGradient.parts;
  if (startGradient.type == 'linear') {
    var newGradientString = 'linear-gradient(';
    if (startGradient.direction < diff.direction) {
        startGradient.direction++;
    } else if (startGradient.direction > diff.direction) {
        startGradient.direction--;
    }
    newGradientString += startGradient.direction + "deg, rgb(";
    for(var j in startGradientParts) {
      var arr =  startGradientParts[j];
      var channels = arr.channels;
      var percent = arr.percent;
      for (var i in channels) {
        if (diff.maxDiff.value === undefined || +j == diff.maxDiff.valuePart && +i == diff.maxDiff.valueChannel && channels[i] == diff.maxDiff.value) {
          clearInterval(window.gradientIterationTimer);
          return;
        }
        if (channels[i] < diff.parts[j].channels[i].value && diff.parts[j].channels[i].positive === true) {
          channels[i]++;
        } else if (channels[i] > diff.parts[j].channels[i].value && diff.parts[j].channels[i].positive === false){
          channels[i]--;
        }
        newGradientString += channels[i]
        if (i != 2) {
          newGradientString += ', ';
        }
      }
      if ( startGradientParts[+j+1]) {
        newGradientString += ') ' + percent + ', rgb(';
      } else {
        newGradientString += ') ' + percent + ')';
      }
    }
  }
  element.style.backgroundImage = newGradientString;
}

function getColors(input) {
  var rgb = [];
  var color = input;
  var matchColors = /(\d{1,3}),\s*?(\d{1,3}),\s*?(\d{1,3})/;
  var match = matchColors.exec(color);
  if (match !== null) {
    rgb.push(parseInt(match[1]));
    rgb.push(parseInt(match[2]));
    rgb.push(parseInt(match[3]));
  }
  return rgb;
}

function stringToDeg(string) {
  switch (string) {
    case 'top': return 0;
    case 'right': return 90;
    case 'bottom': return 180;
    case 'left': return 270;
    case 'top right': return 45;
    case 'bottom right': return 135;
    case 'bottom left': return 225;
    case 'top left': return 315;
    case 'right top': return 45;
    case 'right bottom': return 135;
    case 'left bottom': return 225;
    case 'left top': return 315;
  }
}

function getDirection (string) {
  var reg = /(\d{1,3}deg)|(to )|((left|right|bottom|top)\s?(left|right|bottom|top)?)/g;
  var degReg = /(\d{1,3}deg)/;
  var strReg = /(to )|(top|right|bottom|left)/;
  var result;
  var arr = [];
  var match = [];
  while ( (arr = reg.exec(string)) !== null) {
      if (arr != null) {
        match.push(arr[0]);
      }
  }
  //gradient derection defined as corner e.g. "130deg"
  if (match[0].search(degReg) != -1) {
    result = match[0].replace('deg','')
  }
  //gradient derection defined as string e.g. "to top right"
  else if (match[1].search(strReg) != -1) {
    result = stringToDeg(match[1])
  }

  return (parseInt(result);
}

function parseGradient(string) {
  var gradientColors = {};
  var arr = [];
  var reg = /rgb[a]?\((.*?)\)[ ]*?(\d{1,2}(?!\d)%|100%)/g;

  gradientColors.parts = [];
  while ( (arr = reg.exec(string)) !== null) {
    gradientColors.parts.push({
      'channels': getColors(arr[1]),
      'percent': arr[2],
    })
  }
  return gradientColors;
}

function difference(startGradient, targetGradient) {
  var max = 0,
    maxDiff = {};
  for(var part in targetGradient.parts) {
    var arr =  targetGradient.parts[part];
    var channels = arr.channels;
    for (channel in channels) {
      // diff is a difference between each channel (rgb) in start and target gradients
      var diff = channels[channel] - startGradient.parts[part].channels[channel];
      if (diff > 0) {
        var positive = true;
      } else if (diff < 0){
        var positive = false
      } // if diff == 0 'positive' should stay 'undefined'
      var value = targetGradient.parts[part].channels[channel];
      targetGradient.parts[part].channels[channel] = {};
      targetGradient.parts[part].channels[channel].value = value;
      targetGradient.parts[part].channels[channel].positive = positive;
      if (Math.abs(diff) > max) {
        max = Math.abs(diff);
        maxDiff = {
          'value': channels[channel].value,
          'valuePart': part,
          'valueChannel': channel,
          'valueDifference': max,
          'positive': positive
        };
      }
    }
  }
  targetGradient.maxDiff = maxDiff;
  return targetGradient;
}

function gradientTransition(startGradient, targetGradient, element, delay) {
  var diff = difference(startGradient, targetGradient);
  window.gradientIterationTimer = setInterval(function () {
    step(element, startGradient, diff)
  }, (delay / diff.maxDiff.valueDifference));
}

function gradient(elementSelector, targetGradientString, delay) {
  if (typeof(delay)==='undefined') delay = 100;

  var element = document.querySelector(elementSelector),
    computedStyle = window.getComputedStyle(element, null),
    startGradientString = computedStyle.backgroundImage,
    startGradient =  parseGradient(startGradientString),
    targetGradient =  parseGradient(targetGradientString);

  if (startGradient && targetGradient) {
    //define the type of gradient
    var startIsLinear = startGradientString.search('linear-gradient'),
      targetIsLinear = targetGradientString.search('linear-gradient');
    if (startIsLinear != -1 && targetIsLinear !=-1) {
      startGradient.type = 'linear';
      startGradient.direction = getDirection(startGradientString);
      targetGradient.direction = getDirection(targetGradientString);
    } else {
      alert('Sorry, it works only with linear gradients yet. Please, make sure that you typed correct gradient rule');
    }
    gradientTransition(startGradient, targetGradient, element, delay);
  }
}

document.addEventListener("DOMContentLoaded", function(event) {
  var start = document.querySelector('#start_button');
  var change = document.querySelector('#change');
  var input = document.querySelector('[name="to"]');
  var current = document.querySelector('#current');


  var string_1 = 'linear-gradient(rgb(247, 91, 52) 0%, rgb(240, 233, 93) 25%, rgb(43, 245, 12) 50%, rgb(24, 85, 240) 75%, rgb(166, 39, 230) 100%)';
  var string_2 = 'linear-gradient(rgb(166, 39, 230) 0%, rgb(24, 85, 240) 25%, rgb(43, 245, 12) 50%, rgb(240, 233, 93) 75%, rgb(247, 91, 52) 100%)';

  start.addEventListener('click', function(){
    var from = document.querySelector('body');
    var inputValue = input.value.trim();
    if (inputValue != undefined && inputValue != '') {
      gradient('body', inputValue, 3000);
    }
  });
  change.addEventListener('click', function(){
    var element = document.querySelector('body'),
      computedStyle = window.getComputedStyle(element, null),
      gradientString = computedStyle.backgroundImage;

    if (gradientString == string_1) {
      input.value = string_2;
    } else if (gradientString == string_2){
      input.value = string_1;
    }
  });
  current.addEventListener('click', function(){
    var element = document.querySelector('body'),
      computedStyle = window.getComputedStyle(element, null),
      gradientString = computedStyle.backgroundImage;

    console.log(gradientString);
  });
});