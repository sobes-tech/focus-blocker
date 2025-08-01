(() => {
  "use strict";

  const BLOCKED_EVENTS = new Set([
    "visibilitychange",
    "webkitvisibilitychange",
    "mozvisibilitychange",
    "msvisibilitychange",
    "blur",
    "focus",
    "focusin",
    "focusout",
  ]);

  const nativeAddEventListener = EventTarget.prototype.addEventListener;
  const nativeRemoveEventListener = EventTarget.prototype.removeEventListener;
  const nativeDispatchEvent = EventTarget.prototype.dispatchEvent;

  const eventInterceptor = function (method) {
    return function (type, ...args) {
      if (typeof type === "string" && BLOCKED_EVENTS.has(type.toLowerCase())) {
        return;
      }
      return method.apply(this, [type, ...args]);
    };
  };

  EventTarget.prototype.addEventListener = eventInterceptor(nativeAddEventListener);
  EventTarget.prototype.removeEventListener = eventInterceptor(nativeRemoveEventListener);

  EventTarget.prototype.dispatchEvent = function (event) {
    if (event && BLOCKED_EVENTS.has(event.type)) {
      return true;
    }
    return nativeDispatchEvent.call(this, event);
  };

  const visibilityProps = {
    hidden: false,
    mozHidden: false,
    webkitHidden: false,
    msHidden: false,
    visibilityState: "visible",
    mozVisibilityState: "visible",
    webkitVisibilityState: "visible",
    msVisibilityState: "visible",
  };

  for (const [prop, value] of Object.entries(visibilityProps)) {
    if (prop in document) {
      Object.defineProperty(document, prop, {
        get: () => value,
        set: () => {},
        configurable: true,
        enumerable: true,
      });
    }
  }

  document.hasFocus = () => true;
  window.focus = () => {};
  window.blur = () => {};

  const blockInlineHandler = (obj, prop) => {
    Object.defineProperty(obj, prop, {
      get: () => null,
      set: () => {},
      configurable: true,
    });
  };

  blockInlineHandler(window, "onblur");
  blockInlineHandler(window, "onfocus");
  blockInlineHandler(document, "onvisibilitychange");

  BLOCKED_EVENTS.forEach((eventType) => {
    nativeAddEventListener.call(
      window,
      eventType,
      (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
      },
      true
    );

    nativeAddEventListener.call(
      document,
      eventType,
      (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
      },
      true
    );
  });
})();
