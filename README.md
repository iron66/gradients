#Gradient.js
![gradient demo](http://i.imgur.com/JZT4wm1.gif)
**Suported features:**

- Transition duration
- Unlimited count of colors
- Gradient direction
- Hex color code

**Not suportet yet:**

- Different count of colors (between start gradient and target)
- Works only with linear-gradient

***Usage***

```javascript
element.gradientTransition(gradientString, duration, fps);
```
***Example:***
```javascript
var button = $('#button');
var targetGradientString = 'linear-gradient(to right top, rgb(247, 91, 52) 0%, rgb(240, 233, 93) 25%, rgb(43, 245, 12) 50%, rgb(24, 85, 240) 75%, rgb(166, 39, 230) 100%)';
var targetElement = $('#target');

button.click( function() {
  targetElement.gradientTransition(targetGradientString, 1500, 60);
} );
```

**Demo site usage**
- Click 'random'
