// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../node_modules/text-balancer/text-balancer.js":[function(require,module,exports) {
var candidates = [];

// pass in a string of selectors to be balanced.
// if you didnt specify any, thats ok! We'll just
// balance anything with the balance-text class
var textBalancer = function (selectors) {

    if (!selectors) {
        candidates = document.querySelectorAll('.balance-text');
    } else {
        createSelectors(selectors);
    }

    balanceText();

    var rebalanceText = debounce(function() {
        balanceText();
    }, 100);

    window.addEventListener('resize', rebalanceText);
}

// this populates our candidates array with dom objects
// that need to be balanced
var createSelectors = function(selectors) {
    selectorArray = selectors.split(',');
    for (var i = 0; i < selectorArray.length; i += 1) {
        var currentSelectorElements = document.querySelectorAll(selectorArray[i].trim());

        for (var j = 0; j < currentSelectorElements.length; j += 1) {
            var currentSelectorElement = currentSelectorElements[j];
            candidates.push(currentSelectorElement);
        }
    }
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
var debounce = function (func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};


// HELPER FUNCTION -- initializes recursive binary search
var balanceText = function () {
    var element;
    var i;

    for (i = 0; i < candidates.length; i += 1) {
        element = candidates[i];

        if (textElementIsMultipleLines(element)) {
            element.style.maxWidth = '';
            squeezeContainer(element, element.clientHeight, 0, element.clientWidth);
        }

    }

}

// Make the element as narrow as possible while maintaining its current height (number of lines). Binary search.
var squeezeContainer = function (element, originalHeight, bottomRange, topRange) {
    var mid;
    if (bottomRange >= topRange) {
        element.style.maxWidth = topRange + 'px';
        return;
    }
    mid = (bottomRange + topRange) / 2;
    element.style.maxWidth = mid + 'px';

    if (element.clientHeight > originalHeight) {
        // we've squoze too far and element has spilled onto an additional line; recurse on wider range
        squeezeContainer(element, originalHeight, mid+1, topRange);
    } else {
        // element has not wrapped to another line; keep squeezing!
        squeezeContainer(element, originalHeight, bottomRange+1, mid);
    }
}

// function to see if a headline is multiple lines
// we only want to break if the headline is multiple lines
//
// We achieve this by turning the first word into a span
// and then we compare the height of that span to the height
// of the entire headline. If the headline is bigger than the
// span by 10px we balance the headline.
var textElementIsMultipleLines = function (element) {
    var firstWordHeight;
    var elementHeight;
    var HEIGHT_OFFSET;
    var elementWords;
    var firstWord;
    var ORIGINAL_ELEMENT_TEXT;

    ORIGINAL_ELEMENT_TEXT = element.innerHTML;

    // usually there is around a 5px discrepency between
    // the first word and the height of the whole headline
    // so subtract the height of the headline by 10 px and
    // we should be good
    HEIGHT_OFFSET = 10;

    // get all the words in the headline as
    // an array -- will include punctuation
    //
    // this is used to put the headline back together
    elementWords = element.innerHTML.split(' ');

    // make span for first word and give it an id
    // so we can access it in le dom
    firstWord = document.createElement('span');
    firstWord.id = 'element-first-word';
    firstWord.innerHTML = elementWords[0];

    // this is the entire headline
    // as an array except for first word
    //
    // we will append it to the headline after the span
    elementWords = elementWords.slice(1);

    // empty the headline and append the span to it
    element.innerHTML = '';
    element.appendChild(firstWord);

    // add the rest of the element back to it
    element.innerHTML += ' ' + elementWords.join(' ');

    // update the first word variable in the dom
    firstWord = document.getElementById('element-first-word');

    firstWordHeight = firstWord.offsetHeight;
    elementHeight = element.offsetHeight;
    // restore the original element text
    element.innerHTML = ORIGINAL_ELEMENT_TEXT;

    // compare the height of the element and the height of the first word
    return elementHeight - HEIGHT_OFFSET > firstWordHeight;

} // end headlineIsMultipleLines

exports.balanceText = textBalancer;
},{}],"../package.json":[function(require,module,exports) {
module.exports = {
  "name": "nypd-complaints",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "start": "parcel src/index.html --global script",
    "build": "parcel build src/index.html --global script --public-url . --no-content-hash",
    "test": "echo \"Error: no test specified\" && exit 1",
    "postinstall": "patch-package"
  },
  "devDependencies": {
    "cssnano": "^4.1.10",
    "eslint": "^7.0.0",
    "parcel-bundler": "^1.12.4",
    "patch-package": "^6.2.2",
    "posthtml-expressions": "^1.4.0",
    "posthtml-include": "^1.4.3",
    "sass": "^1.26.5"
  },
  "dependencies": {
    "intersection-observer": "^0.10.0",
    "text-balancer": "^1.0.5"
  },
  "browserslist": ["defaults"],
  "prettier": {
    "singleQuote": true,
    "trailingComma": "all",
    "arrowParens": "avoid"
  },
  "spectate": {
    "USE_NEWS_NAV": false,
    "USE_EYE_NAV": false,
    "USE_COVER_HED": false,
    "IS_EMBED": false,
    "DOC_URL": "https://docs.google.com/document/d/1fN1oAM94yM3A_uMkSyaBQkhpGSM6GcOvB4HAtgE312s/edit"
  }
};
},{}],"../node_modules/parcel-bundler/src/builtins/bundle-url.js":[function(require,module,exports) {
var bundleURL = null;

function getBundleURLCached() {
  if (!bundleURL) {
    bundleURL = getBundleURL();
  }

  return bundleURL;
}

function getBundleURL() {
  // Attempt to find the URL of the current script and use that as the base URL
  try {
    throw new Error();
  } catch (err) {
    var matches = ('' + err.stack).match(/(https?|file|ftp|chrome-extension|moz-extension):\/\/[^)\n]+/g);

    if (matches) {
      return getBaseURL(matches[0]);
    }
  }

  return '/';
}

function getBaseURL(url) {
  return ('' + url).replace(/^((?:https?|file|ftp|chrome-extension|moz-extension):\/\/.+)\/[^/]+$/, '$1') + '/';
}

exports.getBundleURL = getBundleURLCached;
exports.getBaseURL = getBaseURL;
},{}],"../node_modules/parcel-bundler/src/builtins/bundle-loader.js":[function(require,module,exports) {
var getBundleURL = require('./bundle-url').getBundleURL;

function loadBundlesLazy(bundles) {
  if (!Array.isArray(bundles)) {
    bundles = [bundles];
  }

  var id = bundles[bundles.length - 1];

  try {
    return Promise.resolve(require(id));
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return new LazyPromise(function (resolve, reject) {
        loadBundles(bundles.slice(0, -1)).then(function () {
          return require(id);
        }).then(resolve, reject);
      });
    }

    throw err;
  }
}

function loadBundles(bundles) {
  return Promise.all(bundles.map(loadBundle));
}

var bundleLoaders = {};

function registerBundleLoader(type, loader) {
  bundleLoaders[type] = loader;
}

module.exports = exports = loadBundlesLazy;
exports.load = loadBundles;
exports.register = registerBundleLoader;
var bundles = {};

function loadBundle(bundle) {
  var id;

  if (Array.isArray(bundle)) {
    id = bundle[1];
    bundle = bundle[0];
  }

  if (bundles[bundle]) {
    return bundles[bundle];
  }

  var type = (bundle.substring(bundle.lastIndexOf('.') + 1, bundle.length) || bundle).toLowerCase();
  var bundleLoader = bundleLoaders[type];

  if (bundleLoader) {
    return bundles[bundle] = bundleLoader(getBundleURL() + bundle).then(function (resolved) {
      if (resolved) {
        module.bundle.register(id, resolved);
      }

      return resolved;
    }).catch(function (e) {
      delete bundles[bundle];
      throw e;
    });
  }
}

function LazyPromise(executor) {
  this.executor = executor;
  this.promise = null;
}

LazyPromise.prototype.then = function (onSuccess, onError) {
  if (this.promise === null) this.promise = new Promise(this.executor);
  return this.promise.then(onSuccess, onError);
};

LazyPromise.prototype.catch = function (onError) {
  if (this.promise === null) this.promise = new Promise(this.executor);
  return this.promise.catch(onError);
};
},{"./bundle-url":"../node_modules/parcel-bundler/src/builtins/bundle-url.js"}],"scripts/page.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _package = require("../../package.json");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * Put all initializer scripts into this init() function
 */
function init() {
  // Your scripts here...
  // If an artboard is on the page, load the ai2html resizer
  if (document.querySelector('.g-artboard[data-min-width]')) {
    require("_bundle_loader")(require.resolve('./ai2html-resizer')).then(function (p) {
      return p.default();
    });
  }
}
/**
 * Replace the section#main node with the article content
 */


var isOnSpectatorPage = window.location.host === 'www.columbiaspectator.com';
var isOnContributorPage = window.location.pathname.indexOf('/contributors') === 0;
var SECTION_MAIN_SELECTOR = 'section#main';
var ARTICLE_SELECTOR = '.pb-f-article-article-body > .row > .col-xs-12 > .ab-article-body > .ab-article-content > article';
var COMMENTS_SELECTOR = '.pb-f-article-disqus-new'; // Replaces section#main with article

function hoistArticle() {
  // Store nodes of interest
  var sectionMain = document.querySelector(SECTION_MAIN_SELECTOR);
  var article = document.querySelector(ARTICLE_SELECTOR);
  var comments = document.querySelector(COMMENTS_SELECTOR); // Replace section#main with article

  sectionMain.parentNode.replaceChild(article, sectionMain); // Append comment section after article

  article.parentNode.insertBefore(comments, article.nextSibling); // Arc SSRs elements like links and meta tags in Spectate's index.html <head>
  // into a paragraph, which takes up unwanted space thanks to Arc's CSS

  var suspectParagraph = article.firstElementChild;

  if (_toConsumableArray(suspectParagraph.children).some(function (el) {
    return ['META', 'LINK'].includes(el.tagName);
  })) {
    suspectParagraph.style.margin = 0;
  }

  init();
} // Runs hoistArticle() and stops RAF when necessary elements exist.
// Stops after 5 seconds of trying.


var TRY_TIME = 5000;
var start = null;

function prepareHoist(timestamp) {
  if (document.body && document.querySelector(SECTION_MAIN_SELECTOR)) {
    hoistArticle();
    return;
  }

  if (timestamp - (start || (start = timestamp)) < TRY_TIME) {
    // If the body element isn't found, run ready() again at the next frame
    window.requestAnimationFrame(prepareHoist);
  } else {
    // After 5 seconds, stop requesting frames and just use window.onload
    console.log('Gave up replacing %s with article after %dms. Using window.onload.', SECTION_MAIN_SELECTOR, TRY_TIME);
    window.onload = hoistArticle;
  }
}

function _default() {
  // If IntersectionObserver and IntersectionObserverEntry are not natively
  // supported, load the polyfill.
  if (!('IntersectionObserver' in window) || !('IntersectionObserverEntry' in window) || !('isIntersecting' in window.IntersectionObserverEntry.prototype)) {
    require("_bundle_loader")(require.resolve('intersection-observer')).then();
  } // Replace main page section with this project if we are on a Spectator story
  // page and the project is not an embed


  if (isOnSpectatorPage && !isOnContributorPage && !_package.spectate.IS_EMBED) {
    window.requestAnimationFrame(prepareHoist);
  } else {
    init();
  }
}
/**
 * Disable stylesheets on contributor page. Stylesheets are included in the
 * server-side render and styles in files like news-ellipsis.scss
 * still override the site.
 */


if (isOnSpectatorPage && isOnContributorPage) {
  // Disable stylesheets
  document.querySelectorAll('.story-summary > .twolines > link').forEach(function (link) {
    return link.disabled = true;
  }); // Add styles to hide content preview

  var styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = '.story-summary > .twolines { display: none; }';
  document.head.appendChild(styleSheet);
}
},{"../../package.json":"../package.json","_bundle_loader":"../node_modules/parcel-bundler/src/builtins/bundle-loader.js","./ai2html-resizer":[["ai2html-resizer.156db1cd.js","scripts/ai2html-resizer.js"],"ai2html-resizer.156db1cd.js.map","scripts/ai2html-resizer.js"],"intersection-observer":[["intersection-observer.f8cf3ea1.js","../node_modules/intersection-observer/intersection-observer.js"],"intersection-observer.f8cf3ea1.js.map","../node_modules/intersection-observer/intersection-observer.js"]}],"scripts/utils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.intersectTop = intersectTop;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function intersectTop(_ref) {
  var node = _ref.node,
      onEnter = _ref.onEnter,
      onExit = _ref.onExit;
  var observer = new IntersectionObserver(function (_ref2) {
    var _ref3 = _slicedToArray(_ref2, 1),
        entry = _ref3[0];

    var isIntersecting = entry.isIntersecting,
        top = entry.boundingClientRect.top;

    if (!isIntersecting && top < 0) {
      // Enter at the top
      onEnter();
    } else if (isIntersecting && top < window.innerHeight / 2) {
      // Exit from the top
      onExit();
    }
  }, {
    threshold: 1
  });
  observer.observe(node);
}
},{}],"script.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hamburgerTrigger = hamburgerTrigger;

var _textBalancer = _interopRequireDefault(require("text-balancer"));

var _page = _interopRequireDefault(require("./scripts/page"));

var _utils = require("./scripts/utils");

var _package = require("../package.json");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Main page initiation
(0, _page.default)(); // Fade in navbar at scroll trigger

var navbar = document.getElementById('navbar');
var USE_NEWS_NAV = _package.spectate.USE_NEWS_NAV,
    USE_EYE_NAV = _package.spectate.USE_EYE_NAV,
    USE_COVER_HED = _package.spectate.USE_COVER_HED;

if (USE_NEWS_NAV || USE_EYE_NAV || USE_COVER_HED) {
  (0, _utils.intersectTop)({
    node: document.getElementById('headline'),
    onEnter: function onEnter() {
      navbar.classList.remove('only-eye-logo');
      navbar.classList.remove('hide-news-navbar');
    },
    onExit: function onExit() {
      navbar.classList.remove('show-nav-links');
      navbar.classList.add('only-eye-logo');
      navbar.classList.add('hide-news-navbar');
    }
  });
} // Mobile navbar hamburger trigger


function hamburgerTrigger() {
  navbar.classList.toggle('show-nav-links');
} // Text balance headline, deck, and image captions


if (window.innerWidth <= 460) {
  _textBalancer.default.balanceText('#headline, .deck, .image-caption-text');
}
},{"text-balancer":"../node_modules/text-balancer/text-balancer.js","./scripts/page":"scripts/page.js","./scripts/utils":"scripts/utils.js","../package.json":"../package.json"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "57532" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}],"../node_modules/parcel-bundler/src/builtins/loaders/browser/js-loader.js":[function(require,module,exports) {
module.exports = function loadJSBundle(bundle) {
  return new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.async = true;
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.src = bundle;

    script.onerror = function (e) {
      script.onerror = script.onload = null;
      reject(e);
    };

    script.onload = function () {
      script.onerror = script.onload = null;
      resolve();
    };

    document.getElementsByTagName('head')[0].appendChild(script);
  });
};
},{}],0:[function(require,module,exports) {
var b=require("../node_modules/parcel-bundler/src/builtins/bundle-loader.js");b.register("js",require("../node_modules/parcel-bundler/src/builtins/loaders/browser/js-loader.js"));
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js",0,"script.js"], "script")
//# sourceMappingURL=/script.75da7f30.js.map