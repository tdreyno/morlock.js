var morlock = require('./api');
var BreakpointController = require('./controllers/breakpoint-controller');
var StickyElementController = require('./controllers/sticky-element-controller');
var ResponsiveImage = require('./core/responsive-image');

function defineJQueryPlugins($) {
  $.fn.morlockResize = function(options) {
    return $(this).each(function() {
      if (this !== window) {
        // console.log('must attach event to window', this);
        return;
      }

      var $this = $(this);
      morlock.onResize(function(d) {
        $this.trigger('morlockResize', d);
      });
      morlock.onResizeEnd(function(d) {
        $this.trigger('morlockResizeEnd', d);
      }, options);
    });
  };

  $.fn.morlockScroll = function() {
    return $(this).each(function() {
      if (this !== window) {
        // console.log('must attach event to window', this);
        return;
      }

      var $this = $(this);
      morlock.onScroll(function() {
        $this.trigger('morlockScroll');
      });
      morlock.onScrollEnd(function() {
        $this.trigger('morlockScrollEnd');
      });
    });
  };

  $.fn.morlockElementPosition = function(position) {
    return $(this).each(function() {
      if (this !== window) {
        // console.log('must attach event to window', this);
        return;
      }

      var $this = $(this);
      morlock.position.before(position, function() {
        $this.trigger('morlockElementPositionBefore', position);
      });
      morlock.position.after(position, function() {
        $this.trigger('morlockElementPositionAfter', position);
      });
    });
  };

  $.fn.morlockBreakpoint = function(options) {
    return $(this).each(function() {
      if (this !== window) {
        // console.log('must attach event to window', this);
        return;
      }

      var $this = $(this);
      var controller = new BreakpointController(options);
      controller.on('breakpoint', function(e) {
        $this.trigger('morlockBreakpoint', e);
      });
    });
  };

  $.fn.morlockElementVisible = function(options) {
    return $(this).each(function() {
      var $this = $(this);

      var observer = morlock.observeElement(this, options);

      observer.on('enter', function() {
        $this.trigger('morlockElementVisibleEnter');
      });
      observer.on('exit', function() {
        $this.trigger('morlockElementVisibleExit');
      });
    });
  };

  $.fn.morlockStickyElement = function(elementsSelector, options) {
    return $(this).each(function() {
      var container = this;
      $(container).find(elementsSelector).each(function() {
        $(this).data(
          'morlockStickyElementController',
          new StickyElementController(this, container, options)
        );
      });
    });
  };

  $.fn.morlockResponsiveImage = function(options) {
    return $(this).each(function() {
      var $this = $(this);

      var controller = ResponsiveImage.createFromElement(this, options);
      controller.on('load', function(img) {
        $this.trigger('morlockResponsiveImageLoaded', img);
      });

      $this.data(
        'morlockResponsiveImageController',
        controller
      );
    });
  };
}

module.exports = { defineJQueryPlugins: defineJQueryPlugins };
