define("morlock/core/responsive-image", 
  ["morlock/core/util","morlock/controllers/element-visible-controller","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var map = __dependency1__.map;
    var mapObject = __dependency1__.mapObject;
    var partial = __dependency1__.partial;
    var sortBy = __dependency1__.sortBy;
    var parseInteger = __dependency1__.parseInteger;
    var set = __dependency1__.set;
    var flip = __dependency1__.flip;
    var testMQ = __dependency1__.testMQ;
    var ElementVisibleController = __dependency2__["default"];

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
      this.hasWebp = false;
      this.isFlexible = false;
      this.hasRetina = false;
      this.preserveAspectRatio = false;
      this.knownDimensions = null;
      this.hasLoaded = false;
    }

    function create(imageMap) {
      var image = new ResponsiveImage();

      mapObject(flip(partial(set, image)), imageMap);

      if (image.knownDimensions && image.preserveAspectRatio) {
        applyAspectRatioPadding(image);
      }

      if (imageMap.lazyLoad) {
        var observer = new ElementVisibleController(imageMap.element);
        function onEnter() {
          observer.off('enter', onEnter);

          image.lazyLoad = false;
          update(image, true);
        };
        observer.on('enter', onEnter);
      }

      return image;
    }

    function createFromElement(element) {
      var imageMap = {};
      imageMap.element = element;
      imageMap.src = element.getAttribute('data-src');

      imageMap.lazyLoad = element.getAttribute('data-lazyload') === 'true';
      imageMap.hasWebp = element.getAttribute('data-hasWebp') === 'true';
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
      image.element.style.paddingBottom = ((image.knownDimensions[1] / image.knownDimensions[0]) * 100.0) + '%';
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

    /**
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

        img.src = getPath(image, s);
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
      image.element.style.backgroundImage = 'url(' + img.src + ')';

      if (image.preserveAspectRatio) {
        var sizeVar = Modernizr['prefixed']('backgroundSize');
        image.element.style[sizeVar] = 'cover';

        var w, h;

        if (image.knownDimensions) {
          w = image.knownDimensions[0];
          h = image.knownDimensions[1];
        } else {
          w = img.width;
          h = img.height;
        }

        if (image.isFlexible) {
          image.element.style.paddingBottom = ((h / w) * 100.0) + '%';
        } else {
          image.element.style.width = w + 'px';
          image.element.style.height = h + 'px';
        }
      }
    }

    /**
     * Get the path for the image given the current breakpoints and
     * browser features.
     * @param {String} s Requested path.
     * @return {String} The resulting path.
     */
    function getPath(image, s) {
      if (s === 0) { return image.src; }

      var parts = image.src.split('.');
      var currentExt = parts.pop();
      var ext = (image.hasWebp && Modernizr['webp']) ? 'webp' : currentExt;

      return parts.join('.') + '-' + s + (image.hasRetina ? '@2x' : '') + '.' + ext;
    }

    __exports__.create = create;
    __exports__.createFromElement = createFromElement;
    __exports__.update = update;
  });