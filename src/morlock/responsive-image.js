/**
 * An image which responds to specific breakpoints.
 * @constructor
 * @param {Element} element The element.
 */
function ResponsiveImage(element) {
  this.element_ = element;

  this.type_ = (this.element_.tagName.toLowerCase() === 'img') ? 'img' : 'div';
  this.src_ = this.element_.getAttribute('data-src');

  this.hasWebp_ = this.element_.getAttribute('data-hasWebp') === 'true';
  this.isFlexible_ = !(this.element_.getAttribute('data-isFlexible') === 'false');
  this.hasRetina_ = this.element_.getAttribute('data-hasRetina') === 'true';
  this.hasRetina_ = this.hasRetina_ && (window.devicePixelRatio > 1.5);
  this.preserveAspectRatio_ = this.element_.getAttribute('data-preserveAspectRatio') === 'true';

  var dimensionsString = this.element_.getAttribute('data-knownDimensions');
  if (dimensionsString && (dimensionsString !== 'false')) {
    this.knownDimensions_ = [
      parseInt(dimensionsString.split('x')[0], 10),
      parseInt(dimensionsString.split('x')[1], 10)
    ];

    if (this.preserveAspectRatio_) {
      this.element_.style.paddingBottom = ((this.knownDimensions_[1] / this.knownDimensions_[0]) * 100.0) + '%';
    }
  }
  this.loadedSizes_ = {};
  this.getSizes_();

  this.currentBreakpoint_ = null;

  ResponsiveImage.knownInstances = ResponsiveImage.knownInstances || [];
  ResponsiveImage.knownInstances.push(this);
};

/**
 * Parse the breakpoints from the `data-breakpoints` attribute.
 * @private
 */
ResponsiveImage.prototype.getSizes_ = function getSizes_() {
  var breakpointString = this.element_.getAttribute('data-breakpoints');

  this.knownSizes_ = breakpointString ? breakpointString.split(',') : [];

  for (var i = 0; i < this.knownSizes_.length; i++) {
    this.knownSizes_[i] = parseInt(this.knownSizes_[i], 10);
  }

  this.knownSizes_.sort(function(a, b) { return b - a; });

  if (this.knownSizes_.length <= 0) {
    this.knownSizes_ = [0];
  }
};

/**
 * Detect the current breakpoint and update the element if necessary.
 */
ResponsiveImage.prototype.update = function update() {
  var foundBreakpoint;

  for (var i = 0; i < this.knownSizes_.length; i++) {
    var s = this.knownSizes_[i];
    var mq = 'only screen and (max-width: ' + s + 'px)';
    if (i === 0) {
      mq = 'only screen';
    }

    if (Modernizr['mq'](mq)) {
      foundBreakpoint = s;
    } else {
      break;
    }
  }

  if (foundBreakpoint !== this.currentBreakpoint_) {
    this.currentBreakpoint_ = foundBreakpoint;
    this.load_(this.currentBreakpoint_);
  }
};

/**
 * Load the requested image.
 * @private
 * @param {String} s Filename.
 */
ResponsiveImage.prototype.load_ = function load_(s) {
  var alreadyLoaded = this.loadedSizes_[s];

  if ('undefined' !== typeof alreadyLoaded) {
    this.setImage_(alreadyLoaded);
  } else {
    var self = this;
    var img = new Image();
    img.onload = function() {
      self.loadedSizes_[s] = img;
      self.setImage_(img);
    };

    img.src = this.getPath_(s);
  }
};

/**
 * Set the image on the element.
 * @private
 * @param {Element} img Image element.
 */
ResponsiveImage.prototype.setImage_ = function setImage_(img) {
  if (this.type_ === 'img') {
    this.setImageTag_(img);
  } else {
    this.setDivTag_(img);
  }
};

/**
 * Set the image on the img element.
 * @private
 * @param {Element} img Image element.
 */
ResponsiveImage.prototype.setImageTag_ = function setImageTag_(img) {
  this.element_.src = img.src;
};

/**
 * Set the image on the div element.
 * @private
 * @param {Element} img Image element.
 */
ResponsiveImage.prototype.setDivTag_ = function setDivTag_(img) {
  this.element_.style.backgroundImage = 'url(' + img.src + ')';

  if (this.preserveAspectRatio_) {
    var sizeVar = Modernizr['prefixed']('backgroundSize');
    this.element_.style[sizeVar] = 'cover';

    var w, h;

    if (this.knownDimensions_) {
      w = this.knownDimensions_[0];
      h = this.knownDimensions_[1];
    } else {
      w = img.width;
      h = img.height;
    }

    if (this.isFlexible_) {
      this.element_.style.paddingBottom = ((h / w) * 100.0) + '%';
    } else {
      this.element_.style.width = w + 'px';
      this.element_.style.height = h + 'px';
    }
  }
};

/**
 * Get the path for the image given the current breakpoints and
 * browser features.
 * @private
 * @param {String} s Requested path.
 * @return {String} The resulting path.
 */
ResponsiveImage.prototype.getPath_ = function getPath_(s) {
  if (s === 0) { return this.src_; }

  var parts = this.src_.split('.');
  var currentExt = parts.pop();
  var ext = (this.hasWebp_ && Modernizr['webp']) ? 'webp' : currentExt;

  return parts.join('.') + '-' + s + (this.hasRetina_ ? '@2x' : '') + '.' + ext;
};

/**
 * Detect all responsive images on the page and initialize them.
 * @param {String} clsName The class name to select images with.
 * @param {Element} parent Parent element.
 */
ResponsiveImage.initAll = function initAll(clsName, parent) {
  clsName = clsName || 'js-responsive-image';
  var imgs = (parent || document).getElementsByClassName(clsName);

  for (var i = 0; i < imgs.length; i++) {
    new ResponsiveImage(imgs[i]);
  }
};

/**
 * Update all known responsive images with new breakpoint information.
 */
ResponsiveImage.updateAll = function updateAll() {
  for (var i = 0; i < ResponsiveImage.knownInstances.length; i++) {
    ResponsiveImage.knownInstances[i].update();
  }
};

export { ResponsiveImage }
