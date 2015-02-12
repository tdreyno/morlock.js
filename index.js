var ResizeController = require('./controllers/resize-controller');
var BreakpointController = require('./controllers/breakpoint-controller');
var ScrollController = require('./controllers/scroll-controller');
var ElementVisibleController = require('./controllers/element-visible-controller');
var ScrollPositionController = require('./controllers/scroll-position-controller');
var StickyElementController = require('./controllers/sticky-element-controller');
var ResponsiveImage = require('./core/responsive-image');
var API = require('./api');
var jQ = require('./jquery');

API.enableJQuery = function enableJQuery($) {
  $ || ($ = jQuery);

  if (!$) { return; }

  jQ.defineJQueryPlugins($);
};

module.exports = API;
module.exports.ResizeController = ResizeController;
module.exports.BreakpointController = BreakpointController;
module.exports.ResponsiveImage = ResponsiveImage;
module.exports.ScrollController = ScrollController;
module.exports.ElementVisibleController = ElementVisibleController;
module.exports.ScrollPositionController = ScrollPositionController;
module.exports.StickyElementController = StickyElementController;
