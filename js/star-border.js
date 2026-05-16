/**
 * StarBorder — vanilla JS (без React)
 * Оборачивает элементы с атрибутом data-star-border
 */
(function () {
  "use strict";

  function initStarBorder(el) {
    if (el.classList.contains("star-border--ready")) return;

    var color = el.getAttribute("data-star-color") || "#d4a96a";
    var speed = el.getAttribute("data-star-speed") || "5s";
    var variant = el.getAttribute("data-star-variant") || "";

    el.style.setProperty("--star-color", color);
    el.style.setProperty("--star-speed", speed);

    var savedClasses = el.className;
    el.className = "star-border star-border--ready";
    if (variant) el.classList.add("star-border--" + variant);

    var bottom = document.createElement("span");
    bottom.className = "star-border__gradient star-border__gradient--bottom";
    bottom.setAttribute("aria-hidden", "true");

    var top = document.createElement("span");
    top.className = "star-border__gradient star-border__gradient--top";
    top.setAttribute("aria-hidden", "true");

    var inner = document.createElement("span");
    inner.className = "star-border__inner " + savedClasses;

    while (el.firstChild) {
      inner.appendChild(el.firstChild);
    }

    el.appendChild(bottom);
    el.appendChild(top);
    el.appendChild(inner);
  }

  function initAll() {
    document.querySelectorAll("[data-star-border]").forEach(initStarBorder);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
