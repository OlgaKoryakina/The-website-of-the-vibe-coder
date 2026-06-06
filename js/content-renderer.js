(function () {
  "use strict";

  var GRADIENTS = {
    craft: "project-card__image--craft",
    "1": "project-card__image--1",
    "2": "project-card__image--2",
    "3": "project-card__image--3",
    "4": "project-card__image--4",
    "5": "project-card__image--5",
    "6": "project-card__image--6",
  };

  function esc(text) {
    if (text == null) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setText(el, value) {
    if (el && value != null) el.textContent = value;
  }

  function setHtml(el, value) {
    if (el && value != null) el.innerHTML = value;
  }

  function delayClass(i) {
    if (i === 1) return " reveal--delay";
    if (i === 2) return " reveal--delay-2";
    return "";
  }

  function renderAboutItem(item) {
    var contactClass =
      item.num === "05" ? " visiting-card__item--contact" : "";
    var body = "";

    if (item.type === "html") {
      body = '<p>' + item.html + "</p>";
    } else if (item.type === "text") {
      body = "<p>" + esc(item.text) + "</p>";
    } else if (item.type === "list") {
      body =
        '<ul class="check-list">' +
        (item.items || [])
          .map(function (li) {
            return "<li>" + esc(li) + "</li>";
          })
          .join("") +
        "</ul>";
    } else if (item.type === "project") {
      body =
        '<p class="visiting-card__project">' +
        esc(item.textBefore) +
        ' <a href="' +
        esc(item.linkUrl) +
        '" target="_blank" rel="noopener noreferrer" class="visiting-card__link">' +
        esc(item.linkText) +
        "</a> " +
        esc(item.textAfter) +
        "</p>";
    } else if (item.type === "contact") {
      body =
        "<p>Telegram: " +
        '<a href="' +
        esc(item.telegramUrl) +
        '" class="visiting-card__link" target="_blank" rel="noopener noreferrer">' +
        esc(item.telegramHandle) +
        "</a></p>";
    }

    return (
      '<article class="visiting-card__item' +
      contactClass +
      '">' +
      '<span class="visiting-card__num">' +
      esc(item.num) +
      "</span>" +
      '<div class="visiting-card__body">' +
      "<h3 class=\"visiting-card__title\">" +
      esc(item.title) +
      "</h3>" +
      body +
      "</div></article>"
    );
  }

  function renderProjectCard(project, index) {
    var featured = project.featured ? " project-card--featured" : "";
    var delay = delayClass(index);
    var imageClass = GRADIENTS[project.gradient] || GRADIENTS.craft;
    var imageStyle = project.image
      ? ' style="background-image:url(\'' +
        esc(project.image) +
        "');background-size:cover;background-position:center\""
      : "";
    var host = "";
    try {
      host = new URL(project.url).host;
    } catch (e) {
      host = project.url || "";
    }

    return (
      '<article class="project-card' +
      featured +
      " reveal" +
      delay +
      '">' +
      '<a href="' +
      esc(project.url) +
      '" target="_blank" rel="noopener noreferrer" class="project-card__link">' +
      '<div class="project-card__image ' +
      (project.image ? "" : imageClass) +
      '"' +
      imageStyle +
      ">" +
      '<span class="project-card__tag">' +
      esc(project.tag) +
      "</span></div>" +
      '<div class="project-card__body glass">' +
      "<h3>" +
      esc(project.title) +
      "</h3>" +
      "<p>" +
      esc(project.text) +
      "</p>" +
      '<span class="project-card__external">' +
      esc(host) +
      " →</span></div></a></article>"
    );
  }

  function renderTestimonial(item, single) {
    var media = "";
    if (item.video) {
      media =
        '<video class="testimonial-card__avatar testimonial-card__video" src="' +
        esc(item.video) +
        '" autoplay muted loop playsinline></video>';
    } else {
      media =
        '<img class="testimonial-card__avatar" src="' +
        esc(item.image) +
        '" alt="' +
        esc(item.author) +
        '" width="128" height="128" loading="lazy" decoding="async">';
    }

    return (
      '<article class="testimonial-card' +
      (single ? " testimonial-card--solo" : "") +
      '">' +
      media +
      '<blockquote class="testimonial-card__quote">' +
      esc(item.quote) +
      "</blockquote>" +
      "<footer><cite class=\"testimonial-card__author\">" +
      esc(item.author) +
      '<span class="testimonial-card__role">' +
      esc(item.role) +
      "</span></cite></footer></article>"
    );
  }

  function applyContent(data) {
    document.title = data.meta.title;
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", data.meta.description);
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", data.meta.ogTitle);
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", data.meta.ogDescription);

    setText(document.querySelector(".logo__mark"), data.header.logoMark);
    setText(document.querySelector(".logo__text"), data.header.logoText);

    setText(document.querySelector(".hero .eyebrow"), data.hero.eyebrow);
    var decrypt = document.querySelector(".hero .decrypt-text");
    if (decrypt) {
      decrypt.setAttribute("data-decrypt-text", data.hero.title);
      decrypt.setAttribute("data-accent", data.hero.titleAccent);
    }
    setText(document.querySelector(".hero__subtitle"), data.hero.subtitle);
    setText(document.querySelector(".hero-photo__badge"), data.hero.badge);

    var heroFigure = document.querySelector(".hero-photo__figure");
    if (heroFigure) {
      if (data.hero.video) {
        heroFigure.innerHTML =
          '<video src="' +
          esc(data.hero.video) +
          '" autoplay muted loop playsinline style="width:100%;aspect-ratio:4/5;object-fit:cover;display:block"></video>';
      } else {
        heroFigure.innerHTML =
          '<img src="' +
          esc(data.hero.photo) +
          '" alt="' +
          esc(data.hero.photoAlt) +
          '" width="520" height="650" loading="eager" decoding="async">';
      }
    }

    var statsEl = document.querySelector(".hero-photo__stats");
    if (statsEl && data.hero.stats) {
      statsEl.innerHTML = data.hero.stats
        .map(function (s) {
          return (
            "<li><strong>" +
            esc(s.label) +
            "</strong><span>" +
            esc(s.text) +
            "</span></li>"
          );
        })
        .join("");
    }

    var heroPrimary = document.querySelector(".hero__actions .btn--primary span");
    if (heroPrimary) setText(heroPrimary, data.hero.btnPrimary);
    var heroGhost = document.querySelector('.hero__actions .btn--ghost');
    if (heroGhost) setText(heroGhost, data.hero.btnSecondary);

    var aboutSection = document.querySelector("#about");
    if (aboutSection) {
      aboutSection.querySelector(".section-tag").textContent = data.about.tag;
      aboutSection.querySelector(".section-title").textContent = data.about.title;
      aboutSection.querySelector(".visiting-card").innerHTML = (data.about.items || [])
        .map(renderAboutItem)
        .join("");
    }

    var servicesSection = document.querySelector("#services");
    if (servicesSection) {
      servicesSection.querySelector(".section-tag").textContent = data.services.tag;
      servicesSection.querySelector(".section-title").textContent = data.services.title;
      servicesSection.querySelector(".cards-grid").innerHTML = (data.services.cards || [])
        .map(function (card, i) {
          return (
            '<article class="card glass reveal' +
            delayClass(i) +
            '">' +
            '<span class="card__num">' +
            esc(card.num) +
            "</span>" +
            "<h3 class=\"card__title\">" +
            esc(card.title) +
            "</h3>" +
            '<p class="card__text">' +
            esc(card.text) +
            "</p></article>"
          );
        })
        .join("");
    }

    var approachSection = document.querySelector("#approach");
    if (approachSection) {
      approachSection.querySelector(".section-tag").textContent = data.approach.tag;
      approachSection.querySelector(".section-title").textContent = data.approach.title;
      approachSection.querySelector(".timeline").innerHTML = (data.approach.steps || [])
        .map(function (step, i) {
          return (
            '<article class="timeline__item glass reveal' +
            delayClass(i) +
            '">' +
            '<span class="timeline__step">' +
            esc(step.step) +
            "</span>" +
            "<h3>" +
            esc(step.title) +
            "</h3>" +
            "<p>" +
            esc(step.text) +
            "</p></article>"
          );
        })
        .join("");
    }

    var projectsSection = document.querySelector("#projects");
    if (projectsSection) {
      projectsSection.querySelector(".section-tag").textContent = data.projects.tag;
      projectsSection.querySelector(".section-title").textContent = data.projects.title;
      var grid = projectsSection.querySelector(".projects-grid");
      var items = data.projects.items || [];
      grid.className =
        "projects-grid" + (items.length === 1 ? " projects-grid--single" : "");
      grid.innerHTML = items.map(renderProjectCard).join("");
    }

    var whySection = document.querySelector("#why");
    if (whySection) {
      whySection.querySelector(".section-tag").textContent = data.why.tag;
      whySection.querySelector(".section-title").textContent = data.why.title;
      whySection.querySelector(".why-block__content > p").textContent = data.why.text;
      whySection.querySelector(".why-columns").innerHTML = (data.why.columns || [])
        .map(function (col) {
          return (
            "<div><h3>" +
            esc(col.title) +
            "</h3><ul class=\"check-list\">" +
            (col.items || [])
              .map(function (li) {
                return "<li>" + esc(li) + "</li>";
              })
              .join("") +
            "</ul></div>"
          );
        })
        .join("");
    }

    var testimonialsSection = document.querySelector("#testimonials");
    if (testimonialsSection) {
      var t = data.testimonials;
      testimonialsSection.querySelector(".section-tag").textContent = t.tag;
      testimonialsSection.querySelector(".section-title").innerHTML =
        esc(t.title) +
        ' <em class="accent-line">' +
        esc(t.titleAccent) +
        "</em>";
      setText(testimonialsSection.querySelector(".testimonials__lead"), t.lead);

      var items = t.items || [];
      var single = items.length <= 1;
      var stack = testimonialsSection.querySelector("[data-testimonials-stack]");
      stack.className =
        "testimonials__stack" + (single ? " testimonials__stack--single" : "");
      stack.innerHTML = items.map(function (item) {
        return renderTestimonial(item, single);
      }).join("");
    }

    var toolsSection = document.querySelector("#tools");
    if (toolsSection) {
      toolsSection.querySelector(".section-tag").textContent = data.tools.tag;
      toolsSection.querySelector(".section-title").textContent = data.tools.title;
      toolsSection.querySelector(".badges").innerHTML = (data.tools.badges || [])
        .map(function (b) {
          return '<span class="badge">' + esc(b) + "</span>";
        })
        .join("");
      setText(toolsSection.querySelector(".tools-note"), data.tools.note);
    }

    var audienceSection = document.querySelector("#audience");
    if (audienceSection) {
      audienceSection.querySelector(".section-tag").textContent = data.audience.tag;
      audienceSection.querySelector(".section-title").textContent = data.audience.title;
      audienceSection.querySelector(".audience-list").innerHTML = (data.audience.items || [])
        .map(function (item) {
          return "<li>" + esc(item) + "</li>";
        })
        .join("");
    }

    var manifestSection = document.querySelector("#manifest");
    if (manifestSection) {
      manifestSection.querySelector(".manifest__quote").innerHTML = (
        data.manifest.paragraphs || []
      )
        .map(function (p) {
          if (p.accent) {
            return (
              "<p>" +
              esc(p.text) +
              '<em class="accent-line">' +
              esc(p.accent) +
              "</em>" +
              esc(p.textAfter || "") +
              "</p>"
            );
          }
          return "<p>" + esc(p.text) + "</p>";
        })
        .join("");
    }

    var ctaSection = document.querySelector("#cta");
    if (ctaSection) {
      setText(ctaSection.querySelector(".cta-block__title"), data.cta.title);
      setText(ctaSection.querySelector(".cta-block__text"), data.cta.text);
      setText(
        ctaSection.querySelector(".cta-block .btn--primary"),
        data.cta.btnPrimary
      );
      setText(
        ctaSection.querySelector(".cta-block .btn--ghost"),
        data.cta.btnSecondary
      );
    }

    var contactSection = document.querySelector("#contact");
    if (contactSection) {
      contactSection.querySelector(".section-tag").textContent = data.contact.tag;
      contactSection.querySelector(".section-title").textContent = data.contact.title;
      contactSection.querySelector(".contact-grid").innerHTML = (data.contact.items || [])
        .map(function (item) {
          var attrs =
            item.type === "link"
              ? ' target="_blank" rel="noopener noreferrer"'
              : "";
          return (
            '<a href="' +
            esc(item.href) +
            '" class="contact-card glass"' +
            attrs +
            ">" +
            '<span class="contact-card__label">' +
            esc(item.label) +
            "</span>" +
            '<span class="contact-card__value">' +
            esc(item.value) +
            "</span></a>"
          );
        })
        .join("");
    }

    setText(document.querySelector(".footer__inner p"), data.footer.text);

    window.__siteContentLoaded = true;
    document.dispatchEvent(new CustomEvent("siteContentLoaded"));
  }

  fetch("/api/content")
    .then(function (res) {
      if (!res.ok) throw new Error("no api");
      return res.json();
    })
    .then(applyContent)
    .catch(function () {
      /* static fallback — HTML as-is */
    });
})();
