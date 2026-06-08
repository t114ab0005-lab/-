const fs = require('fs');
const path = require('path');

const logBuffer = [];
function log(...args) {
  const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
  logBuffer.push(msg);
  console.log(msg);
}

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = String(value); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};

// Mock Document and DOM elements
const elements = {};
function createMockElement(id, tagName = 'div') {
  const el = {
    id,
    tagName,
    style: {},
    classList: {
      classes: new Set(),
      add(c) { this.classes.add(c); },
      remove(c) { this.classes.delete(c); },
      contains(c) { return this.classes.has(c); }
    },
    attributes: {},
    setAttribute(name, val) { this.attributes[name] = val; },
    getAttribute(name) { return this.attributes[name] || null; },
    children: [],
    appendChild(child) { this.children.push(child); },
    addEventListener(event, handler) {
      if (!this.listeners) this.listeners = {};
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(handler);
    },
    click() {
      if (this.listeners && this.listeners.click) {
        this.listeners.click.forEach(h => h({ preventDefault: () => {} }));
      }
    },
    dispatchEvent(event) {
      if (this.listeners && this.listeners[event.type]) {
        this.listeners[event.type].forEach(h => h(event));
      }
    }
  };
  Object.defineProperty(el, 'innerText', {
    get() { return this._innerText || ''; },
    set(val) { this._innerText = val; }
  });
  Object.defineProperty(el, 'innerHTML', {
    get() { return this._innerHTML || ''; },
    set(val) { this._innerHTML = val; }
  });
  elements[id] = el;
  return el;
}

// Global mocks
global.localStorage = localStorageMock;
global.window = {
  Event: class Event { constructor(type) { this.type = type; } },
  addEventListener() {}
};

const docListeners = {};
global.document = {
  getElementById(id) {
    if (elements[id]) return elements[id];
    return createMockElement(id);
  },
  querySelectorAll(selector) {
    if (selector === '.nav-item') {
      return [
        createMockElement('nav-lobby'),
        createMockElement('nav-quick-match'),
        createMockElement('nav-post-demo'),
        createMockElement('nav-profile')
      ];
    }
    if (selector === '.tab-btn') {
      const btn1 = createMockElement('tab-history');
      btn1.setAttribute('data-subtab', 'history');
      const btn2 = createMockElement('tab-active');
      btn2.setAttribute('data-subtab', 'active');
      return [btn1, btn2];
    }
    if (selector === '.category-tag') return [];
    if (selector === '.calendar-cell') return [];
    if (selector === '.match-tag-btn') return [];
    if (selector === '.modal-overlay') return [];
    if (selector === '.modal-close') return [];
    return [];
  },
  createElement(tag) {
    return createMockElement('new-' + Math.random(), tag);
  },
  addEventListener(event, handler) {
    if (!docListeners[event]) docListeners[event] = [];
    docListeners[event].push(handler);
  },
  dispatchEvent(event) {
    if (docListeners[event.type]) {
      docListeners[event.type].forEach(h => h(event));
    }
  }
};

// Load app.js
const appJsPath = path.join(__dirname, 'app.js');
const appCode = fs.readFileSync(appJsPath, 'utf8');

// Run app.js code
try {
  eval(appCode);
  log("Loaded app.js successfully!");

  // Dispatch DOMContentLoaded
  const readyEvent = { type: 'DOMContentLoaded' };
  docListeners['DOMContentLoaded'].forEach(h => h(readyEvent));
  log("Triggered DOMContentLoaded.");

  // Log in as guest
  const guestBtn = elements['guest-login-btn'];
  guestBtn.click();
  log("Guest login simulation complete. isLoggedIn:", state.isLoggedIn);

  // Accept a task (task ID 1)
  handleAcceptTask(1);
  log("Accepted task 1. Task 1 status:", state.tasks.find(t => t.id === 1).status);

  // Navigate to profile active tab
  navigateToProfileTab('active');
  log("Navigated to profile active tab. ActiveProfileTab:", state.activeProfileTab);

  // Check output of history container
  const container = elements['profile-history-container'];
  log("History container HTML:\n", container.innerHTML);
} catch (err) {
  log("Test execution failed:", err.stack || err);
}

// Write buffer to file
fs.writeFileSync(path.join(__dirname, 'test-out.log'), logBuffer.join('\n'), 'utf8');
log("Finished writing to test-out.log");
process.exit(0);
