(function () {
  "use strict";

  const header = document.querySelector(".header");
  const burger = document.querySelector(".burger");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-menu__link");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var heroDecrypt = null;

  /* Page load sequence */
  function initPageLoad() {
    document.body.classList.remove("is-loading");
    requestAnimationFrame(function () {
      document.body.classList.add("is-ready");
      startHeroDecrypt();
    });
  }

  function createHeroDecrypt() {
    var el = document.querySelector(".hero__title .decrypt-text");
    if (!el || typeof DecryptedText === "undefined") return;
    if (heroDecrypt) return;

    heroDecrypt = new DecryptedText(el, {
      animateOn: "load",
      sequential: true,
      revealDirection: "start",
      speed: 42,
      useOriginalCharsOnly: true,
    });
    heroDecrypt.init();
  }

  function startHeroDecrypt() {
    if (!heroDecrypt) createHeroDecrypt();
    if (!heroDecrypt) return;

    if (prefersReduced) {
      heroDecrypt.showPlain();
      return;
    }

    heroDecrypt.start();
  }

  document.addEventListener("DOMContentLoaded", createHeroDecrypt);

  function bootPage() {
    if (prefersReduced) {
      document.body.classList.remove("is-loading");
      document.body.classList.add("is-ready");
      document.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("is-visible");
      });
      startHeroDecrypt();
    } else {
      window.addEventListener("load", initPageLoad);
      setTimeout(initPageLoad, 2800);
    }
  }

  document.addEventListener("siteContentLoaded", function () {
    heroDecrypt = null;
    createHeroDecrypt();
    initReveal();
    if (typeof window.initTestimonials === "function") {
      window.initTestimonials();
    }
  });

  function initReveal() {
    const revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && revealEls.length) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
      );
      revealEls.forEach(function (el) {
        if (!el.classList.contains("is-visible")) observer.observe(el);
      });
    } else {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  }

  bootPage();
  initReveal();

  /* Header on scroll */
  function onScroll() {
    if (!header) return;
    header.classList.toggle("header--scrolled", window.scrollY > 48);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  function closeMenu() {
    if (!burger || !mobileMenu) return;
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("is-open");
    mobileMenu.hidden = true;
    document.body.style.overflow = "";
  }

  function openMenu() {
    if (!burger || !mobileMenu) return;
    burger.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
    mobileMenu.hidden = false;
    requestAnimationFrame(function () {
      mobileMenu.classList.add("is-open");
    });
    document.body.style.overflow = "hidden";
  }

  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      if (burger.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    mobileLinks.forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* Hero photo tilt */
  const heroPhoto = document.querySelector(".hero-photo");

  if (heroPhoto && !prefersReduced) {
    heroPhoto.addEventListener("mousemove", function (e) {
      const rect = heroPhoto.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const x = (e.clientX - cx) / rect.width;
      const y = (e.clientY - cy) / rect.height;
      heroPhoto.style.transform =
        "perspective(900px) rotateY(" + x * 5 + "deg) rotateX(" + -y * 5 + "deg)";
    });

    heroPhoto.addEventListener("mouseleave", function () {
      heroPhoto.style.transform = "";
    });
  }
})();
