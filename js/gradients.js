function step(element, startGradient, diff) {
    var  startGradientParts = startGradient.parts;
    if (startGradient.type == 'linear') {
        var newGradientString = 'linear-gradient(rgb(';
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
        gradient =  parseGradient(startGradientString),
        targetGradient =  parseGradient(targetGradientString);

    if (gradient && targetGradient) {
        //define the type of gradient
        var startIsLinear = startGradientString.search('linear-gradient'),
            targetIsLinear = targetGradientString.search('linear-gradient');
        if (startIsLinear != -1 && targetIsLinear !=-1) {
            gradient.type = 'linear';
        } else {
            alert('Sorry, it works onli with linear gradients yet. Please, make sure that you typed correct gradient rule');
        }
        gradientTransition(gradient, targetGradient, element, delay);
    }
}

document.addEventListener("DOMContentLoaded", function(event) {
    var start = document.querySelector('#start_button');
    var change = document.querySelector('#change');
    var input = document.querySelector('[name="to"]');


    var string_1 = 'linear-gradient(rgb(254,235,224) 0%,rgb(233,237,251) 100%)';
    var string_2 = 'linear-gradient(rgb(125,185,232) 0%,rgb(176,178,35) 100%)';

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
});