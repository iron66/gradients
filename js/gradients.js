Element.prototype.gradientTransition = function (targetGradientString, duration, fps) {
  'use strict';

  // Default values:
  duration = duration || 1000;
  fps = fps || 1000 / 60;

  var startGradientString = window.getComputedStyle(this, null).backgroundImage,
    startGradient = parseGradient(startGradientString),
    targetGradient = parseGradient(targetGradientString),
    frames = duration / fps;

  try {
    if (targetGradient.type == 'linear' && startGradient.type == 'linear') {
      // Linear transition
      transition(this, startGradient, targetGradient, duration);

    } else if (targetGradient.type == 'radial' && startGradient.type == 'radial'){
      // Radial transition
      throw new Error('Sorry, it works only with linear gradients yet. Please, make sure that you typed correct gradient rule');
    }  else {
      throw new SyntaxError("Gradients types is different");
    }
  } catch(e) {
    console.warn('Error ' + e.name + ":" + e.message + "\n" + e.stack);
    return null;
  }

  function parseGradient(string) {
    var gradient = {};
    var arr = [];
    // An example of a string which you are trying to match by this regex
    // will be great (instead of this comment).
    var reg = /rgb[a]?\((.*?)\)[ ]*?(\d{1,2}(?!\d)%|100%)/g;

    gradient.direction = getDirection(string);
    gradient.type = getType(string);
    gradient.parts = [];
    while ( (arr = reg.exec(string)) !== null) {
      gradient.parts.push({
        'channels': getColors(arr[1]),
        'percent': arr[2]
      })
    }
    return gradient;
  }

  function getDirection (string) {
    var result;

    var match = [];

    var arr = [];
    var reg = /(\d{1,3}deg)|(to )|((left|right|bottom|top)\s?(left|right|bottom|top)?)/g;
    while ( (arr = reg.exec(string)) !== null) {
      match.push(arr[0]);
    }

    // Gradient direction defined as corner e.g. "130deg"
    var degReg = /(\d{1,3}deg)/;
    // Gradient direction defined as string e.g. "to top right"
    var strReg = /(to )|(top|right|bottom|left)/;

    if (match[0].search(degReg) != -1) {
      result = match[0].replace('deg','')
    }
    else if (match[1].search(strReg) != -1) {
      result = stringToDegree(match[1])
    }

    return (parseInt(result)%360);
  }

  function getColors(string) {
    var rgb = [];

    var matchColors = /(\d{1,3}),\s*?(\d{1,3}),\s*?(\d{1,3})/;
    var match = matchColors.exec(string);

    try {
      if (match !== null) {
        /**
         * 0: red channel (0-255)
         * 1: green channel (0-255)
         * 2: blue channel (0-255)
         **/
        if (0 <= parseInt(match[1]) && parseInt(match[1]) <= 255) {
          rgb.push(parseInt(match[1]));
        } else {
          throw new SyntaxError("In '" + string + "', red channel can't be greater then 255 and lower than 0");
        }
        if (0 <= parseInt(match[2]) && parseInt(match[2]) <= 255) {
          rgb.push(parseInt(match[2]));
        } else {
          throw new SyntaxError("In '" + string + "', green channel can't be greater then 255 and lower than 0");
        }
        if (0 <= parseInt(match[3]) && parseInt(match[3]) <= 255) {
          rgb.push(parseInt(match[3]));
        } else {
          throw new SyntaxError("In '" + string + "', blue channel can't be greater then 255 and lower than 0");
        }
      } else {
        throw new SyntaxError("Incorrect target gradient string");
      }
    } catch(e) {
      // If colors in target gradient string is incorrect:
      console.warn('Error ' + e.name + ":" + e.message + "\n" + e.stack);
      return null;
    }

    return rgb; //array[3]
  }

  // If this function would be before getColors then the code had been more readable
  // since this function gets called earlier.
  function getType(string) {
    var startIsLinear = string.search('linear-gradient');
    var startIsRadial = string.search('linear-gradient');
    // startIsLinear === startIsRadial ???

    try {
      if (startIsLinear != -1) {
        return 'linear';
      } else if (startIsRadial != -1) {
        return 'radial';
      }  else {
        throw new SyntaxError("Incorrect target gradient string");
      }
    } catch(e) {
      // If colors in target gradient string is incorrect:
      console.warn('Error ' + e.name + ":" + e.message + "\n" + e.stack);
      return null;
    }
  }

  function step(currentGradient, targetGradient, type) {
    if (type == 'linear') {
      if (currentGradient.direction < targetGradient.direction.value) {
        currentGradient.direction += targetGradient.direction.step;
      } else if (currentGradient.direction > targetGradient.direction.value) {
        currentGradient.direction += targetGradient.direction.step;
      }
      for (var p in currentGradient.parts) {
        var currentPart = currentGradient.parts[p];
        for (var c in currentGradient.parts[p].channels) {
          if (currentGradient.parts[p].channels[c] < targetGradient.parts[p].channels[c].value) {
            currentGradient.parts[p].channels[c] += targetGradient.parts[p].channels[c].step;
          } else if (currentPart.channels[c] > targetGradient.parts[p].channels[c].value){
            currentGradient.parts[p].channels[c] += targetGradient.parts[p].channels[c].step;
          }
        }
      }
      return currentGradient;
    }
  }

  function difference(startGradient, targetGradient) {
    // initial maximal difference value
    var max = 0,
      maxDiff = {};

    var directionDifference = targetGradient.direction - startGradient.direction;
    if (Math.abs(directionDifference) > max) {
      max = directionDifference;
      if (directionDifference > 0) {
        var positive = true;
      } else if (directionDifference < 0) {
        var positive = false
      } // if difference = 0 -> 'positive' should stay 'undefined'
      maxDiff = {
        'value': targetGradient.direction,
        'valuePart': 'direction',
        'valueDifference': max, // save the difference value
        'positive': positive,
        'step': targetGradient.direction / frames
      };
      targetGradient.direction = {
        'value': targetGradient.direction,
        'valuePart': 'direction',
        'valueDifference': directionDifference, // save the difference value
        'positive': positive,
        'step': directionDifference / frames
      };
    }

    //TODO: Add the difference between percentages to compare
    for (var p in targetGradient.parts) {
      for (var c in targetGradient.parts[p].channels) {
        var colorDifference = targetGradient.parts[p].channels[c] - startGradient.parts[p].channels[c];
        //Define the direction of difference (positive or negative)
        if (colorDifference > 0) {
          var positive = true;
        } else if (colorDifference < 0){
          var positive = false
        } // if difference = 0 -> 'positive' should stay 'undefined'
        var currentValue = targetGradient.parts[p].channels[c];
        // Write new values into targetGradient object
        targetGradient.parts[p].channels[c] = {};
        targetGradient.parts[p].channels[c].value = currentValue;
        targetGradient.parts[p].channels[c].positive = positive;
        targetGradient.parts[p].channels[c].valueDifference = colorDifference;
        targetGradient.parts[p].channels[c].step = targetGradient.parts[p].channels[c].valueDifference / frames;
        // Then compare the difference with 'max'
        if (Math.abs(colorDifference.value) > max) {
          max = Math.abs(colorDifference.value);
          maxDiff = {
            'value': targetGradient.parts[p].channels[c].value,
            'valuePart': p, // save the part number
            'valueChannel': c, // save the channel number
            'valueDifference': max, // save the difference value
            'positive': positive,
            'step': targetGradient.parts[p].channels[c].value / frames
          };
        }
      }
    }

    targetGradient.maxDiff = maxDiff;
    return targetGradient;
  }

  function stringToDegree(string) {
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

  // Should be before functions step, difference, stringToDegree.
  function transition(el, startGradient, targetGradient, duration) {
    targetGradient = difference(startGradient, targetGradient);
    var framesCounter = 0;
    var gradientIterationTimer = setInterval(function () {
      framesCounter++;
      if (framesCounter < frames) {
        var currentGradient = step(startGradient, targetGradient, startGradient.type);
        var string = 'linear-gradient('+Math.floor(currentGradient.direction)+'deg, rgb(';
        for (var p in currentGradient.parts) {
          for (var c in currentGradient.parts[p].channels) {
            string += Math.floor(currentGradient.parts[p].channels[c]);
            if (c != 2) {
              string += ', ';
            }
          }
          if ( currentGradient.parts[+p+1]) {
            string += ') ' + currentGradient.parts[p].percent + ', rgb(';
          } else {
            string += ') ' + currentGradient.parts[p].percent + ')';
          }
        }
        el.style.backgroundImage = string;
      } else {
        el.style.backgroundImage = targetGradientString;
        clearInterval(gradientIterationTimer);
      }

    }, (duration / frames));
  }

};