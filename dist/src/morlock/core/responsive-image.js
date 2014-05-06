define("morlock/core/responsive-image", 
  ["morlock/core/util","morlock/core/dom","morlock/controllers/element-visible-controller","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var map = __dependency1__.map;
    var mapObject = __dependency1__.mapObject;
    var sortBy = __dependency1__.sortBy;
    var parseInteger = __dependency1__.parseInteger;
    var set = __dependency1__.set;
    var flip = __dependency1__.flip;
    var getOption = __dependency1__.getOption;
    var functionBind = __dependency1__.functionBind;
    var testMQ = __dependency2__.testMQ;
    var setStyle = __dependency2__.setStyle;
    var ElementVisibleController = __dependency3__["default"];

    /**
     * Ghetto Record implementation.
     */
    function ResponsiveImage() {
      if (!(this instanceof ResponsiveImage)) {
        return new ResponsiveImage();
      }

      this.element = null;
      this.loadedSizes = {};
      this.knownSizes = [];
      this.currentBreakpoint = null;
      this.src = null;
      this.isFlexible = false;
      this.hasRetina = false;
      this.preserveAspectRatio = false;
      this.knownDimensions = null;
      this.hasLoaded = false;
    }

    function create(imageMap) {
      var image = new ResponsiveImage();
      image.getPath = getOption(imageMap.getPath, getPath);

      mapObject(flip(set(image)), imageMap);

      if (image.knownDimensions && image.preserveAspectRatio) {
        applyAspectRatioPadding(image);
      }

      if (imageMap.lazyLoad) {
        imageMap.observer = new ElementVisibleController(imageMap.element);

        imageMap.observer.on('enter', function onEnter_() {
          imageMap.observer.off('enter', onEnter_);

          image.lazyLoad = false;
          update(image, true);
        });
      }

      return image;
    }

    function createFromElement(element, imageMap) {
      imageMap || (imageMap = {});
      imageMap.element = element;
      imageMap.src = element.getAttribute('data-src');

      imageMap.lazyLoad = element.getAttribute('data-lazyload') === 'true';
      imageMap.isFlexible = element.getAttribute('data-isFlexible') !== 'false';
      imageMap.hasRetina = (element.getAttribute('data-hasRetina') === 'true') && (window.devicePixelRatio > 1.5);
      imageMap.preserveAspectRatio = element.getAttribute('data-preserveAspectRatio') === 'true';

      var dimensionsString = element.getAttribute('data-knownDimensions');
      if (dimensionsString && (dimensionsString !== 'false')) {
        imageMap.knownDimensions = [
          parseInteger(dimensionsString.split('x')[0]),
          parseInteger(dimensionsString.split('x')[1])
        ];
      }

      imageMap.knownSizes = getBreakpointSizes(imageMap.element);

      if (imageMap.knownDimensions && imageMap.preserveAspectRatio) {
        applyAspectRatioPadding(imageMap);
      }

      return create(imageMap);
    }

    /**
     * Set a padding percentage which allows the image to scale proportionally.
     * @param {ResponsiveImage} image The image data.
     */
    function applyAspectRatioPadding(image) {
      var ratioPadding = (image.knownDimensions[1] / image.knownDimensions[0]) * 100.0;
      setStyle(image.element, 'paddingBottom', ratioPadding + '%');
    }

    /**
     * Parse the breakpoints from the `data-breakpoints` attribute.
     * @param {Element} element The source element.
     * @return {Array} Sorted array of known sizes.
     */
    function getBreakpointSizes(element) {
      var breakpointString = element.getAttribute('data-breakpoints');

      var knownSizes = map(function(s) {
        return parseInteger(s);
      }, breakpointString ? breakpointString.split(',') : []);

      if (knownSizes.length <= 0) {
        return [0];
      } else {
        return sortBy(knownSizes, function sortAscending(a, b) {
          return b - a;
        });
      }
    }

    /**
     * Detect the current breakpoint and update the element if necessary.
     */
    function update(image) {
      if (image.lazyLoad) {
        return;
      }

      var foundBreakpoint;

      for (var i = 0; i < image.knownSizes.length; i++) {
        var s = image.knownSizes[i];
        var mq = 'only screen and (max-width: ' + s + 'px)';
        if (i === 0) {
          mq = 'only screen';
        }

        if (testMQ(mq)) {
          foundBreakpoint = s;
        } else {
          break;
        }
      }

      if (foundBreakpoint !== image.currentBreakpoint) {
        image.currentBreakpoint = foundBreakpoint;
        loadImageForBreakpoint(image, image.currentBreakpoint);
      }
    }

    function recalculateOffsets(image) {
      if (!image.lazyLoad) {
        return;
      }

      imageMap.observer.recalculateOffsets();
    }

    __exports__.recalculateOffsets = recalculateOffsets;/**
     * Load the requested image.
     * @param {ResponsiveImage} image The ResponsiveImage instance.
     * @param {String} s Filename.
     */
    function loadImageForBreakpoint(image, s) {
      var alreadyLoaded = image.loadedSizes[s];

      if ('undefined' !== typeof alreadyLoaded) {
        setImage(image, alreadyLoaded);
      } else {
        var img = new Image();
        img.onload = function() {
          image.loadedSizes[s] = img;
          setImage(image, img);
        };

        // If requesting retina fails
        img.onerror = function() {
          if (image.hasRetina) {
            img.src = image.getPath(image, s, false);
          }
        };

        img.src = image.getPath(image, s, image.hasRetina);
      }
    }

    /**
     * Set the image on the element.
     * @param {Element} img Image element.
     */
    function setImage(image, img) {
      if (!image.hasLoaded) {
        image.hasLoaded = true;

        setTimeout(function() {
          image.element.className += ' loaded';
        }, 100);
      }

      if (image.element.tagName.toLowerCase() === 'img') {
        return setImageTag(image, img);
      } else {
        return setDivTag(image, img);
      }
    }

    /**
     * Set the image on the img element.
     * @param {Element} img Image element.
     */
    function setImageTag(image, img) {
      image.element.src = img.src;
    }

    /**
     * Set the image on the div element.
     * @param {Element} img Image element.
     */
    function setDivTag(image, img) {
      var setElemStyle = setStyle(image.element);
      setElemStyle('backgroundImage', 'url(' + img.src + ')');

      if (image.preserveAspectRatio) {
        var w, h;

        if (image.knownDimensions) {
          w = image.knownDimensions[0];
          h = image.knownDimensions[1];
        } else {
          w = img.width;
          h = img.height;
        }

        setElemStyle('backgroundSize', 'cover');

        if (image.isFlexible) {
          setElemStyle('paddingBottom', ((h / w) * 100.0) + '%');
        } else {
          setElemStyle('width', w + 'px');
          setElemStyle('height', h + 'px');
        }
      }
    }

    /**
     * Get the path for the image given the current breakpoints and
     * browser features.
     * @param {ResponsiveImage} image The image data.
     * @param {String} s Requested path.
     * @param {boolean} wantsRetina If we should look for retina.
     * @return {String} The resulting path.
     */
    function getPath(image, s, wantsRetina) {
      if (s === 0) { return image.src; }

      var parts = image.src.split('.');
      var ext = parts.pop();

      return parts.join('.') + '-' + s + (wantsRetina ? '@2x' : '') + '.' + ext;
    }

    __exports__.create = create;
    __exports__.createFromElement = createFromElement;
    __exports__.update = update;
  });