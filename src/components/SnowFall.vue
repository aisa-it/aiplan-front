<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';

/* eslint-disable */

// Guard against SSR / non-browser environments
let snowStorm;

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  /**
   * DHTML Snowstorm
   * Original source: http://schillmania.com/projects/snowstorm/
   * Adapted for Vue component usage (no autoStart, pointer-events disabled).
   */
  // eslint-disable-next-line no-var
  snowStorm = (function (window, document) {
    // --- common properties ---

    const storm = {};

    storm.autoStart = false; // disabled; we control start() from Vue
    storm.excludeMobile = true;
    storm.flakesMax = 128;
    storm.flakesMaxActive = 64;
    storm.animationInterval = 50;
    storm.useGPU = true;
    storm.className = null;
    storm.excludeMobile = true;
    storm.flakeBottom = null;
    storm.followMouse = false;
    storm.snowColor = '#BAC4D5';
    storm.snowCharacter = '&bull;';
    storm.snowStick = true;
    storm.targetElement = null;
    storm.useMeltEffect = true;
    storm.useTwinkleEffect = false;
    storm.usePositionFixed = false;
    storm.usePixelPosition = false;

    // --- less-used bits ---

    storm.freezeOnBlur = true;
    storm.flakeLeftOffset = 0;
    storm.flakeRightOffset = 0;
    storm.flakeWidth = 8;
    storm.flakeHeight = 8;
    storm.vMaxX = 5;
    storm.vMaxY = 4;
    // Make snow global over all layout elements
    storm.zIndex = 1000000;

    // --- "No user-serviceable parts inside" past this point ---

    let features;
    const isIE = navigator.userAgent.match(/msie/i);
    const isIE6 = navigator.userAgent.match(/msie 6/i);
    const isMobile = navigator.userAgent.match(/mobile|opera m(ob|in)/i);
    const isBackCompatIE = isIE && document.compatMode === 'BackCompat';
    const noFixed = isBackCompatIE || isIE6;
    let screenX = null;
    let screenX2 = null;
    let screenY = null;
    let scrollY = null;
    let docHeight = null;
    let vRndX = null;
    let vRndY = null;
    let windOffset = 1;
    const windMultiplier = 2;
    const flakeTypes = 6;
    let fixedForEverything = false;
    let targetElementIsRelative = false;
    const opacitySupported = (function () {
      try {
        document.createElement('div').style.opacity = '0.5';
      } catch (e) {
        return false;
      }
      return true;
    })();
    let didInit = false;
    let docFrag = document.createDocumentFragment();

    features = (function () {
      let getAnimationFrame;

      function timeoutShim(callback) {
        window.setTimeout(callback, 1000 / (storm.animationInterval || 20));
      }

      const _animationFrame =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        timeoutShim;

      getAnimationFrame = _animationFrame
        ? function () {
            return _animationFrame.apply(window, arguments);
          }
        : null;

      let testDiv;

      testDiv = document.createElement('div');

      function has(prop) {
        const result = testDiv.style[prop];
        return result !== undefined ? prop : null;
      }

      const localFeatures = {
        transform: {
          ie: has('-ms-transform'),
          moz: has('MozTransform'),
          opera: has('OTransform'),
          webkit: has('webkitTransform'),
          w3: has('transform'),
          prop: null,
        },
        getAnimationFrame,
      };

      localFeatures.transform.prop =
        localFeatures.transform.w3 ||
        localFeatures.transform.moz ||
        localFeatures.transform.webkit ||
        localFeatures.transform.ie ||
        localFeatures.transform.opera;

      testDiv = null;

      return localFeatures;
    })();

    storm.timer = null;
    storm.flakes = [];
    storm.disabled = false;
    storm.active = false;
    storm.meltFrameCount = 20;
    storm.meltFrames = [];

    storm.setXY = function (o, x, y) {
      if (!o) {
        return false;
      }

      if (storm.usePixelPosition || targetElementIsRelative) {
        o.style.left = x - storm.flakeWidth + 'px';
        o.style.top = y - storm.flakeHeight + 'px';
      } else if (noFixed) {
        o.style.right = 100 - (x / screenX) * 100 + '%';
        o.style.top = Math.min(y, docHeight - storm.flakeHeight) + 'px';
      } else if (!storm.flakeBottom) {
        o.style.right = 100 - (x / screenX) * 100 + '%';
        o.style.bottom = 100 - (y / screenY) * 100 + '%';
      } else {
        o.style.right = 100 - (x / screenX) * 100 + '%';
        o.style.top = Math.min(y, docHeight - storm.flakeHeight) + 'px';
      }

      return true;
    };

    storm.events = (function () {
      const old = !window.addEventListener && window.attachEvent;
      const slice = Array.prototype.slice;
      const evt = {
        add: old ? 'attachEvent' : 'addEventListener',
        remove: old ? 'detachEvent' : 'removeEventListener',
      };

      function getArgs(oArgs) {
        const args = slice.call(oArgs);
        const len = args.length;
        if (old) {
          args[1] = 'on' + args[1];
          if (len > 3) {
            args.pop();
          }
        } else if (len === 3) {
          args.push(false);
        }
        return args;
      }

      function apply(args, sType) {
        const element = args.shift();
        const method = [evt[sType]];
        if (old) {
          element[method](args[0], args[1]);
        } else {
          element[method].apply(element, args);
        }
      }

      function addEvent() {
        apply(getArgs(arguments), 'add');
      }

      function removeEvent() {
        apply(getArgs(arguments), 'remove');
      }

      return {
        add: addEvent,
        remove: removeEvent,
      };
    })();

    function rnd(n, min) {
      if (isNaN(min)) {
        min = 0;
      }
      return Math.random() * n + min;
    }

    storm.randomizeWind = function () {
      vRndX = 0;
      vRndY = 1.5;
    };

    storm.scrollHandler = function () {
      scrollY = storm.flakeBottom
        ? 0
        : parseInt(
            window.scrollY ||
              document.documentElement.scrollTop ||
              (noFixed ? document.body.scrollTop : 0),
            10,
          );
      if (isNaN(scrollY)) {
        scrollY = 0;
      }
      if (!fixedForEverything && !storm.flakeBottom && storm.flakes) {
        for (let i = 0; i < storm.flakes.length; i++) {
          if (storm.flakes[i].active === 0) {
            storm.flakes[i].stick();
          }
        }
      }
    };

    storm.resizeHandler = function () {
      if (window.innerWidth || window.innerHeight) {
        screenX = window.innerWidth - 16 - storm.flakeRightOffset;
        screenY = storm.flakeBottom || window.innerHeight;
      } else {
        screenX =
          (document.documentElement.clientWidth ||
            document.body.clientWidth ||
            document.body.scrollWidth) -
          (isIE ? 0 : 8) -
          storm.flakeRightOffset;
        screenY =
          storm.flakeBottom ||
          document.documentElement.clientHeight ||
          document.body.clientHeight ||
          document.body.scrollHeight;
      }
      docHeight = document.body.offsetHeight;
      screenX2 = parseInt(screenX / 2, 10);
    };

    storm.resizeHandlerAlt = function () {
      screenX = storm.targetElement.offsetWidth - storm.flakeRightOffset;
      screenY = storm.flakeBottom || storm.targetElement.offsetHeight;
      screenX2 = parseInt(screenX / 2, 10);
      docHeight = document.body.offsetHeight;
    };

    storm.freeze = function () {
      if (!storm.disabled) {
        storm.disabled = 1;
      } else {
        return false;
      }
      storm.timer = null;
      return true;
    };

    storm.resume = function () {
      if (storm.disabled) {
        storm.disabled = 0;
      } else {
        return false;
      }
      storm.timerInit();
      return true;
    };

    storm.stop = function () {
      storm.freeze();
      for (let i = 0; i < storm.flakes.length; i++) {
        storm.flakes[i].o.style.display = 'none';
      }
      storm.events.remove(window, 'scroll', storm.scrollHandler);
      storm.events.remove(window, 'resize', storm.resizeHandler);
      if (storm.freezeOnBlur) {
        if (isIE) {
          storm.events.remove(document, 'focusout', storm.freeze);
          storm.events.remove(document, 'focusin', storm.resume);
        } else {
          storm.events.remove(window, 'blur', storm.freeze);
          storm.events.remove(window, 'focus', storm.resume);
        }
      }
    };

    storm.show = function () {
      for (let i = 0; i < storm.flakes.length; i++) {
        storm.flakes[i].o.style.display = 'block';
      }
    };

    storm.SnowFlake = function (type, x, y) {
      const s = this;
      this.type = type;
      this.x = x || parseInt(rnd(screenX - 20), 10);
      this.y = !isNaN(y) ? y : -rnd(screenY) - 12;
      this.vX = null;
      this.vY = null;
      this.vAmp = 1;
      this.melting = false;
      this.meltFrameCount = storm.meltFrameCount;
      this.meltFrames = storm.meltFrames;
      this.meltFrame = 0;
      this.twinkleFrame = 0;
      this.active = 1;
      this.fontSize = 10 + (this.type / 5) * 10;
      this.o = document.createElement('div');
      this.o.innerHTML = storm.snowCharacter;
      if (storm.className) {
        this.o.setAttribute('class', storm.className);
      }
      this.o.style.color = storm.snowColor;
      this.o.style.position = fixedForEverything ? 'fixed' : 'absolute';
      if (storm.useGPU && features.transform.prop) {
        this.o.style[features.transform.prop] = 'translate3d(0px, 0px, 0px)';
      }
      this.o.style.width = storm.flakeWidth + 'px';
      this.o.style.height = storm.flakeHeight + 'px';
      this.o.style.fontFamily = 'arial,verdana';
      this.o.style.cursor = 'default';
      // Do not block interactions with UI under the snow
      this.o.style.pointerEvents = 'none';
      this.o.style.overflow = 'hidden';
      this.o.style.fontWeight = 'normal';
      this.o.style.zIndex = storm.zIndex;
      docFrag.appendChild(this.o);

      this.refresh = function () {
        if (isNaN(s.x) || isNaN(s.y)) {
          return false;
        }
        storm.setXY(s.o, s.x, s.y);
        return true;
      };

      this.stick = function () {
        if (
          noFixed ||
          (storm.targetElement !== document.documentElement &&
            storm.targetElement !== document.body)
        ) {
          s.o.style.top = screenY + scrollY - storm.flakeHeight + 'px';
        } else if (storm.flakeBottom) {
          s.o.style.top = storm.flakeBottom + 'px';
        } else {
          s.o.style.display = 'none';
          s.o.style.bottom = '0%';
          s.o.style.position = 'fixed';
          s.o.style.display = 'block';
        }
      };

      this.vCheck = function () {
        if (s.vX >= 0 && s.vX < 0.2) {
          s.vX = 0.2;
        } else if (s.vX < 0 && s.vX > -0.2) {
          s.vX = -0.2;
        }
        if (s.vY >= 0 && s.vY < 0.2) {
          s.vY = 0.2;
        }
      };

      this.move = function () {
        const vX = s.vX;
        s.x += vX;
        s.y += s.vY;

        if (s.x >= screenX || screenX - s.x < storm.flakeWidth) {
          s.x = 0;
        } else if (vX < 0 && s.x - storm.flakeLeftOffset < -storm.flakeWidth) {
          s.x = screenX - storm.flakeWidth - 1;
        }
        s.refresh();
        const yDiff = screenY + scrollY - s.y + storm.flakeHeight;
        if (yDiff < storm.flakeHeight) {
          s.active = 0;
          if (storm.snowStick) {
            s.stick();
          } else {
            s.recycle();
          }
        } else {
          if (
            storm.useMeltEffect &&
            s.active &&
            s.type < 3 &&
            !s.melting &&
            Math.random() > 0.998
          ) {
            s.melting = true;
            s.melt();
          }
          if (storm.useTwinkleEffect) {
            if (s.twinkleFrame < 0) {
              if (Math.random() > 0.97) {
                s.twinkleFrame = parseInt(Math.random() * 8, 10);
              }
            } else {
              s.twinkleFrame--;
              if (!opacitySupported) {
                s.o.style.visibility =
                  s.twinkleFrame && s.twinkleFrame % 2 === 0
                    ? 'hidden'
                    : 'visible';
              } else {
                s.o.style.opacity =
                  s.twinkleFrame && s.twinkleFrame % 2 === 0 ? 0 : 1;
              }
            }
          }
        }
      };

      this.animate = function () {
        s.move();
      };

      this.setVelocities = function () {
        s.vX = vRndX;
        s.vY = vRndY;
      };

      this.setOpacity = function (o, opacity) {
        if (!opacitySupported) {
          return false;
        }
        o.style.opacity = opacity;
        return true;
      };

      this.melt = function () {
        if (!storm.useMeltEffect || !s.melting) {
          s.recycle();
        } else if (s.meltFrame < s.meltFrameCount) {
          s.setOpacity(s.o, s.meltFrames[s.meltFrame]);
          s.o.style.fontSize =
            s.fontSize - s.fontSize * (s.meltFrame / s.meltFrameCount) + 'px';
          s.o.style.lineHeight =
            storm.flakeHeight +
            2 +
            storm.flakeHeight * 0.75 * (s.meltFrame / s.meltFrameCount) +
            'px';
          s.meltFrame++;
        } else {
          s.recycle();
        }
      };

      this.recycle = function () {
        s.o.style.display = 'none';
        s.o.style.position = fixedForEverything ? 'fixed' : 'absolute';
        s.o.style.bottom = 'auto';
        s.setVelocities();
        s.vCheck();
        s.meltFrame = 0;
        s.melting = false;
        s.setOpacity(s.o, 1);
        s.o.style.padding = '0px';
        s.o.style.margin = '0px';
        s.o.style.fontSize = s.fontSize + 'px';
        s.o.style.lineHeight = storm.flakeHeight + 2 + 'px';
        s.o.style.textAlign = 'center';
        s.o.style.verticalAlign = 'baseline';
        s.x = parseInt(rnd(screenX - storm.flakeWidth - 20), 10);
        s.y = parseInt(rnd(screenY) * -1, 10) - storm.flakeHeight;
        s.refresh();
        s.o.style.display = 'block';
        s.active = 1;
      };

      this.recycle();
      this.refresh();
    };

    storm.snow = function () {
      let active = 0;
      let flake = null;
      for (let i = 0, j = storm.flakes.length; i < j; i++) {
        if (storm.flakes[i].active === 1) {
          storm.flakes[i].move();
          active++;
        }
        if (storm.flakes[i].melting) {
          storm.flakes[i].melt();
        }
      }
      if (active < storm.flakesMaxActive) {
        flake = storm.flakes[parseInt(rnd(storm.flakes.length), 10)];
        if (flake && flake.active === 0) {
          flake.melting = true;
        }
      }
      if (storm.timer) {
        features.getAnimationFrame(storm.snow);
      }
    };

    storm.mouseMove = function (e) {
      if (!storm.followMouse) {
        return true;
      }
      let x = parseInt(e.clientX, 10);
      if (x < screenX2) {
        windOffset = -windMultiplier + (x / screenX2) * windMultiplier;
      } else {
        x -= screenX2;
        windOffset = (x / screenX2) * windMultiplier;
      }
      return true;
    };

    storm.createSnow = function (limit, allowInactive) {
      for (let i = 0; i < limit; i++) {
        storm.flakes[storm.flakes.length] = new storm.SnowFlake(
          parseInt(rnd(flakeTypes), 10),
        );
        if (allowInactive || i > storm.flakesMaxActive) {
          storm.flakes[storm.flakes.length - 1].active = -1;
        }
      }
      storm.targetElement.appendChild(docFrag);
      docFrag = document.createDocumentFragment();
    };

    storm.timerInit = function () {
      storm.timer = true;
      storm.snow();
    };

    storm.init = function () {
      for (let i = 0; i < storm.meltFrameCount; i++) {
        storm.meltFrames.push(1 - i / storm.meltFrameCount);
      }
      storm.randomizeWind();
      storm.createSnow(storm.flakesMax);
      storm.events.add(window, 'resize', storm.resizeHandler);
      storm.events.add(window, 'scroll', storm.scrollHandler);
      if (storm.freezeOnBlur) {
        if (isIE) {
          storm.events.add(document, 'focusout', storm.freeze);
          storm.events.add(document, 'focusin', storm.resume);
        } else {
          storm.events.add(window, 'blur', storm.freeze);
          storm.events.add(window, 'focus', storm.resume);
        }
      }
      storm.resizeHandler();
      storm.scrollHandler();
      if (storm.followMouse) {
        storm.events.add(isIE ? document : window, 'mousemove', storm.mouseMove);
      }
      storm.animationInterval = Math.max(20, storm.animationInterval);
      storm.timerInit();
    };

    storm.start = function (bFromOnLoad) {
      if (!didInit) {
        didInit = true;
      } else if (bFromOnLoad) {
        return true;
      }
      if (typeof storm.targetElement === 'string') {
        const targetID = storm.targetElement;
        storm.targetElement = document.getElementById(targetID);
        if (!storm.targetElement) {
          throw new Error(
            'Snowstorm: Unable to get targetElement "' + targetID + '"',
          );
        }
      }
      if (!storm.targetElement) {
        storm.targetElement = document.body || document.documentElement;
      }
      if (
        storm.targetElement !== document.documentElement &&
        storm.targetElement !== document.body
      ) {
        storm.resizeHandler = storm.resizeHandlerAlt;
        storm.usePixelPosition = true;
      }
      storm.resizeHandler();
      storm.usePositionFixed =
        storm.usePositionFixed && !noFixed && !storm.flakeBottom;
      if (window.getComputedStyle) {
        try {
          targetElementIsRelative =
            window
              .getComputedStyle(storm.targetElement, null)
              .getPropertyValue('position') === 'relative';
        } catch (e) {
          targetElementIsRelative = false;
        }
      }
      fixedForEverything = storm.usePositionFixed;
      if (screenX && screenY && !storm.disabled) {
        storm.init();
        storm.active = true;
      }
      return true;
    };

    return storm;
  })(window, document);
}

const route = useRoute();

const restartSnow = () => {
  if (!snowStorm) return;

  snowStorm.stop();
  snowStorm.disabled = false;
  snowStorm.flakes = [];
  snowStorm.meltFrames = [];
  snowStorm.timer = null;
  snowStorm.active = false;

  snowStorm.start();
};

const handleVisibilityChange = () => {
  if (document.hidden) {
    // Полностью останавливаем анимацию
    snowStorm.stop();
  } else {
    // При возврате на вкладку перезапускаем
    restartSnow();
  }
};

onMounted(() => {
  restartSnow();

  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);

  if (!snowStorm) return;

  try {
    snowStorm.stop();
  } catch (e) {
    // ignore
  }
});

watch(
  () => route.fullPath,
  () => {
    restartSnow();
  },
);
</script>
