'use strict';

var ResizeController = require('morlock/controllers/resize-controller');
var BreakpointController = require('morlock/controllers/breakpoint-controller');
var ScrollController = require('morlock/controllers/scroll-controller');
var ElementVisibleController = require('morlock/controllers/element-visible-controller');
var ScrollPositionController = require('morlock/controllers/scroll-position-controller');
var StickyElementController = require('morlock/controllers/sticky-element-controller');
var ResponsiveImage = require('morlock/core/responsive-image');
var API = require('morlock/api');
var { defineJQueryPlugins } = require('morlock/jquery');

API.enableJQuery = function enableJQuery($) {
  $ || ($ = jQuery);

  if (!$) { return; }

  defineJQueryPlugins($);
};

window.morlock = API;
window.ResizeController = ResizeController;
window.BreakpointController = BreakpointController;
window.ResponsiveImage = ResponsiveImage;
window.ScrollController = ScrollController;
window.ElementVisibleController = ElementVisibleController;
window.ScrollPositionController = ScrollPositionController;
window.StickyElementController = StickyElementController;
