/**
 * prostoPopup
 * 
 * @author Bartosz Sak <bartosz.sak@gmail.com>
 */

(function($) {
  
  //variables
  var $document = $(document),
    $window = $(window),
    $body = $('body'),
    $overlay = null;


  $.fn.prostoPopup = function(options, arg1) {
    
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
      onScrollResize: null,

      //internal, do not modify
      _internal: {
        origParent: null
      }
    }

      
    if (typeof options == 'string') {

      /*
       *  Commands handling
       */
      
      var command = options,
          ret = this;
      
      this.each(function() {
        
        var $this = $(this);
        
        var options = $this.data('prosto-popup-options') || {};
        
        
        if (command == 'open') {
          if ($.fn.prostoPopup.isOpen())
            $.fn.prostoPopup.close();
          
          if (options.onBeforeOpen)
            options.onBeforeOpen.call($this);
          
          $overlay.stop(true).addClass('pp-visible').animate({ opacity: 0.6 }, options.transitionSpeed);

          $this.addClass('pp-open');
          $window.trigger('scroll.prostoPopup', [true]);
          $this.stop(true).animate({ opacity: 1 }, options.transitionSpeed, function() {
            if (options.onAfterOpen)
              options.onAfterOpen.call($this);
          });
        }
        else if (command == 'close') {

          if ($this.prostoPopup('isOpen')) {
            if (options.onBeforeClose)
              options.onBeforeClose.call($this);
            
            $overlay.stop(true).animate({ opacity: 0 }, options.transitionSpeed, function() {
              $(this).removeClass('pp-visible');
              
              if (options.onAfterOpen)
                options.onAfterOpen.call($this);
              
            });
            $this.stop(true).animate({ opacity: 0 }, options.transitionSpeed, function() {
              $this.removeClass('pp-open');
              if (options.onAfterClose)
                options.onAfterClose.call($this);
            });
            
            $body.css('overflow', '');
            $body.css('padding-right', '');
          }
        }
        else if (command == 'refresh') {
          $.fn.prostoPopup.refresh();
        }
        else if (command == 'destroy') {
          if (options._internal) {
            $this.prostoPopup('close');
            $this.stop(true).removeClass('pp-open').css({ top: '', left: '', opacity: ''});

            var origParent = options._internal.origParent;
            if (origParent)
              $this.detach().appendTo(origParent);
            $this.removeData('prosto-popup-options');
          }
        }
        else if (command == 'isOpen') {
          ret = ret && $this.hasClass('pp-open');
        }
        else if (command == 'options') {
          //if change options object passed
          if (arg1 && (typeof arg1 === 'object') && (arg1 !== null)) {
            options = $.extend(true, options, arg1);
            $this.data('prosto-popup-options', options);
          }
          //return options
          ret = options._internal ? options : null;
        }
        
      });

      return ret;
    }
    else {

      /*
       *  Plugin init
       */
      
      if ($.fn.prostoPopup.defaults)
        defaults = $.extend(defaults, $.fn.prostoPopup.defaults); 
      
      options = options || {};
      options = $.extend(true, defaults, options);
      
      
      //add overlay
      if (!$('#prosto-popup-overlay').length) {
        $('<div id="prosto-popup-overlay"></div>').appendTo($body);
      }
      $overlay = $('#prosto-popup-overlay');
      

      return this.each(function() {
        
        var $this = $(this);

        if ($this.prostoPopup('options')) {
          window.console && console.error('prostoPopup: trying to initialize previously initialized popup, aborting');
          return true;
        }

        
        if (!$this.parent().is('body')) {
          options._internal.origParent = $this.parent();
          $this.detach().appendTo($body);
        }
        
        $this.data('prosto-popup-options', options);
        
        //close elements
        var closeEl = $overlay;
        if (options.close) {
          if (options.close instanceof $) {
            closeEl = closeEl.add(options.close);
          }
          else {
            $this.on('click', options.close, function(e) {
              e.preventDefault();
              $this.prostoPopup('close');
            });
          }
        }
        
        closeEl.on('click', function(e) {
          e.preventDefault();
          $this.prostoPopup('close');
        });
        
        $.fn.prostoPopup._internal.windowRegistry.push($this);
        
        $window.off('scroll.prostoPopup resize.prostoPopup').on('scroll.prostoPopup resize.prostoPopup', function(ev, isInit) {
          
          $body.css({ 'overflow': '', 'padding-right': ''});
          
          
          $overlay.css({ width: '', height: '' }).width($document.width() + 100).height($document.height());
          
          $.each($.fn.prostoPopup._internal.windowRegistry, function() {
            
            var $popup = $(this);
            
            if ($popup.length && $popup.hasClass('pp-open')) {
              
              var popupHeight = $popup.outerHeight(),
                popupHeightTotal = popupHeight + options.minSpaceVert * 2,
                windowHeight = $window.height(),
                windowScrollTop = $window.scrollTop();
              
              if (isInit || (popupHeightTotal <= windowHeight) || (options.preventScrolling == 'force')) {
                var top = Math.max((windowHeight - popupHeight) / 2 + windowScrollTop, options.minSpaceVert);
                
                if (top < windowScrollTop)
                  top = windowScrollTop;
                
                $popup.css({ top: top  + 'px'});
                
                if ((top + popupHeightTotal) > $document.height()) {
                  $overlay.height(top + popupHeightTotal);
                }
              }
              
              if (options.preventScrolling && ((options.preventScrolling == 'force') || (popupHeightTotal < windowHeight))) {
                $body.css('overflow', 'hidden');
                if ($document.height() > $window.height()) {
                  $body.css('padding-right', $.fn.prostoPopup._internal.scrollbarWidth + 'px');
                  $overlay.width($document.width());
                }
              }
              
              var left = ($window.width() - $popup.outerWidth()) / 2;
              $popup.css({ left: left + 'px'});
              
              if (!isInit) {
                var o = $popup.data('prosto-popup-options');
                if (o.onScrollResize)
                  o.onScrollResize.call($popup);
              }
            }
          });
        });
      });
    }
  }
  
  

  /*
   *  Events
   */
      
  $document.on('keyup', function(e) {
    if (e.which == 27)
      $.fn.prostoPopup.close();
  });
  
  
  
  /*
   *  Global functions
   */
  
  //closes all popups
  $.fn.prostoPopup.close = function() {
    
    var reg = $.fn.prostoPopup._internal.windowRegistry;
    if (reg) {
      $.each(reg, function(i, e) {
        if (e.prostoPopup)
          e.prostoPopup('close');
      });
    }
  }

  //destroys all popups
  $.fn.prostoPopup.destroy = function() {
    
    var reg = $.fn.prostoPopup._internal.windowRegistry;
    if (reg) {
      $overlay.remove();
      $.each(reg, function(i, e) {
        if (e.prostoPopup) {
          e.prostoPopup('destroy');
        }
      });
    }
  }

  //refreshes position of visible popups
  $.fn.prostoPopup.refresh = function() {
    $window.trigger('resize.prostoPopup');
  }
  
  //returns true if any popup is open
  $.fn.prostoPopup.isOpen = function() {
    var ret = false;
    $.each($.fn.prostoPopup._internal.windowRegistry, function() {
      if (this.prostoPopup('isOpen')) {
        ret = this;
        return false;
      }
    });
    return ret;
  }
  

  /*
   *  Internals
   */
  
  //internal data
  $.fn.prostoPopup._internal = {
    windowRegistry: [],
    scrollbarWidth: null
  }
  
  //get scrollbar width
  var $outer = $('<div>').css({visibility: 'hidden', width: 100, overflow: 'scroll'}).appendTo('body'),
    widthWithScroll = $('<div>').css({width: '100%'}).appendTo($outer).width();
  $outer.remove();
  $.fn.prostoPopup._internal.scrollbarWidth = 100 - widthWithScroll;
  
})(jQuery);