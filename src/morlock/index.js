import ResizeController from 'morlock/controllers/resize-controller';
import BreakpointController from 'morlock/controllers/breakpoint-controller';
import ScrollController from 'morlock/controllers/scroll-controller';
import ElementVisibleController from 'morlock/controllers/element-visible-controller';
import ScrollPositionController from 'morlock/controllers/scroll-position-controller';
import StickyElementController from 'morlock/controllers/sticky-element-controller';
import * as ResponsiveImage from 'morlock/core/responsive-image';
import API from 'morlock/api';
import { defineJQueryPlugins } from 'morlock/jquery';

API.enableJQuery = function enableJQuery($) {
  $ || ($ = jQuery);

  if (!$) { return; }

  defineJQueryPlugins($);
};

export default API;

export {
  ResizeController,
  BreakpointController,
  ResponsiveImage,
  ScrollController,
  ElementVisibleController,
  ScrollPositionController,
  StickyElementController
};
