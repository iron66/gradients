/* Gradients.js
 *
 *  Example of rgb gradient string: linear-gradient(265deg, rgb(44, 62, 80) 0%, rgb(253, 116, 108) 100%)
 *  Example of hex gradient string: linear-gradient(265deg, #fefefe 0%, #dadada 100%)
 *  Percentage part is necessary!
 *
 *
 * Gradient object:
 *  gradient: {
 *    direction: '0 - 359',
 *    type: 'linear',
 *    parts: [
 *      0: {
 *        channels: [
 *          0: red channel
 *          1: green channel
 *          2: blue channel
 *        ],
 *        percent: 0%-100%
 *      }
 *    ]
 *  }
 */

Element.prototype.gradientTransition = function (targetGradientString, duration, fps, easingFn) {
    'use strict';

    // Default values:
    duration = duration || 1000;
    fps = fps || 1000 / 60;
    easingFn = easingFn || 'linear';

    var elementSize = getElementSize(this);
    var angles = getAngles(elementSize.height, elementSize.width);

    var easingFunctions = {
        // no easing, no acceleration
        linear: function (t) { return t },
        // accelerating from zero velocity
        easeInQuad: function (t) { return t*t },
        // decelerating to zero velocity
        easeOutQuad: function (t) { return t*(2-t) },
        // acceleration until halfway, then deceleration
        easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
        // accelerating from zero velocity
        easeInCubic: function (t) { return t*t*t },
        // decelerating to zero velocity
        easeOutCubic: function (t) { return (--t)*t*t+1 },
        // acceleration until halfway, then deceleration
        easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
        // accelerating from zero velocity
        easeInQuart: function (t) { return t*t*t*t },
        // decelerating to zero velocity
        easeOutQuart: function (t) { return 1-(--t)*t*t*t },
        // acceleration until halfway, then deceleration
        easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
        // accelerating from zero velocity
        easeInQuint: function (t) { return t*t*t*t*t },
        // decelerating to zero velocity
        easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
        // acceleration until halfway, then deceleration
        easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
    };

    if(this.execution) {
        clearInterval(this.iterationTimer);
        this.style.backgroundImage = this.currentGradientString;
        var startGradientString = this.currentGradientString;
    } else {
        this.execution = true;
        var startGradientString = window.getComputedStyle(this, null).backgroundImage ||  this.style.backgroundImage || this.currentGradientString;
    }


    var startGradient = parseGradient(startGradientString),
        currentGradient = parseGradient(startGradientString),
        oneFrameTime = 1000 / fps,
        frames = duration / oneFrameTime;

    var targetGradient = parseGradient(targetGradientString);
    var directionDifference = Math.abs(startGradient.direction - targetGradient.direction);
    if (directionDifference >= 180) {
        targetGradient = parseGradient(equalGradient(targetGradientString));
    };

    try {
        if (targetGradient.type == 'linear' && startGradient.type == 'linear') {
            // Linear transition
            transition(this, startGradient, currentGradient, targetGradient, duration, easingFn);

        } else if (targetGradient.type == 'radial' && startGradient.type == 'radial'){
            // Radial transition
            throw new Error('Sorry, it works only with linear gradients yet. Please, make sure that you typed correct gradient rule');
        }  else {
            throw new SyntaxError("Gradients types is different or incorrect");
        }
    } catch(e) {
        console.warn('Error ' + e.name + ":" + e.message + "\n" + e.stack);
        return null;
    }

    function getElementSize(el) {
        return {
            height: el.offsetHeight,
            width: el.offsetWidth
        }
    }

    function getColorType(string) {
        if (string.search('rgb') != -1) {
            var type = 'rgb';
        } else if (string.search('#') != -1) {
            var type = 'hex';
        }
        return type;
    }

    function parseGradient(string) {
        var gradient = {};
        var arr = [];
        var colorType = getColorType(string);
        if (colorType == "rgb") {
            var reg = /rgba?\(((?:\d{1,3}[, ]*){3})+\)\s*(\d{1,3}%)?/g;
        } else if (colorType == 'hex') {
            var reg = /#([0-9a-fA-F]{6})+\s*(\d{1,3}%)?/g;
        }
        gradient.direction = getDirection(string);
        gradient.type = getType(string);
        gradient.parts = [];
        while ( (arr = reg.exec(string)) !== null) {
            gradient.parts.push({
                'channels': getColors(arr[1], colorType),
                'percent': arr[2]
            });
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
        if (match.length) {
            if (match[0].search(degReg) != -1) {
                result = match[0].replace('deg','')
            } else if (match[1].search(strReg) != -1) {
                result = stringToDegree(match[1])
            } else {
                throw new Error('Incorect direction');
            }
        } else return 180;

        return (parseInt(result)%360);
    }

    function getType(string) {
        var startIsLinear = string.search('linear-gradient');
        var startIsRadial = string.search('radial-gradient');
        if (startIsLinear != -1) {
            return 'linear';
        } else if (startIsRadial != -1) {
            return 'radial';
        }  else {
            throw new SyntaxError("Incorrect target gradient string");

        }
    }

    function getColors(string, type) {
        if (type == 'rgb') {
            // Example of rgb color: rgb(44, 62, 80)
            var matchColors = /(\d{1,3}),\s*?(\d{1,3}),\s*?(\d{1,3})/;
        } else if (type == 'hex') {
            // Example of hex color: #fefefe
            var matchColors = /([0-9a-fA-F]{2})\s*?([0-9a-fA-F]{2})\s*?([0-9a-fA-F]{2})/;
        } else {
            throw new Error('incorrect color type');
            return;
        }

        var defineNumber = function (number) {
            if (type == 'rgb') {
                return parseInt(number);
            } else if (type == 'hex') {
                return  parseInt(number, 16);
            }
        };

        var colorsArray = [];
        var match = matchColors.exec(string);
        if (match !== null) {
            /**
             * 0: red channel (0-255)
             * 1: green channel (0-255)
             * 2: blue channel (0-255)
             **/
            var red_channel = defineNumber(match[1]),
                green_channel = defineNumber(match[2]),
                blue_channel = defineNumber(match[3]);
            if (0 <= red_channel && red_channel <= 255) {
                colorsArray.push(red_channel);
            } else {
                throw new SyntaxError("In '" + string + "', red channel can't be greater then 255 and lower than 0");
            }
            if (0 <= green_channel && green_channel <= 255) {
                colorsArray.push(green_channel);
            } else {
                throw new SyntaxError("In '" + string + "', green channel can't be greater then 255 and lower than 0");
            }
            if (0 <= blue_channel && blue_channel <= 255) {
                colorsArray.push(blue_channel);
            } else {
                throw new SyntaxError("In '" + string + "', blue channel can't be greater then 255 and lower than 0");
            }
        } else {
            throw new SyntaxError("Incorrect target gradient string");
            return;
        }
        return colorsArray; //array[3]
    }

    function transition(el, startGradient,currentGradient, targetGradient, duration, esFn) {
        targetGradient = difference(currentGradient, targetGradient);
        var framesCounter = 0;
        el.iterationTimer = setInterval(function () {
            framesCounter++;
            if (framesCounter <= frames) {
                currentGradient = step(startGradient, currentGradient, targetGradient, framesCounter, easingFunctions[esFn]);
                var string = gradientObjectToString(currentGradient);
                el.currentGradientString = string;
                el.style.backgroundImage = el.currentGradientString;
            } else {
                el.style.backgroundImage = targetGradientString;
                el.currentGradientString = targetGradientString;
                el.execution = false;
                clearInterval(el.iterationTimer);
            }

        }, (duration / frames));
    }

    function step(startGradient, currentGradient, targetGradient, currentStep, esFn) {
        var mp = esFn(currentStep/frames);
        var curVal = startGradient.direction + (targetGradient.direction.step * currentStep * mp);
        currentGradient.direction = curVal;
        for (var p in currentGradient.parts) {
            for (var c in currentGradient.parts[p].channels) {
                var mp = esFn(currentStep/frames);
                var curVal = startGradient.parts[p].channels[c] + (targetGradient.parts[p].channels[c].step * currentStep * mp);
                currentGradient.parts[p].channels[c] = curVal;
            }
        }
        return currentGradient;
    };

    function difference(startGradient, targetGradient) {
        // initial maximal difference value
        var max = 0,
            maxDiff = {};

        var directionDifference = targetGradient.direction - startGradient.direction;
        if (Math.abs(directionDifference) > max) {
            max = Math.abs(directionDifference);
            if (directionDifference > 0) {
                var positive = true;
            } else if (directionDifference < 0) {
                var positive = false
            } // if difference = 0 -> 'positive' should stay 'undefined'
        }
        maxDiff = {
            'value': targetGradient.direction,
            'valuePart': 'direction',
            'valueDifference': max, // save the difference value
            'positive': positive,
            'step': targetGradient.direction / frames
        };
        targetGradient.direction = {
            'value': targetGradient.direction,
            'valueDifference': directionDifference, // save the difference value
            'positive': positive,
            'step': directionDifference / frames
        };

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
                // targetGradient.parts[p].channels[c] = {};
                targetGradient.parts[p].channels[c] = {
                    'value': currentValue,
                    'valueDifference': colorDifference,
                    'positive': positive,
                    'step': colorDifference / frames
                };
                // Then compare the difference with 'max'
                if (Math.abs(colorDifference) > max) {
                    max = Math.abs(colorDifference);
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
            case 'top right':
            case 'right top': return angles.b;
            case 'bottom right':
            case 'right bottom': return angles.a + 90;
            case 'bottom left':
            case 'left bottom': return angles.b + 180;
            case 'top left':
            case 'left top': return angles.a + 270;
        }
    }

    function getAngles(sideOne, sideTwo) {
        /*
         *     b
         *     *
         *     *   *
         *   B *       *
         *     *          *
         *    c* * * * * * * * a
         *           A
         *
         *   B = sideOne, A = sideWto
         * */

        var a,b, c = 90;

        a = (Math.atan(sideTwo/sideOne)) * 180 / Math.PI;
        b = 180 - c - a;

        return {a: a, b: b};
    }

    function gradientObjectToString(gradient) {
        var string = 'linear-gradient('+Math.round(gradient.direction)+'deg, rgb(';
        for (var p in gradient.parts) {
            for (var c in gradient.parts[p].channels) {
                string += Math.round(gradient.parts[p].channels[c]);
                // if channel is NOT last of channels array
                if (c != 2) {
                    string += ', ';
                } else {
                    string += ') ';
                }
            }
            // If part is NOT last of array
            if (gradient.parts[+p+1]) {
                // And if it has a percent
                if (gradient.parts[p].percent) {
                    string += ' ' + gradient.parts[p].percent;
                }
                string += ', rgb(';
            }
            // If part IS last of array
            else {
                if (gradient.parts[p].percent) {
                    string += ' ' + gradient.parts[p].percent;
                }
                string += ')';
            }
        }
        return string;
    }

    function equalGradient(gradientString) {
        var newGradientObject = {},
            newGradientString = '',
            gradient = parseGradient(gradientString),
            percents = [],
            colors = [],
            invertedDirection;
        if (gradient.direction > 180) {
            invertedDirection = gradient.direction - 180;
        } else if (gradient.direction < 180) {
            invertedDirection = gradient.direction + 180;
        } else if (gradient.direction == 180) {
            invertedDirection = 0;
        }

        for (var i = 0; i < gradient.parts.length; i++) {
            percents.push(gradient.parts[i].percent);
            colors.push(gradient.parts[i].channels);
        }
        colors.reverse();
        percents.reverse();
        for (var i = 0; i < percents.length; i++) {
            var percent = percents[i].substring(0, (percents[i].length - 1));
            percent = Math.abs(100 - percent);
            percents[i] = percent + '%';
        }
        newGradientObject.direction = invertedDirection;
        newGradientObject.type = gradient.type;
        newGradientObject.parts = [];
        if (percents.length == colors.length) {
            for (var i = 0; i < percents.length; i++) {
                newGradientObject.parts.push({
                    channels: colors[i],
                    percent: percents[i]
                })
            }
        }
        newGradientString = gradientObjectToString(newGradientObject);

        return newGradientString;
    }

};