/**
 * DecryptedText — vanilla JS port (без React / Motion)
 * Эффект «расшифровки» текста посимвольно.
 */
(function (global) {
  "use strict";

  function getAvailableChars(text, characters, useOriginalOnly) {
    if (useOriginalOnly) {
      var set = {};
      for (var i = 0; i < text.length; i++) {
        var c = text[i];
        if (c !== " ") set[c] = true;
      }
      return Object.keys(set);
    }
    return characters.split("");
  }

  function shuffleText(original, revealed, pool) {
    return original
      .split("")
      .map(function (char, i) {
        if (char === " ") return " ";
        if (char === "\n") return "\n";
        if (revealed.has(i)) return original[i];
        return pool[Math.floor(Math.random() * pool.length)];
      })
      .join("");
  }

  function computeOrder(len, direction) {
    var order = [];
    var i;
    if (len <= 0) return order;
    if (direction === "end") {
      for (i = len - 1; i >= 0; i--) order.push(i);
      return order;
    }
    if (direction === "center") {
      var middle = Math.floor(len / 2);
      var offset = 0;
      while (order.length < len) {
        if (offset % 2 === 0) {
          var idx = middle + offset / 2;
          if (idx >= 0 && idx < len) order.push(idx);
        } else {
          idx = middle - Math.ceil(offset / 2);
          if (idx >= 0 && idx < len) order.push(idx);
        }
        offset++;
      }
      return order.slice(0, len);
    }
    for (i = 0; i < len; i++) order.push(i);
    return order;
  }

  function DecryptedText(element, options) {
    this.el = element;
    options = options || {};

    this.text =
      options.text ||
      element.getAttribute("data-decrypt-text") ||
      element.textContent.trim();
    this.accent =
      options.accent || element.getAttribute("data-accent") || "";
    this.speed =
      options.speed ||
      parseInt(element.getAttribute("data-speed"), 10) ||
      45;
    this.sequential = options.sequential !== false;
    this.revealDirection =
      options.revealDirection ||
      element.getAttribute("data-reveal-direction") ||
      "start";
    this.useOriginalCharsOnly = options.useOriginalCharsOnly !== false;
    this.characters =
      options.characters ||
      "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзйклмнопрстуфхцчшщъыьэюяABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
    this.animateOn =
      options.animateOn || element.getAttribute("data-animate-on") || "view";
    this.onComplete = options.onComplete || null;

    this.pool = getAvailableChars(
      this.text,
      this.characters,
      this.useOriginalCharsOnly
    );
    this.revealed = new Set();
    this.isAnimating = false;
    this.hasAnimated = false;
    this.intervalId = null;
    this.order = [];
    this.pointer = 0;

    this.el.setAttribute("aria-label", this.text);
    this.render();
  }

  /* Показать начальное «зашифрованное» состояние */
  DecryptedText.prototype.prepare = function () {
    this.revealed = new Set();
    this.render();
  };

  DecryptedText.prototype.render = function () {
    var self = this;
    var display = shuffleText(this.text, this.revealed, this.pool);
    var accentStart = this.accent ? this.text.indexOf(this.accent) : -1;
    var accentEnd =
      accentStart >= 0 ? accentStart + this.accent.length : -1;

    this.el.textContent = "";

    var visible = document.createElement("span");
    visible.setAttribute("aria-hidden", "true");

    display.split("").forEach(function (char, index) {
      var span = document.createElement("span");
      var isRevealed = self.revealed.has(index);

      span.textContent = char;

      if (char === " ") {
        span.className = "decrypt-text__space";
      } else {
        span.className = isRevealed
          ? "decrypt-text__revealed"
          : "decrypt-text__encrypted";
      }

      if (
        isRevealed &&
        accentStart >= 0 &&
        index >= accentStart &&
        index < accentEnd
      ) {
        span.classList.add("decrypt-text__accent");
      }

      visible.appendChild(span);
    });

    this.el.appendChild(visible);
  };

  DecryptedText.prototype.tick = function () {
    var self = this;

    if (this.sequential) {
      if (this.pointer < this.order.length) {
        var idx = this.order[this.pointer++];
        this.revealed.add(idx);
        this.render();
        return;
      }
      this.stop();
      if (this.onComplete) this.onComplete(this.text);
      return;
    }

    this.pointer++;
    if (this.pointer >= 12) {
      this.revealed = new Set();
      for (var i = 0; i < this.text.length; i++) this.revealed.add(i);
      this.render();
      this.stop();
      if (this.onComplete) this.onComplete(this.text);
    } else {
      this.render();
    }
  };

  DecryptedText.prototype.start = function () {
    if (this.isAnimating || this.hasAnimated) return;
    this.hasAnimated = true;
    this.isAnimating = true;
    this.revealed = new Set();
    this.pointer = 0;
    this.order = computeOrder(this.text.length, this.revealDirection);

    var self = this;
    this.render();

    this.intervalId = setInterval(function () {
      self.tick();
    }, this.speed);
  };

  DecryptedText.prototype.stop = function () {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isAnimating = false;
  };

  DecryptedText.prototype.showPlain = function () {
    this.stop();
    this.revealed = new Set();
    for (var i = 0; i < this.text.length; i++) this.revealed.add(i);
    this.render();
  };

  DecryptedText.prototype.observe = function () {
    var self = this;

    if (!("IntersectionObserver" in global)) {
      self.start();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !self.hasAnimated) {
            self.start();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(this.el);
  };

  DecryptedText.prototype.init = function () {
    this.prepare();

    if (this.animateOn === "view") {
      this.observe();
    } else if (this.animateOn === "load") {
      /* start вызывается из main.js после is-ready */
    } else {
      this.showPlain();
    }
  };

  DecryptedText.create = function (selector, options) {
    var nodes = document.querySelectorAll(selector);
    var instances = [];
    nodes.forEach(function (node) {
      var instance = new DecryptedText(node, options);
      instance.init();
      instances.push(instance);
    });
    return instances;
  };

  global.DecryptedText = DecryptedText;
})(window);
