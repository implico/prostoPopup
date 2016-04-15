# prostoPopup

A jQuery popup plugin. Just shows the content, fully customizable, no default theme.


<br />
## Installation

Use [Bower](http://bower.io/) or clone this repo into e.g. `js/prostoPopup` directory.

Include the `prostoPopup.js` and `_prostoPopoup.css` (the underline allows to import the file with SASS) files in your document, e.g.:

```html
<link rel="stylesheet" href="js/prostoPopup/_prostoPopoup.css">
<script src="js/prostoPopup/prostoPopup.js"></script>
```

## Initialization

1. First, create popup markup - must have the `prosto-popup` class. An example with a content and close button:
  
  ```html
  <div class="prosto-popup" id="my-popup">
    <a href="#" class="close">&times;</a>
    <div class="content">
      Popup content
    </div>
  </div>
  ```
2. In your own CSS, add styles for the popup window, e.g.:

  ```css
  #my-popup {
    width: 500px;
    max-width: 90%;
    padding: 20px 20px;
    background: #fff;
    box-shadow: 3px 3px 10px #000;
  }
  ```
3. Optionally, you can add transitions for the popup showing phase. By default, the popup comes from the top, so set the `top` property transition:

  ```css
  /* notice: only when ".pp-open" class is set */
  #my-popup.pp-open {
    /* example 1: the popup comes smoothly from above the viewport */
    -webkit-transition: top 0.7s;
      transition: top 0.7s;

    /* example 2: same but with a bump effect */
    -webkit-transition: 0.7s cubic-bezier(0.2, -0.5, 0.2, 1.4);
      transition: top 0.7s cubic-bezier(0.2, -0.5, 0.2, 1.4);
  }
  ```
4. Initialize the popup (after the DOM is ready):

  ```js
  $(function() {
    $('#my-popup').prostoPopup({
      close: '.close'
      //...other options
    });
  });
  ```
5. Add a handler to show it, e.g.:

  ```js
  $('button').click(function() {
    $('#my-popup').prostoPopup('show');
  });
  ```


## API

### Options with default values:

```js
var defaults = {
  preventScrolling: true,                     //disables scrolling when open, unless the popup height exceeds window height
                                              //set to 'force' to maintain this setting even if the content exceeds the viewport height
                                              
  transitionSpeed: 'fast',                    //overlay/popup transition speed
  close: null,                                //elements to close the popup; string: jQuery selector searched inside the popup or jQuery object
  minSpaceVert: 25,                           //minimum space (px) between popup and window border

  //callbacks
  onBeforeOpen: function() {
    //sets the position right above the viewport
    this.css('top', $(window).scrollTop() - this.outerHeight(true) + 'px');
  },
  onAfterOpen: null,
  onBeforeClose: null,
  onAfterClose: null,
  onScrollResize: null
}
```

At the beginning, you can set the default option values applied to all popups:

```js
  $.fn.prostoPopup.defaults = {
    //...
  }
```


### Commands

#### Individual for a popup

```js
  //shows the popup (closing the currently open one if any)
  $('#my-popup').prostoPopup('show');

  //hides the popup
  $('#my-popup').prostoPopup('hide');

  //refreshes position of the popup; automatically triggered on window resize, call it when the popup content changes
  $('#my-popup').prostoPopup('refresh');

  //removes popup handlers and restores their original locations (if moved to the top of the DOM)
  $('#my-popup').prostoPopup('destroy');

  //returns true if popup is open
  $('#my-popup').prostoPopup('isOpen');

  //allows to get/set options
  var options = $('#my-popup').prostoPopup('options');
  $('#my-popup').prostoPopup('options', { preventScrolling: false });
```


#### Global

```js
  //hides any visible popup
  $.fn.prostoPopup.hide();

  //removes all popups and deletes overlay element
  $.fn.prostoPopup.destroy();

  //refreshes any visible popup
  $.fn.prostoPopup.refresh();

  //returns currently open popup jQuery object or false
  var isOpen = $.fn.prostoPopup.getOpen();
```


## Recipes

### Full-screen popup with scrolling

HTML:

```html
<div class="prosto-popup" id="my-popup">
  <a href="#" class="close">&times;</a>
  <div class="content">
    My content
  </div>
</div>
```

CSS:

```css
#my-popup {
  width: 100%;
  height: 100%;
  /* padding for left/right not set to have the scrollbar stick to the right */
  padding: 40px 0 20px;
  background: #fff;
}

#my-popup .close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 25px;
}

#my-popup .content {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  /* the close button will be always visible */
  overflow: auto;
  font-size: 12px;
}

```

JavaScript:

```js
$('#my-popup').prostoPopup({
  preventScrolling: 'force',
  minSpaceVert: 0
});
```
