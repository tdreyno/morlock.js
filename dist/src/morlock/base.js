define("morlock/base", 
  ["morlock/controllers/resize-controller","morlock/controllers/breakpoint-controller","morlock/controllers/scroll-controller","morlock/controllers/element-visible-controller","morlock/controllers/scroll-position-controller","morlock/controllers/sticky-element-controller","morlock/core/responsive-image","morlock/api","morlock/jquery","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __exports__) {
    "use strict";
    var ResizeController = __dependency1__["default"];
    var BreakpointController = __dependency2__["default"];
    var ScrollController = __dependency3__["default"];
    var ElementVisibleController = __dependency4__["default"];
    var ScrollPositionController = __dependency5__["default"];
    var StickyElementController = __dependency6__["default"];
    var ResponsiveImage = __dependency7__;
    var API = __dependency8__["default"];
    var defineJQueryPlugins = __dependency9__.defineJQueryPlugins;

    API.enableJQuery = function enableJQuery($) {
      $ || ($ = jQuery);

      if (!$) { return; }

      defineJQueryPlugins($);
    };

    __exports__.API = API;
    __exports__.ResizeController = ResizeController;
    __exports__.BreakpointController = BreakpointController;
    __exports__.ResponsiveImage = ResponsiveImage;
    __exports__.ScrollController = ScrollController;
    __exports__.ElementVisibleController = ElementVisibleController;
    __exports__.ScrollPositionController = ScrollPositionController;
    __exports__.StickyElementController = StickyElementController;
  });