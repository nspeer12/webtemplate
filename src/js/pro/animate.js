import { getjQuery, typeCheckConfig } from '../mdb/util/index';
import Data from '../mdb/dom/data';
import Manipulator from '../mdb/dom/manipulator';
import SelectorEngine from '../mdb/dom/selector-engine';
import EventHandler from '../mdb/dom/event-handler';

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'animation';
const DATA_KEY = 'mdb.animation';
const SELECTOR_EXPAND = '[data-toggle="animation"]';

const DefaultType = {
  animation: 'string',
  start: 'string',
  showOnLoad: 'boolean',
  onStart: '(null|function)',
  onEnd: '(null|function)',
  onHide: '(null|function)',
  onShow: '(null|function)',
  animateOnScroll: '(string)',
  windowHeight: 'number',
  offset: '(number|string)',
  delay: '(number|string)',
  duration: '(number|string)',
  reverse: 'boolean',
  interval: '(number|string)',
  repeat: '(number|boolean)',
  reset: 'boolean',
};

const Default = {
  animation: 'fade',
  start: 'onClick',
  showOnLoad: true,
  onStart: null,
  onEnd: null,
  onHide: null,
  onShow: null,
  animateOnScroll: 'once',
  windowHeight: 0,
  offset: 0,
  delay: 0,
  duration: 500,
  reverse: false,
  interval: 0,
  repeat: false,
  reset: false,
};

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Animate {
  constructor(element, options) {
    this._element = element;
    this._animateElement = this._getAnimateElement();
    this._isFirstScroll = true;
    this._repeatAnimateOnScroll = true;
    this._options = this._getConfig(options);

    if (this._element) {
      Data.setData(element, DATA_KEY, this);
    }
  }

  // Getters
  static get NAME() {
    return NAME;
  }

  // Public
  init() {
    this._init();
  }

  dispose() {
    Data.removeData(this._element, DATA_KEY);
    this._element = null;
  }

  // Private
  _init() {
    switch (this._options.start) {
      case 'onHover':
        this._bindHoverEvents();
        break;
      case 'onLoad':
        this._startAnimation();
        break;
      case 'onScroll':
        this._bindScrollEvents();
        break;
      default:
        this._bindClickEvents();
        break;
    }
    this._bindTriggerOnEndCallback();
    if (this._options.reset) {
      this._bindResetAnimationAfterFinish();
    }
  }

  _getAnimateElement() {
    const targetId = Manipulator.getDataAttribute(this._element, 'target');
    return targetId ? SelectorEngine.find(targetId)[0] : this._element;
  }

  _getConfig(config) {
    const dataAttributes = Manipulator.getDataAttributes(this._animateElement);

    config = {
      ...Default,
      ...dataAttributes,
      ...config,
    };

    typeCheckConfig(NAME, config, DefaultType);

    return config;
  }

  _animateOnScroll() {
    const elementOffsetTop = Manipulator.offset(this._animateElement).top;
    const elementHeight = this._animateElement.offsetHeight;
    const windowHeight = window.innerHeight;
    const shouldBeVisible =
      elementOffsetTop + this._options.offset <= windowHeight &&
      elementOffsetTop + this._options.offset + elementHeight >= 0;
    const isElementVisible = this._animateElement.style.visibility === 'visible';

    switch (true) {
      case shouldBeVisible && this._isFirstScroll:
        this._isFirstScroll = false;
        this._startAnimation();
        break;
      case !shouldBeVisible && this._isFirstScroll:
        this._isFirstScroll = false;
        this._hideAnimateElement();
        break;
      case shouldBeVisible && !isElementVisible && this._repeatAnimateOnScroll:
        if (this._options.animateOnScroll !== 'repeat') {
          this._repeatAnimateOnScroll = false;
        }
        this._callback(this._options.onShow);
        this._showAnimateElement();
        this._startAnimation();
        break;
      case !shouldBeVisible && isElementVisible && this._repeatAnimateOnScroll:
        this._hideAnimateElement();
        this._clearAnimationClass();
        this._callback(this._options.onHide);
        break;
      default:
        break;
    }
  }

  _addAnimatedClass() {
    Manipulator.addClass(this._animateElement, 'animation');
    Manipulator.addClass(this._animateElement, this._options.animation);
  }

  _clearAnimationClass() {
    this._animateElement.classList.remove(this._options.animation, 'animation');
  }

  _startAnimation() {
    this._callback(this._options.onStart);

    this._addAnimatedClass();

    if (this._options.repeat && !this._options.interval) {
      this._setAnimationRepeat();
    }

    if (this._options.reverse) {
      this._setAnimationReverse();
    }

    if (this._options.delay) {
      this._setAnimationDelay();
    }

    if (this._options.duration) {
      this._setAnimationDuration();
    }

    if (this._options.interval) {
      this._setAnimationInterval();
    }
  }

  _setAnimationReverse() {
    Manipulator.style(this._animateElement, {
      animationIterationCount: this._options.repeat === true ? 'infinite' : '2',
      animationDirection: 'alternate',
    });
  }

  _setAnimationDuration() {
    Manipulator.style(this._animateElement, {
      animationDuration: `${this._options.duration}ms`,
    });
  }

  _setAnimationDelay() {
    Manipulator.style(this._animateElement, {
      animationDelay: `${this._options.delay}ms`,
    });
  }

  _setAnimationRepeat() {
    Manipulator.style(this._animateElement, {
      animationIterationCount: this._options.repeat === true ? 'infinite' : this._options.repeat,
    });
  }

  _setAnimationInterval() {
    EventHandler.on(this._animateElement, 'animationend', () => {
      this._clearAnimationClass();
      setTimeout(() => {
        this._addAnimatedClass();
      }, this._options.interval);
    });
  }

  _hideAnimateElement() {
    Manipulator.style(this._animateElement, { visibility: 'hidden' });
  }

  _showAnimateElement() {
    Manipulator.style(this._animateElement, { visibility: 'visible' });
  }

  _bindResetAnimationAfterFinish() {
    EventHandler.on(this._animateElement, 'animationend', () => {
      this._clearAnimationClass();
    });
  }

  _bindTriggerOnEndCallback() {
    EventHandler.on(this._animateElement, 'animationend', () => {
      this._callback(this._options.onEnd);
    });
  }

  _bindScrollEvents() {
    if (!this._options.showOnLoad) {
      this._animateOnScroll();
    }

    EventHandler.on(window, 'scroll', () => {
      this._animateOnScroll();
    });
  }

  _bindClickEvents() {
    EventHandler.on(this._element, 'mousedown', () => {
      this._startAnimation();
    });
  }

  _bindHoverEvents() {
    EventHandler.one(this._element, 'mouseenter', () => {
      this._startAnimation();
    });
    EventHandler.one(this._animateElement, 'animationend', () => {
      // wait after bind hoverEvents to prevent animation looping
      setTimeout(() => {
        this._bindHoverEvents();
      }, 100);
    });
  }

  _callback(fn) {
    if (fn instanceof Function) {
      fn();
    }
  }

  // Static
  static autoInit(instance) {
    instance._init();
  }

  static jQueryInterface(options) {
    const animate = new Animate(this[0], options);
    animate.init();
  }

  static getInstance(element) {
    return Data.getData(element, DATA_KEY);
  }
}

/**
 * ------------------------------------------------------------------------
 * Data Api implementation - auto initialization
 * ------------------------------------------------------------------------
 */

SelectorEngine.find(SELECTOR_EXPAND).forEach((el) => {
  Animate.autoInit(new Animate(el));
});

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 * add .animate to jQuery only if jQuery is present
 */

const $ = getjQuery();

if ($) {
  const JQUERY_NO_CONFLICT = $.fn[NAME];
  $.fn[NAME] = Animate.jQueryInterface;
  $.fn[NAME].Constructor = Animate;
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Animate.jQueryInterface;
  };
}

export default Animate;
