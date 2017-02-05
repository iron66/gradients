#Gradient.js
![gradient](http://i.imgur.com/CG2rJCq.gif)

**Suported features:**

- Transition duration
- Frames per second (FPS)
- Unlimited count of colors
- HEX colors
- Direction of gradient

**Not suportet yet:**

- Different count of colors (between start gradient and target)
- Works only with linear-gradient

***Usage***

```javascript
Element.gradientTransition(targetGradientString, duration, fps);
```
***Example:***
```javascript
var button = $('#button');
var element = document.querySelector('.some-class');
var gradientString = 'linear-gradient(rgb(247, 91, 52) 0%, rgb(240, 233, 93) 25%, rgb(43, 245, 12) 50%, rgb(24, 85, 240) 75%, rgb(166, 39, 230) 100%)';

button.click( function() {
  element.gradientTransition(targetGradientString, duration, fps);
} );
```

**Demo site**

https://iron66.github.io/gradients/

- Click 'RANDOM'