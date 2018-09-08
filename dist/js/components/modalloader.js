'use strict';

// @todo keep ?
if (typeof window !== 'undefined') {
  window.addEventListener('error', () => {
    console.error('An error has occured! You can pen an issue here: https://github.com/quark-dev/Phonon-Framework/issues');
  });
} // Use available events


let availableEvents = ['mousedown', 'mousemove', 'mouseup'];
let touchScreen = false;

if (typeof window !== 'undefined') {
  if ('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch) {
    touchScreen = true;
    availableEvents = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
  }

  if (window.navigator.pointerEnabled) {
    availableEvents = ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'];
  } else if (window.navigator.msPointerEnabled) {
    availableEvents = ['MSPointerDown', 'MSPointerMove', 'MSPointerUp', 'MSPointerCancel'];
  }
}

const el = document.createElement('div');
const transitions = [{
  name: 'transition',
  start: 'transitionstart',
  end: 'transitionend'
}, {
  name: 'MozTransition',
  start: 'transitionstart',
  end: 'transitionend'
}, {
  name: 'msTransition',
  start: 'msTransitionStart',
  end: 'msTransitionEnd'
}, {
  name: 'WebkitTransition',
  start: 'webkitTransitionStart',
  end: 'webkitTransitionEnd'
}];
const animations = [{
  name: 'animation',
  start: 'animationstart',
  end: 'animationend'
}, {
  name: 'MozAnimation',
  start: 'animationstart',
  end: 'animationend'
}, {
  name: 'msAnimation',
  start: 'msAnimationStart',
  end: 'msAnimationEnd'
}, {
  name: 'WebkitAnimation',
  start: 'webkitAnimationStart',
  end: 'webkitAnimationEnd'
}];
const transitionStart = transitions.find(t => el.style[t.name] !== undefined).start;
const transitionEnd = transitions.find(t => el.style[t.name] !== undefined).end;
const animationStart = animations.find(t => el.style[t.name] !== undefined).start;
const animationEnd = animations.find(t => el.style[t.name] !== undefined).end;
var Event = {
  // touch screen support
  TOUCH_SCREEN: touchScreen,
  // network
  NETWORK_ONLINE: 'online',
  NETWORK_OFFLINE: 'offline',
  NETWORK_RECONNECTING: 'reconnecting',
  NETWORK_RECONNECTING_SUCCESS: 'reconnect.success',
  NETWORK_RECONNECTING_FAILURE: 'reconnect.failure',
  // user interface states
  SHOW: 'show',
  SHOWN: 'shown',
  HIDE: 'hide',
  HIDDEN: 'hidden',
  // hash
  HASH: 'hash',
  // touch, mouse and pointer events polyfill
  START: availableEvents[0],
  MOVE: availableEvents[1],
  END: availableEvents[2],
  CANCEL: typeof availableEvents[3] === 'undefined' ? null : availableEvents[3],
  // click
  CLICK: 'click',
  // transitions
  TRANSITION_START: transitionStart,
  TRANSITION_END: transitionEnd,
  // animations
  ANIMATION_START: animationStart,
  ANIMATION_END: animationEnd,
  // selectbox
  ITEM_SELECTED: 'itemSelected'
};

function dispatchWinDocEvent(eventName, moduleName, detail = {}) {
  const fullEventName = `${eventName}.ph.${moduleName}`;
  window.dispatchEvent(new CustomEvent(fullEventName, {
    detail
  }));
  document.dispatchEvent(new CustomEvent(fullEventName, {
    detail
  }));
}
function dispatchElementEvent(domElement, eventName, moduleName, detail = {}) {
  const fullEventName = `${eventName}.ph.${moduleName}`;
  domElement.dispatchEvent(new CustomEvent(fullEventName, {
    detail
  }));
}

function generateId() {
  return Math.random().toString(36).substr(2, 10);
}
/* eslint no-param-reassign: 0 */

function createJqueryPlugin($ = null, name, obj) {
  if (!$) {
    return;
  }

  const mainFn = function mainFn(options = {}) {
    const opts = options;

    if (this[0]) {
      opts.element = this[0];
    }

    return obj.DOMInterface(opts);
  };

  $.fn[name] = mainFn;
  $.fn[name].Constructor = obj;
  $.fn[name].noConflict = mainFn;
}
function sleep(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

const getAttribute = (first, second) => {
  if (first === '') {
    return `data-${second}`;
  }

  return `data-${first}-${second}`;
};

function setAttributesConfig(element, obj = {}, attrs, start = '') {
  const keys = Object.keys(obj);
  keys.forEach(key => {
    if (start === '' && attrs.indexOf(key) === -1) {
      // continue with next iteration
      return;
    }

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      let keyStart = key;

      if (start !== '') {
        keyStart = `${start}-${key}`;
      }

      setAttributesConfig(element, obj[key], attrs, keyStart);
      return;
    }

    const attr = getAttribute(start, key);
    element.setAttribute(attr, obj[key]);
  });
}
function getAttributesConfig(element, obj = {}, attrs, start = '') {
  const newObj = Object.assign({}, obj);
  const keys = Object.keys(obj);
  keys.forEach(key => {
    if (start === '' && attrs.indexOf(key) === -1) {
      // continue with next iteration
      return;
    }

    if (obj[key] !== null && obj[key].constructor === Object) {
      let keyStart = key;

      if (start !== '') {
        keyStart = `${start}-${key}`;
      }

      newObj[key] = getAttributesConfig(element, obj[key], attrs, keyStart);
      return;
    } // update value


    let value = obj[key]; // default value

    const type = typeof value;
    const attr = getAttribute(start, key);
    const attrValue = element.getAttribute(attr);

    if (attrValue !== null) {
      if (type === 'boolean') {
        // convert string to boolean
        value = attrValue === 'true';
      } else if (!Number.isNaN(attrValue)) {
        value = parseInt(attrValue, 10);
      } else {
        value = attrValue;
      }
    }

    newObj[key] = value;
  });
  return newObj;
}
const stack = [];
var ComponentManager = {
  add(component) {
    stack.push(component);
  },

  remove(component) {
    const index = stack.findIndex(c => Object.is(component, c));

    if (index > -1) {
      stack.splice(index, 1);
    }
  },

  closable(component) {
    return stack.length === 0 || Object.is(stack[stack.length - 1], component);
  }

};

/**
 * --------------------------------------------------------------------------
 * Licensed under MIT (https://github.com/quark-dev/Phonon-Framework/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */
/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Component {
  constructor(name, version, defaultOptions = {}, options = {}, optionAttrs = [], supportDynamicElement = false, addToStack = false) {
    this.name = name;
    this.version = version;
    this.options = options;
    Object.keys(defaultOptions).forEach(prop => {
      if (typeof this.options[prop] === 'undefined') {
        this.options[prop] = defaultOptions[prop];
      }
    });
    this.optionAttrs = optionAttrs;
    this.supportDynamicElement = supportDynamicElement;
    this.addToStack = addToStack;
    this.id = generateId();
    const checkElement = !this.supportDynamicElement || this.options.element !== null;

    if (typeof this.options.element === 'string') {
      this.options.element = document.querySelector(this.options.element);
    }

    if (checkElement && !this.options.element) {
      throw new Error(`${this.name}. The element is not a HTMLElement.`);
    }

    this.dynamicElement = this.options.element === null;
    this.registeredElements = [];

    if (!this.dynamicElement) {
      /**
       * if the element exists, we read the data attributes config
       * then we overwrite existing config keys defined in JavaScript, so that
       * we keep the following order
       * [1] default JavaScript configuration of the component
       * [2] Data attributes configuration
       * [3] JavaScript configuration
       */
      this.options = Object.assign(this.options, this.assignJsConfig(this.getAttributes(), this.options)); // then, set the new data attributes to the element

      this.setAttributes();
    }

    this.elementListener = event => this.onBeforeElementEvent(event);
  }

  assignJsConfig(attrConfig, jsConfig) {
    const config = attrConfig;
    this.optionAttrs.forEach(key => {
      if (typeof jsConfig[key] !== 'undefined') {
        config[key] = jsConfig[key];
      }
    });
    return config;
  }

  getVersion() {
    return this.version;
  }

  getElement() {
    return this.options.element;
  }

  getId() {
    return this.id;
  }

  registerElements(elements) {
    elements.forEach(element => this.registerElement(element));
  }

  registerElement(element) {
    element.target.addEventListener(element.event, this.elementListener);
    this.registeredElements.push(element);
  }

  unregisterElements() {
    this.registeredElements.forEach(element => {
      this.unregisterElement(element);
    });
  }

  unregisterElement(element) {
    const registeredElementIndex = this.registeredElements.findIndex(el => el.target === element.target && el.event === element.event);

    if (registeredElementIndex > -1) {
      element.target.removeEventListener(element.event, this.elementListener);
      this.registeredElements.splice(registeredElementIndex, 1);
    } else {
      console.error(`Warning! Unknown registered element: ${element.target} with event: ${element.event}.`);
    }
  }

  triggerEvent(eventName, detail = {}, objectEventOnly = false) {
    if (typeof eventName !== 'string') {
      throw new Error('The event name is not valid.');
    }

    if (this.addToStack) {
      if (eventName === Event.SHOW) {
        ComponentManager.add(this);
      } else if (eventName === Event.HIDE) {
        ComponentManager.remove(this);
      }
    } // event names can be with dot notation like reconnecting.success


    const eventNameObject = eventName.split('.').reduce((acc, current, index) => {
      if (index === 0) {
        return current;
      }

      return acc + current.charAt(0).toUpperCase() + current.slice(1);
    });
    const eventNameAlias = `on${eventNameObject.charAt(0).toUpperCase()}${eventNameObject.slice(1)}`; // object event

    if (typeof this.options[eventNameObject] === 'function') {
      this.options[eventNameObject].apply(this, [detail]);
    }

    if (typeof this.options[eventNameAlias] === 'function') {
      this.options[eventNameAlias].apply(this, [detail]);
    }

    if (objectEventOnly) {
      return;
    } // dom event


    if (this.options.element) {
      dispatchElementEvent(this.options.element, eventName, this.name, detail);
    } else {
      dispatchWinDocEvent(eventName, this.name, detail);
    }
  }

  setAttributes() {
    if (this.optionAttrs.length > 0) {
      setAttributesConfig(this.options.element, this.options, this.optionAttrs);
    }
  }

  getAttributes() {
    const options = Object.assign({}, this.options);
    return getAttributesConfig(this.options.element, options, this.optionAttrs);
  }
  /**
   * the preventClosable method manages concurrency between active components.
   * For example, if there is a shown off-canvas and modal, the last
   * shown component gains the processing priority
   */


  preventClosable() {
    return this.addToStack && !ComponentManager.closable(this);
  }

  onBeforeElementEvent(event) {
    if (this.preventClosable()) {
      return;
    }

    this.onElementEvent(event);
  }
  /**
   * @emits {Event} emit events registered by the component
   * @param {Event} event
   */


  onElementEvent() {
    /* eslint class-methods-use-this: 0 */
  }

  static identifier() {
    return this.name;
  }

  static DOMInterface(ComponentClass, options) {
    return new ComponentClass(options);
  }

}

/**
 * --------------------------------------------------------------------------
 * Licensed under MIT (https://github.com/quark-dev/Phonon-Framework/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

const Modal = ($ => {
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  const NAME = 'modal';
  const VERSION = '2.0.0';
  const BACKDROP_SELECTOR = 'modal-backdrop';
  const DEFAULT_PROPERTIES = {
    element: null,
    title: null,
    message: null,
    cancelable: true,
    type: null,
    cancelableKeyCodes: [27, // Escape
    13],
    buttons: [{
      event: 'confirm',
      text: 'Ok',
      dismiss: true,
      class: 'btn btn-primary'
    }]
  };
  const DATA_ATTRS_PROPERTIES = ['cancelable'];
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Modal extends Component {
    constructor(options = {}, template = null) {
      super(NAME, VERSION, DEFAULT_PROPERTIES, options, DATA_ATTRS_PROPERTIES, true, true);
      this.template = template || '' + '<div class="modal" tabindex="-1" role="modal">' + '<div class="modal-inner" role="document">' + '<div class="modal-content">' + '<div class="modal-header">' + '<h5 class="modal-title"></h5>' + '</div>' + '<div class="modal-body">' + '<p></p>' + '</div>' + '<div class="modal-footer">' + '</div>' + '</div>' + '</div>' + '</div>';

      if (this.dynamicElement) {
        this.build();
      }
    }

    build() {
      const builder = document.createElement('div');
      builder.innerHTML = this.template;
      this.options.element = builder.firstChild; // title

      if (this.options.title !== null) {
        this.options.element.querySelector('.modal-title').innerHTML = this.options.title;
      } // message


      if (this.options.message !== null) {
        this.options.element.querySelector('.modal-body').firstChild.innerHTML = this.options.message;
      } else {
        // remove paragraph node
        this.removeTextBody();
      } // buttons


      if (this.options.buttons !== null && Array.isArray(this.options.buttons)) {
        if (this.options.buttons.length > 0) {
          this.options.buttons.forEach(button => {
            this.options.element.querySelector('.modal-footer').appendChild(this.buildButton(button));
          });
        } else {
          this.removeFooter();
        }
      } else {
        this.removeFooter();
      }

      document.body.appendChild(this.options.element);
      this.setAttributes();
    }

    buildButton(buttonInfo = {}) {
      const button = document.createElement('button');
      button.setAttribute('type', 'button');
      button.setAttribute('class', buttonInfo.class || 'btn');
      button.setAttribute('data-event', buttonInfo.event);
      button.innerHTML = buttonInfo.text;

      if (buttonInfo.dismiss) {
        button.setAttribute('data-dismiss', NAME);
      }

      return button;
    }

    buildBackdrop() {
      const backdrop = document.createElement('div');
      backdrop.setAttribute('data-id', this.id);
      backdrop.classList.add(BACKDROP_SELECTOR);
      document.body.appendChild(backdrop);
    }

    getBackdrop() {
      return document.querySelector(`.${BACKDROP_SELECTOR}[data-id="${this.id}"]`);
    }

    removeTextBody() {
      this.options.element.querySelector('.modal-body').removeChild(this.options.element.querySelector('.modal-body').firstChild);
    }

    removeFooter() {
      const footer = this.options.element.querySelector('.modal-footer');
      this.options.element.querySelector('.modal-content').removeChild(footer);
    }

    center() {
      const computedStyle = window.getComputedStyle(this.options.element);
      const height = computedStyle.height.slice(0, computedStyle.height.length - 2);
      const top = window.innerHeight / 2 - height / 2;
      this.options.element.style.top = `${top}px`;
    }

    show() {
      return new Promise(async (resolve, reject) => {
        if (this.options.element === null) {
          // build and insert a new DOM element
          this.build();
        }

        if (this.options.element.classList.contains('show')) {
          reject(new Error('The modal is already active'));
          return;
        } // add a timeout so that the CSS animation works


        await sleep(20);
        this.triggerEvent(Event.SHOW);
        this.buildBackdrop(); // attach event

        this.attachEvents();

        const onShown = () => {
          this.triggerEvent(Event.SHOWN);
          this.options.element.removeEventListener(Event.TRANSITION_END, onShown);
          resolve();
        };

        this.options.element.addEventListener(Event.TRANSITION_END, onShown);
        this.options.element.classList.add('show');
        this.center();
      });
    }

    onElementEvent(event) {
      // keyboard event (escape and enter)
      if (event.type === 'keyup') {
        if (this.options.cancelableKeyCodes.find(k => k === event.keyCode)) {
          this.hide();
        }

        return;
      } // backdrop event


      if (event.type === Event.START) {
        // hide the modal
        this.hide();
        return;
      } // button event


      if (event.type === 'click') {
        const eventName = event.target.getAttribute('data-event');

        if (eventName) {
          this.triggerEvent(eventName);
        }

        if (event.target.getAttribute('data-dismiss') === NAME) {
          this.hide();
        }
      }
    }
    /**
     * Hides the modal
     * @returns {Promise} Promise object represents the completed animation
     */


    hide() {
      return new Promise((resolve, reject) => {
        if (!this.options.element.classList.contains('show')) {
          reject(new Error('The modal is not active'));
          return;
        }

        this.triggerEvent(Event.HIDE);
        this.detachEvents();
        this.options.element.classList.add('hide');
        this.options.element.classList.remove('show');
        const backdrop = this.getBackdrop();

        const onHidden = () => {
          document.body.removeChild(backdrop);
          this.options.element.classList.remove('hide');
          this.triggerEvent(Event.HIDDEN);
          backdrop.removeEventListener(Event.TRANSITION_END, onHidden); // remove generated modals from the DOM

          if (this.dynamicElement) {
            document.body.removeChild(this.options.element);
            this.options.element = null;
          }

          resolve();
        };

        backdrop.addEventListener(Event.TRANSITION_END, onHidden);
        backdrop.classList.add('fadeout');
      });
    }

    attachEvents() {
      const buttons = this.options.element.querySelectorAll('[data-dismiss], .modal-footer button');

      if (buttons) {
        Array.from(buttons).forEach(button => this.registerElement({
          target: button,
          event: 'click'
        }));
      } // add events if the modal is cancelable
      // which means the user can hide the modal
      // by pressing the ESC key or click on the backdrop


      if (this.options.cancelable) {
        const backdrop = this.getBackdrop();
        this.registerElement({
          target: backdrop,
          event: Event.START
        });
        this.registerElement({
          target: document,
          event: 'keyup'
        });
      }
    }

    detachEvents() {
      const buttons = this.options.element.querySelectorAll('[data-dismiss], .modal-footer button');

      if (buttons) {
        Array.from(buttons).forEach(button => this.unregisterElement({
          target: button,
          event: 'click'
        }));
      }

      if (this.options.cancelable) {
        const backdrop = this.getBackdrop();
        this.unregisterElement({
          target: backdrop,
          event: Event.START
        });
        this.unregisterElement({
          target: document,
          event: 'keyup'
        });
      }
    }

    static identifier() {
      return NAME;
    }

    static DOMInterface(options) {
      return super.DOMInterface(Modal, options);
    }

  }
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  createJqueryPlugin($, NAME, Modal);
  /**
   * ------------------------------------------------------------------------
   * DOM Api implementation
   * ------------------------------------------------------------------------
   */

  const components = [];
  const modals = Array.from(document.querySelectorAll(`.${NAME}`) || []);
  modals.forEach(element => {
    const config = getAttributesConfig(element, DEFAULT_PROPERTIES, DATA_ATTRS_PROPERTIES);
    config.element = element;
    components.push({
      element,
      modal: new Modal(config)
    });
  });
  document.addEventListener('click', event => {
    const dataToggleAttr = event.target.getAttribute('data-toggle');

    if (dataToggleAttr && dataToggleAttr === NAME) {
      const id = event.target.getAttribute('data-target');
      const element = document.querySelector(id);
      const component = components.find(c => c.element === element);

      if (!component) {
        return;
      } // remove the focus state of the trigger


      event.target.blur();
      component.modal.show();
    }
  });
  return Modal;
})(window.$ ? window.$ : null);

/**
 * --------------------------------------------------------------------------
 * Licensed under MIT (https://github.com/quark-dev/Phonon-Framework/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

const Loader = ($ => {
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  const NAME = 'loader';
  const VERSION = '2.0.0';
  const DEFAULT_PROPERTIES = {
    element: null,
    color: null,
    size: null
  };
  const DATA_ATTRS_PROPERTIES = [];
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Loader extends Component {
    constructor(options = {}) {
      super(NAME, VERSION, DEFAULT_PROPERTIES, options, DATA_ATTRS_PROPERTIES, false, false); // set color

      const loaderSpinner = this.getSpinner();

      if (typeof this.options.color === 'string' && !loaderSpinner.classList.contains(`color-${this.options.color}`)) {
        loaderSpinner.classList.add(`color-${this.options.color}`);
      }

      this.customSize = this.options.size !== null;
    }

    getClientSize() {
      if (!this.customSize) {
        const size = this.options.element.getBoundingClientRect();
        return size.height;
      }

      return this.options.size;
    }

    getSpinner() {
      return this.options.element.querySelector('.loader-spinner');
    }

    async show() {
      if (this.options.element.classList.contains('hide')) {
        this.options.element.classList.remove('hide');
      }

      this.triggerEvent(Event.SHOW);
      const size = this.getClientSize();
      this.options.size = size;

      if (this.customSize) {
        this.options.element.style.width = `${this.options.size}px`;
        this.options.element.style.height = `${this.options.size}px`;
        const loaderSpinner = this.getSpinner();
        loaderSpinner.style.width = `${this.options.size}px`;
        loaderSpinner.style.height = `${this.options.size}px`;
      }

      this.triggerEvent(Event.SHOWN);
      return true;
    }

    animate(startAnimation = true) {
      if (startAnimation) {
        this.show();
      } else {
        this.hide();
      }

      const loaderSpinner = this.getSpinner();

      if (startAnimation && !loaderSpinner.classList.contains('loader-spinner-animated')) {
        loaderSpinner.classList.add('loader-spinner-animated');
        return true;
      }

      if (!startAnimation && loaderSpinner.classList.contains('loader-spinner-animated')) {
        loaderSpinner.classList.remove('loader-spinner-animated');
      }

      return true;
    }

    async hide() {
      if (!this.options.element.classList.contains('hide')) {
        this.options.element.classList.add('hide');
      }

      this.triggerEvent(Event.HIDE);
      this.triggerEvent(Event.HIDDEN);
      return true;
    }

    static identifier() {
      return NAME;
    }

    static DOMInterface(options) {
      return super.DOMInterface(Loader, options);
    }

  }
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  createJqueryPlugin($, NAME, Loader);
  return Loader;
})(window.$ ? window.$ : null);

/**
 * --------------------------------------------------------------------------
 * Licensed under MIT (https://github.com/quark-dev/Phonon-Framework/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

const Loader$1 = ($ => {
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  const NAME = 'loader';
  const DEFAULT_PROPERTIES = {
    element: null,
    title: null,
    message: null,
    cancelable: true,
    type: NAME,
    buttons: []
  };
  const DATA_ATTRS_PROPERTIES = ['cancelable'];
  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class Loader$$1 extends Modal {
    constructor(options = {}) {
      const opts = options;
      const template = '' + '<div class="modal" tabindex="-1" role="modal">' + '<div class="modal-inner" role="document">' + '<div class="modal-content">' + '<div class="modal-header">' + '<h5 class="modal-title"></h5>' + '</div>' + '<div class="modal-body">' + '<p></p>' + '<div class="mx-auto text-center">' + '<div class="loader mx-auto d-block">' + '<div class="loader-spinner"></div>' + '</div>' + '</div>' + '</div>' + '<div class="modal-footer">' + '</div>' + '</div>' + '</div>' + '</div>';

      if (!Array.isArray(opts.buttons)) {
        opts.buttons = opts.cancelable ? DEFAULT_PROPERTIES.buttons : [];
      }

      super(opts, template);
      this.spinner = null;
    }

    async show() {
      super.show();
      this.spinner = new Loader({
        element: this.getElement().querySelector('.loader')
      });
      this.spinner.animate(true);
    }

    async hide() {
      super.hide();
      this.spinner.animate(false);
      this.spinner = null;
    }

    static identifier() {
      return NAME;
    }

    static DOMInterface(options) {
      return new Loader$$1(options);
    }

  }
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  createJqueryPlugin($, NAME, Loader$$1);
  /**
   * ------------------------------------------------------------------------
   * DOM Api implementation
   * ------------------------------------------------------------------------
   */

  const components = [];
  const modals = document.querySelectorAll(`.${Modal.identifier()}`);

  if (modals) {
    Array.from(modals).forEach(element => {
      const config = getAttributesConfig(element, DEFAULT_PROPERTIES, DATA_ATTRS_PROPERTIES);
      config.element = element;

      if (config.type === NAME) {
        // loader
        components.push(new Loader$$1(config));
      }
    });
  }

  document.addEventListener('click', event => {
    const dataToggleAttr = event.target.getAttribute('data-toggle');

    if (dataToggleAttr && dataToggleAttr === NAME) {
      const id = event.target.getAttribute('data-target');
      const element = document.querySelector(id);
      const component = components.find(c => c.element === element);

      if (!component) {
        return;
      } // remove the focus state of the trigger


      event.target.blur();
      component.modal.show();
    }
  });
  return Loader$$1;
})(window.$ ? window.$ : null);

module.exports = Loader$1;
//# sourceMappingURL=modalloader.js.map
