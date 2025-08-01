(() => {
  "use strict";

  const DEFAULT_BLOCKED_EVENTS = [
    "visibilitychange",
    "webkitvisibilitychange",
    "mozvisibilitychange",
    "msvisibilitychange",
    "blur",
    "focus",
    "focusin",
    "focusout",
  ];

  let BLOCKED_EVENTS = new Set(DEFAULT_BLOCKED_EVENTS);
  let isEnabled = false;

  // Check if current domain is whitelisted
  function checkWhitelist(whitelistDomains) {
    const currentHost = window.location.hostname;
    
    return whitelistDomains.some(pattern => {
      // Convert wildcard pattern to regex
      const regexPattern = pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(currentHost);
    });
  }

  window.addEventListener("message", (event) => {
    if (event.source === window && event.data && event.data.type === "FOCUS_BLOCKER_SETTINGS") {
      BLOCKED_EVENTS = new Set(event.data.blockedEvents);
      isEnabled = event.data.isEnabled;
      
      if (isEnabled) {
        updateBlockedHandlers();
      } else {
        removeBlockedHandlers();
      }
    }
  });

  const nativeAddEventListener = EventTarget.prototype.addEventListener;
  const nativeRemoveEventListener = EventTarget.prototype.removeEventListener;
  const nativeDispatchEvent = EventTarget.prototype.dispatchEvent;

  const eventInterceptor = function (method) {
    return function (type, ...args) {
      if (isEnabled && typeof type === "string" && BLOCKED_EVENTS.has(type.toLowerCase())) {
        return;
      }
      return method.apply(this, [type, ...args]);
    };
  };

  EventTarget.prototype.addEventListener = eventInterceptor(nativeAddEventListener);
  EventTarget.prototype.removeEventListener = eventInterceptor(nativeRemoveEventListener);

  EventTarget.prototype.dispatchEvent = function (event) {
    if (isEnabled && event && BLOCKED_EVENTS.has(event.type)) {
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
      const originalDescriptor = Object.getOwnPropertyDescriptor(document, prop);
      Object.defineProperty(document, prop, {
        get: () => isEnabled ? value : (originalDescriptor && originalDescriptor.get ? originalDescriptor.get.call(document) : undefined),
        set: () => {},
        configurable: true,
        enumerable: true,
      });
    }
  }

  const originalHasFocus = document.hasFocus;
  const originalWindowFocus = window.focus;
  const originalWindowBlur = window.blur;
  
  document.hasFocus = () => isEnabled ? true : originalHasFocus.call(document);
  window.focus = function() { if (!isEnabled) originalWindowFocus.call(this); };
  window.blur = function() { if (!isEnabled) originalWindowBlur.call(this); };

  const blockInlineHandler = (obj, prop) => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(obj, prop);
    Object.defineProperty(obj, prop, {
      get: () => isEnabled ? null : (originalDescriptor && originalDescriptor.get ? originalDescriptor.get.call(obj) : undefined),
      set: (value) => { if (!isEnabled && originalDescriptor && originalDescriptor.set) originalDescriptor.set.call(obj, value); },
      configurable: true,
    });
  };

  blockInlineHandler(window, "onblur");
  blockInlineHandler(window, "onfocus");
  blockInlineHandler(document, "onvisibilitychange");

  const blockedHandlers = new Map();

  const updateBlockedHandlers = () => {
    removeBlockedHandlers();

    if (!isEnabled) return;

    BLOCKED_EVENTS.forEach((eventType) => {
      const windowHandler = (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
      };
      const documentHandler = (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
      };

      nativeAddEventListener.call(window, eventType, windowHandler, true);
      nativeAddEventListener.call(document, eventType, documentHandler, true);

      blockedHandlers.set(`window:${eventType}`, windowHandler);
      blockedHandlers.set(`document:${eventType}`, documentHandler);
    });
  };

  const removeBlockedHandlers = () => {
    blockedHandlers.forEach((handler, key) => {
      const [target, eventType] = key.split(":");
      const targetObj = target === "window" ? window : document;
      nativeRemoveEventListener.call(targetObj, eventType, handler, true);
    });
    blockedHandlers.clear();
  };

  // Don't initialize until we receive settings
})();
