#Gradient.js
**Suported features:**

- Transition duration
- Unlimited count of colors

**Not suportet yet:**

- Gradient direction
- Different count of colors (between start gradient and target)
- Hex color code
- Works only with linear-gradient

***Usage***

```javascript
gradient(elementSelector, targetGradientString, duration)
```
***Example:***
```javascript
var button = $('#button');
var gradientString = 'linear-gradient(rgb(247, 91, 52) 0%, rgb(240, 233, 93) 25%, rgb(43, 245, 12) 50%, rgb(24, 85, 240) 75%, rgb(166, 39, 230) 100%)';

button.click( gradient('body', gradientString, 500) );
```

**Demo site usage**
- Click 'change'
- Click 'Magic!'