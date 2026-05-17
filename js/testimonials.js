(function () {
  "use strict";

  var stack = document.querySelector("[data-testimonials-stack]");
  if (!stack) return;

  var cards = Array.prototype.slice.call(stack.querySelectorAll(".testimonial-card"));
  if (cards.length < 2) return;

  var positions = ["front", "middle", "back"];
  var dragStartX = 0;
  var dragX = 0;
  var didDrag = false;
  var activeCard = null;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SWIPE_THRESHOLD = 150;

  var positionStyles = {
    front: { rotate: -6, offset: 0, z: 3 },
    middle: { rotate: 0, offset: 33, z: 2 },
    back: { rotate: 6, offset: 66, z: 1 },
  };

  function applyPositions() {
    cards.forEach(function (card, index) {
      var pos = positions[index] || "back";
      var style = positionStyles[pos] || positionStyles.back;

      card.classList.remove(
        "testimonial-card--front",
        "testimonial-card--middle",
        "testimonial-card--back"
      );
      card.classList.add("testimonial-card--" + pos);
      card.setAttribute("data-position", pos);
      card.style.zIndex = String(style.z);

      if (card !== activeCard) {
        card.style.transform =
          "rotate(" +
          style.rotate +
          "deg) translateX(" +
          style.offset +
          "%)";
      }

      card.setAttribute("aria-hidden", pos === "front" ? "false" : "true");
    });
  }

  function shuffle() {
    positions.unshift(positions.pop());
    applyPositions();
  }

  function getFrontCard() {
    return cards.find(function (c) {
      return c.getAttribute("data-position") === "front";
    });
  }

  function onPointerDown(e) {
    var card = e.currentTarget;
    if (card.getAttribute("data-position") !== "front") return;

    activeCard = card;
    dragStartX = e.clientX;
    dragX = 0;
    didDrag = false;
    card.classList.add("is-dragging");
    card.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!activeCard) return;

    dragX = e.clientX - dragStartX;
    if (Math.abs(dragX) > 8) didDrag = true;
    var base = positionStyles.front;
    activeCard.style.transform =
      "rotate(" +
      (base.rotate + dragX * 0.04) +
      "deg) translateX(calc(" +
      base.offset +
      "% + " +
      dragX +
      "px))";
  }

  function onPointerUp(e) {
    if (!activeCard) return;

    var card = activeCard;
    card.classList.remove("is-dragging");

    try {
      card.releasePointerCapture(e.pointerId);
    } catch (err) {
      /* ignore */
    }

    if (dragStartX - e.clientX > SWIPE_THRESHOLD) {
      shuffle();
    } else {
      applyPositions();
    }

    activeCard = null;
    dragStartX = 0;
    dragX = 0;
  }

  function initCards() {
    cards.forEach(function (card) {
      card.addEventListener("pointerdown", onPointerDown);
      card.addEventListener("pointermove", onPointerMove);
      card.addEventListener("pointerup", onPointerUp);
      card.addEventListener("pointercancel", onPointerUp);

      if (!prefersReduced) {
        card.addEventListener("click", function () {
          if (didDrag) return;
          if (card.getAttribute("data-position") === "front") {
            shuffle();
          }
        });
      }
    });

    applyPositions();
  }

  initCards();
})();
