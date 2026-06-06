(function () {
  "use strict";

  var content = null;
  var activeSection = "meta";
  var sectionTitles = {
    meta: "SEO и шапка",
    hero: "Hero",
    about: "Обо мне",
    services: "Направления",
    approach: "Подход",
    projects: "Проекты",
    why: "Преимущества",
    testimonials: "Отзывы",
    tools: "Стек",
    audience: "Аудитория",
    manifest: "Манифест",
    cta: "CTA",
    contact: "Контакты",
    footer: "Подвал",
  };

  var loginScreen = document.getElementById("login-screen");
  var adminApp = document.getElementById("admin-app");
  var loginForm = document.getElementById("login-form");
  var loginError = document.getElementById("login-error");
  var panelsEl = document.getElementById("admin-panels");
  var sectionTitleEl = document.getElementById("section-title");
  var saveBtn = document.getElementById("save-btn");
  var saveStatus = document.getElementById("save-status");
  var logoutBtn = document.getElementById("logout-btn");

  function api(url, options) {
    return fetch(url, options).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data.error || "Ошибка запроса");
        return data;
      });
    });
  }

  function field(label, key, value, type) {
    type = type || "text";
    var val = value == null ? "" : String(value);
    if (type === "textarea") {
      return (
        '<label class="field"><span>' +
        label +
        '</span><textarea data-key="' +
        key +
        '">' +
        esc(val) +
        "</textarea></label>"
      );
    }
    return (
      '<label class="field"><span>' +
      label +
      '</span><input type="' +
      type +
      '" data-key="' +
      key +
      '" value="' +
      esc(val) +
      '"></label>'
    );
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function uploadBlock(label, key, url, kind) {
    kind = kind || "image";
    var preview = "";
    if (url) {
      if (kind === "video") {
        preview =
          '<video class="upload-preview upload-preview--video" src="' +
          esc(url) +
          '" muted></video>';
      } else {
        preview =
          '<img class="upload-preview" src="' + esc(url) + '" alt="">';
      }
    }
    return (
      '<div class="field" data-upload="' +
      key +
      '" data-upload-kind="' +
      kind +
      '"><span>' +
      label +
      '</span><div class="upload-row">' +
      preview +
      '<input type="text" data-key="' +
      key +
      '" value="' +
      esc(url || "") +
      '" placeholder="URL или загрузите файл">' +
      '<input type="file" accept="' +
      (kind === "video" ? "video/*" : "image/*") +
      '" data-upload-input>' +
      '<button type="button" class="btn btn--small" data-upload-btn>Загрузить</button></div></div>'
    );
  }

  function renderPanels() {
    panelsEl.innerHTML =
      renderMetaPanel() +
      renderHeroPanel() +
      renderAboutPanel() +
      renderServicesPanel() +
      renderApproachPanel() +
      renderProjectsPanel() +
      renderWhyPanel() +
      renderTestimonialsPanel() +
      renderToolsPanel() +
      renderAudiencePanel() +
      renderManifestPanel() +
      renderCtaPanel() +
      renderContactPanel() +
      renderFooterPanel();
    bindPanelEvents();
    showSection(activeSection);
  }

  function renderMetaPanel() {
    var m = content.meta;
    var h = content.header;
    return (
      '<section class="panel" data-panel="meta"><div class="card"><h3>SEO</h3>' +
      field("Title страницы", "meta.title", m.title) +
      field("Meta description", "meta.description", m.description, "textarea") +
      field("OG Title", "meta.ogTitle", m.ogTitle) +
      field("OG Description", "meta.ogDescription", m.ogDescription, "textarea") +
      '</div><div class="card"><h3>Шапка</h3>' +
      field("Марк логотипа", "header.logoMark", h.logoMark) +
      field("Текст логотипа", "header.logoText", h.logoText) +
      "</div></section>"
    );
  }

  function renderHeroPanel() {
    var h = content.hero;
    var statsHtml = (h.stats || [])
      .map(function (s, i) {
        return (
          '<div class="repeat-block" data-array="hero.stats" data-index="' +
          i +
          '"><div class="repeat-block__head"><strong>Стат ' +
          (i + 1) +
          '</strong><button type="button" class="btn btn--small btn--danger" data-remove-array>Удалить</button></div>' +
          field("Метка", "hero.stats." + i + ".label", s.label) +
          field("Подпись", "hero.stats." + i + ".text", s.text) +
          "</div>"
        );
      })
      .join("");
    return (
      '<section class="panel" data-panel="hero"><div class="card"><h3>Тексты</h3>' +
      field("Eyebrow", "hero.eyebrow", h.eyebrow) +
      field("Заголовок (decrypt)", "hero.title", h.title, "textarea") +
      field("Акцент в заголовке", "hero.titleAccent", h.titleAccent) +
      field("Подзаголовок", "hero.subtitle", h.subtitle, "textarea") +
      field("Бейдж на фото", "hero.badge", h.badge) +
      field("Кнопка 1", "hero.btnPrimary", h.btnPrimary) +
      field("Кнопка 2", "hero.btnSecondary", h.btnSecondary) +
      '</div><div class="card"><h3>Медиа</h3>' +
      uploadBlock("Фото Hero", "hero.photo", h.photo, "image") +
      field("Alt фото", "hero.photoAlt", h.photoAlt) +
      uploadBlock("Видео Hero (если есть — заменит фото)", "hero.video", h.video, "video") +
      '<p class="hint">Видео имеет приоритет над фото. Оставьте поле пустым, чтобы показывалось фото.</p></div><div class="card"><h3>Статистика под фото</h3>' +
      statsHtml +
      '<button type="button" class="btn btn--ghost" data-add-hero-stat>+ Добавить пункт</button></div></section>'
    );
  }

  function renderAboutPanel() {
    var items = (content.about.items || [])
      .map(function (item, i) {
        var extra = "";
        if (item.type === "list") {
          extra =
            field("Пункты (каждый с новой строки)", "about.items." + i + ".itemsText", (item.items || []).join("\n"), "textarea") +
            '<input type="hidden" data-key="about.items.' + i + '.type" value="list">';
        } else if (item.type === "html") {
          extra = field("HTML текст", "about.items." + i + ".html", item.html, "textarea") +
            '<input type="hidden" data-key="about.items.' + i + '.type" value="html">';
        } else if (item.type === "text") {
          extra = field("Текст", "about.items." + i + ".text", item.text, "textarea") +
            '<input type="hidden" data-key="about.items.' + i + '.type" value="text">';
        } else if (item.type === "project") {
          extra =
            field("Текст до ссылки", "about.items." + i + ".textBefore", item.textBefore) +
            field("Текст ссылки", "about.items." + i + ".linkText", item.linkText) +
            field("URL", "about.items." + i + ".linkUrl", item.linkUrl) +
            field("Текст после ссылки", "about.items." + i + ".textAfter", item.textAfter) +
            '<input type="hidden" data-key="about.items.' + i + '.type" value="project">';
        } else if (item.type === "contact") {
          extra =
            field("Telegram", "about.items." + i + ".telegramHandle", item.telegramHandle) +
            field("URL Telegram", "about.items." + i + ".telegramUrl", item.telegramUrl) +
            '<input type="hidden" data-key="about.items.' + i + '.type" value="contact">';
        }
        return (
          '<div class="repeat-block" data-array="about.items" data-index="' +
          i +
          '"><div class="repeat-block__head"><strong>Пункт ' +
          esc(item.num || i + 1) +
          '</strong></div>' +
          field("Номер", "about.items." + i + ".num", item.num) +
          field("Заголовок", "about.items." + i + ".title", item.title) +
          field("Тип блока", "about.items." + i + ".type", item.type) +
          extra +
          "</div>"
        );
      })
      .join("");
    return (
      '<section class="panel" data-panel="about"><div class="card"><h3>Заголовок секции</h3>' +
      field("Тег", "about.tag", content.about.tag) +
      field("Заголовок", "about.title", content.about.title) +
      '</div><div class="card"><h3>Пункты визитки</h3>' +
      items +
      "</div></section>"
    );
  }

  function renderServicesPanel() {
    return (
      '<section class="panel" data-panel="services"><div class="card"><h3>Заголовок</h3>' +
      field("Тег", "services.tag", content.services.tag) +
      field("Заголовок", "services.title", content.services.title) +
      '</div><div class="card"><h3>Карточки</h3>' +
      renderRepeatCards("services.cards", content.services.cards, ["num", "title", "text"]) +
      '<button type="button" class="btn btn--ghost" data-add-card="services.cards">+ Добавить карточку</button></div></section>'
    );
  }

  function renderApproachPanel() {
    return (
      '<section class="panel" data-panel="approach"><div class="card"><h3>Заголовок</h3>' +
      field("Тег", "approach.tag", content.approach.tag) +
      field("Заголовок", "approach.title", content.approach.title) +
      '</div><div class="card"><h3>Этапы</h3>' +
      renderRepeatCards("approach.steps", content.approach.steps, ["step", "title", "text"]) +
      '<button type="button" class="btn btn--ghost" data-add-card="approach.steps">+ Добавить этап</button></div></section>'
    );
  }

  function renderProjectsPanel() {
    var items = (content.projects.items || [])
      .map(function (p, i) {
        return (
          '<div class="repeat-block" data-array="projects.items" data-index="' +
          i +
          '"><div class="repeat-block__head"><strong>Проект ' +
          (i + 1) +
          '</strong><button type="button" class="btn btn--small btn--danger" data-remove-array>Удалить</button></div>' +
          field("Название", "projects.items." + i + ".title", p.title) +
          field("Описание", "projects.items." + i + ".text", p.text, "textarea") +
          field("URL", "projects.items." + i + ".url", p.url) +
          field("Тег", "projects.items." + i + ".tag", p.tag) +
          uploadBlock("Изображение (необязательно)", "projects.items." + i + ".image", p.image, "image") +
          field("Градиент (craft, 1-6)", "projects.items." + i + ".gradient", p.gradient || "craft") +
          '<label class="field"><span>Крупная карточка</span><select data-key="projects.items.' +
          i +
          '.featured"><option value="true"' +
          (p.featured ? " selected" : "") +
          '>Да</option><option value="false"' +
          (!p.featured ? " selected" : "") +
          ">Нет</option></select></label></div>"
        );
      })
      .join("");
    return (
      '<section class="panel" data-panel="projects"><div class="card"><h3>Заголовок</h3>' +
      field("Тег", "projects.tag", content.projects.tag) +
      field("Заголовок", "projects.title", content.projects.title) +
      '</div><div class="card"><h3>Проекты</h3>' +
      items +
      '<button type="button" class="btn btn--ghost" data-add-project>+ Добавить проект</button></div></section>'
    );
  }

  function renderWhyPanel() {
    var cols = (content.why.columns || [])
      .map(function (col, i) {
        return (
          '<div class="repeat-block"><div class="repeat-block__head"><strong>Колонка ' +
          (i + 1) +
          "</strong></div>" +
          field("Заголовок", "why.columns." + i + ".title", col.title) +
          field("Пункты (каждый с новой строки)", "why.columns." + i + ".itemsText", (col.items || []).join("\n"), "textarea") +
          "</div>"
        );
      })
      .join("");
    return (
      '<section class="panel" data-panel="why"><div class="card"><h3>Заголовок</h3>' +
      field("Тег", "why.tag", content.why.tag) +
      field("Заголовок", "why.title", content.why.title) +
      field("Текст", "why.text", content.why.text, "textarea") +
      '</div><div class="card"><h3>Колонки</h3>' + cols + "</div></section>"
    );
  }

  function renderTestimonialsPanel() {
    var items = (content.testimonials.items || [])
      .map(function (t, i) {
        return (
          '<div class="repeat-block" data-array="testimonials.items" data-index="' +
          i +
          '"><div class="repeat-block__head"><strong>Отзыв ' +
          (i + 1) +
          '</strong><button type="button" class="btn btn--small btn--danger" data-remove-array>Удалить</button></div>' +
          field("Цитата", "testimonials.items." + i + ".quote", t.quote, "textarea") +
          field("Автор", "testimonials.items." + i + ".author", t.author) +
          field("Роль / подпись", "testimonials.items." + i + ".role", t.role) +
          uploadBlock("Фото", "testimonials.items." + i + ".image", t.image, "image") +
          uploadBlock("Видео (необязательно)", "testimonials.items." + i + ".video", t.video, "video") +
          "</div>"
        );
      })
      .join("");
    return (
      '<section class="panel" data-panel="testimonials"><div class="card"><h3>Заголовок</h3>' +
      field("Тег", "testimonials.tag", content.testimonials.tag) +
      field("Заголовок", "testimonials.title", content.testimonials.title) +
      field("Акцент", "testimonials.titleAccent", content.testimonials.titleAccent) +
      field("Подпись слева", "testimonials.lead", content.testimonials.lead, "textarea") +
      '</div><div class="card"><h3>Отзывы</h3>' +
      items +
      '<button type="button" class="btn btn--ghost" data-add-testimonial>+ Добавить отзыв</button></div></section>'
    );
  }

  function renderToolsPanel() {
    return (
      '<section class="panel" data-panel="tools"><div class="card"><h3>Стек</h3>' +
      field("Тег", "tools.tag", content.tools.tag) +
      field("Заголовок", "tools.title", content.tools.title) +
      field("Бейджи (каждый с новой строки)", "tools.badgesText", (content.tools.badges || []).join("\n"), "textarea") +
      field("Подпись", "tools.note", content.tools.note, "textarea") +
      "</div></section>"
    );
  }

  function renderAudiencePanel() {
    return (
      '<section class="panel" data-panel="audience"><div class="card"><h3>Аудитория</h3>' +
      field("Тег", "audience.tag", content.audience.tag) +
      field("Заголовок", "audience.title", content.audience.title) +
      field("Пункты (каждый с новой строки)", "audience.itemsText", (content.audience.items || []).join("\n"), "textarea") +
      "</div></section>"
    );
  }

  function renderManifestPanel() {
    var paras = (content.manifest.paragraphs || [])
      .map(function (p, i) {
        return (
          '<div class="repeat-block"><strong>Абзац ' +
          (i + 1) +
          "</strong>" +
          field("Текст", "manifest.paragraphs." + i + ".text", p.text) +
          field("Акцент (курсив)", "manifest.paragraphs." + i + ".accent", p.accent || "") +
          field("Текст после акцента", "manifest.paragraphs." + i + ".textAfter", p.textAfter || "") +
          "</div>"
        );
      })
      .join("");
    return '<section class="panel" data-panel="manifest"><div class="card"><h3>Манифест</h3>' + paras + "</div></section>";
  }

  function renderCtaPanel() {
    var c = content.cta;
    return (
      '<section class="panel" data-panel="cta"><div class="card"><h3>CTA блок</h3>' +
      field("Заголовок", "cta.title", c.title, "textarea") +
      field("Текст", "cta.text", c.text, "textarea") +
      field("Кнопка 1", "cta.btnPrimary", c.btnPrimary) +
      field("Кнопка 2", "cta.btnSecondary", c.btnSecondary) +
      "</div></section>"
    );
  }

  function renderContactPanel() {
    var items = (content.contact.items || [])
      .map(function (c, i) {
        return (
          '<div class="repeat-block" data-array="contact.items" data-index="' +
          i +
          '"><div class="repeat-block__head"><strong>Контакт ' +
          (i + 1) +
          '</strong><button type="button" class="btn btn--small btn--danger" data-remove-array>Удалить</button></div>' +
          field("Метка", "contact.items." + i + ".label", c.label) +
          field("Значение", "contact.items." + i + ".value", c.value) +
          field("Ссылка", "contact.items." + i + ".href", c.href) +
          field("Тип (link / email)", "contact.items." + i + ".type", c.type) +
          "</div>"
        );
      })
      .join("");
    return (
      '<section class="panel" data-panel="contact"><div class="card"><h3>Контакты</h3>' +
      field("Тег", "contact.tag", content.contact.tag) +
      field("Заголовок", "contact.title", content.contact.title) +
      '</div><div class="card">' +
      items +
      '<button type="button" class="btn btn--ghost" data-add-contact>+ Добавить контакт</button></div></section>'
    );
  }

  function renderFooterPanel() {
    return (
      '<section class="panel" data-panel="footer"><div class="card"><h3>Подвал</h3>' +
      field("Текст", "footer.text", content.footer.text) +
      "</div></section>"
    );
  }

  function renderRepeatCards(path, items, keys) {
    return (items || [])
      .map(function (item, i) {
        var fields = keys
          .map(function (k) {
            var label = k === "num" ? "Номер" : k === "step" ? "Этап" : k === "title" ? "Заголовок" : "Текст";
            var type = k === "text" ? "textarea" : "text";
            return field(label, path + "." + i + "." + k, item[k], type);
          })
          .join("");
        return (
          '<div class="repeat-block" data-array="' +
          path +
          '" data-index="' +
          i +
          '"><div class="repeat-block__head"><strong>#' +
          (i + 1) +
          '</strong><button type="button" class="btn btn--small btn--danger" data-remove-array>Удалить</button></div>' +
          fields +
          "</div>"
        );
      })
      .join("");
  }

  function setDeep(obj, path, value) {
    var keys = path.split(".");
    var current = obj;
    for (var i = 0; i < keys.length - 1; i++) {
      var key = keys[i];
      var nextKey = keys[i + 1];
      if (/^\d+$/.test(key)) key = Number(key);
      if (current[key] === undefined || current[key] === null) {
        current[key] = /^\d+$/.test(nextKey) ? [] : {};
      }
      current = current[key];
    }
    var last = keys[keys.length - 1];
    if (/^\d+$/.test(last)) last = Number(last);
    current[last] = value;
  }

  function getDeep(obj, path) {
    return path.split(".").reduce(function (acc, key) {
      if (acc == null) return undefined;
      if (/^\d+$/.test(key)) key = Number(key);
      return acc[key];
    }, obj);
  }

  function collectFormData() {
    var data = JSON.parse(JSON.stringify(content));
    panelsEl.querySelectorAll("[data-key]").forEach(function (el) {
      var key = el.getAttribute("data-key");
      var val = el.type === "checkbox" ? el.checked : el.value;
      if (key.endsWith(".featured")) val = val === "true";
      if (key.endsWith(".itemsText")) {
        var base = key.replace(".itemsText", "");
        setDeep(data, base + ".items", val.split("\n").filter(function (line) {
          return line.trim();
        }));
        return;
      }
      if (key.endsWith(".listText")) {
        var baseList = key.replace(".listText", "");
        setDeep(data, baseList + ".items", val.split("\n").filter(function (line) {
          return line.trim();
        }));
        return;
      }
      if (key === "tools.badgesText") {
        data.tools.badges = val.split("\n").filter(Boolean);
        return;
      }
      if (key === "audience.itemsText") {
        data.audience.items = val.split("\n").filter(Boolean);
        return;
      }
      setDeep(data, key, val);
    });
    return data;
  }

  function bindPanelEvents() {
    document.querySelectorAll("[data-upload-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var wrap = btn.closest("[data-upload]");
        var fileInput = wrap.querySelector("[data-upload-input]");
        var urlInput = wrap.querySelector("[data-key]");
        var kind = wrap.getAttribute("data-upload-kind");
        if (!fileInput.files[0]) return alert("Выберите файл");
        var fd = new FormData();
        fd.append("file", fileInput.files[0]);
        btn.disabled = true;
        btn.textContent = "Загрузка…";
        fetch("/api/upload/" + kind, { method: "POST", body: fd })
          .then(function (r) {
            return r.json();
          })
          .then(function (res) {
            if (res.error) throw new Error(res.error);
            urlInput.value = res.url;
            btn.disabled = false;
            btn.textContent = "Загрузить";
            renderPanels();
            showSection(activeSection);
          })
          .catch(function (err) {
            alert(err.message);
            btn.disabled = false;
            btn.textContent = "Загрузить";
          });
      });
    });

    document.querySelectorAll("[data-remove-array]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var block = btn.closest("[data-array]");
        var path = block.getAttribute("data-array");
        var index = Number(block.getAttribute("data-index"));
        var arr = getDeep(content, path);
        arr.splice(index, 1);
        renderPanels();
      });
    });

    document.querySelector("[data-add-hero-stat]") &&
      document.querySelector("[data-add-hero-stat]").addEventListener("click", function () {
        content.hero.stats.push({ label: "New", text: "text" });
        renderPanels();
        showSection("hero");
      });

    document.querySelector("[data-add-project]") &&
      document.querySelector("[data-add-project]").addEventListener("click", function () {
        content.projects.items.push({
          title: "Новый проект",
          text: "",
          url: "https://",
          tag: "Web",
          image: "",
          gradient: "craft",
          featured: false,
        });
        renderPanels();
        showSection("projects");
      });

    document.querySelector("[data-add-testimonial]") &&
      document.querySelector("[data-add-testimonial]").addEventListener("click", function () {
        content.testimonials.items.push({
          quote: "",
          author: "",
          role: "",
          image: "",
          video: "",
        });
        renderPanels();
        showSection("testimonials");
      });

    document.querySelector("[data-add-contact]") &&
      document.querySelector("[data-add-contact]").addEventListener("click", function () {
        content.contact.items.push({
          label: "Контакт",
          value: "",
          href: "#",
          type: "link",
        });
        renderPanels();
        showSection("contact");
      });

    document.querySelectorAll("[data-add-card]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var path = btn.getAttribute("data-add-card");
        var arr = getDeep(content, path);
        if (path === "services.cards") {
          arr.push({ num: "00", title: "Новое", text: "" });
        } else {
          arr.push({ step: "Этап", title: "Новый", text: "" });
        }
        renderPanels();
        showSection(path.split(".")[0]);
      });
    });
  }

  function showSection(id) {
    activeSection = id;
    sectionTitleEl.textContent = sectionTitles[id] || id;
    document.querySelectorAll(".panel").forEach(function (p) {
      p.classList.toggle("is-active", p.getAttribute("data-panel") === id);
    });
    document.querySelectorAll("#section-nav button").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-section") === id);
    });
  }

  function showAdmin() {
    loginScreen.hidden = true;
    adminApp.hidden = false;
  }

  function showLogin() {
    loginScreen.hidden = false;
    adminApp.hidden = true;
  }

  function loadContent() {
    return api("/api/content").then(function (data) {
      content = data;
      renderPanels();
    });
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    loginError.hidden = true;
    var fd = new FormData(loginForm);
    api("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: fd.get("username"),
        password: fd.get("password"),
      }),
    })
      .then(function () {
        return loadContent();
      })
      .then(showAdmin)
      .catch(function (err) {
        loginError.textContent = err.message;
        loginError.hidden = false;
      });
  });

  logoutBtn.addEventListener("click", function () {
    api("/api/auth/logout", { method: "POST" }).then(showLogin);
  });

  saveBtn.addEventListener("click", function () {
    var data = collectFormData();
    saveBtn.disabled = true;
    saveStatus.textContent = "Сохранение…";
    api("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(function () {
        content = data;
        saveStatus.textContent = "Сохранено ✓";
        setTimeout(function () {
          saveStatus.textContent = "";
        }, 2500);
      })
      .catch(function (err) {
        saveStatus.textContent = "";
        alert(err.message);
      })
      .finally(function () {
        saveBtn.disabled = false;
      });
  });

  document.getElementById("section-nav").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-section]");
    if (!btn) return;
    content = collectFormData();
    showSection(btn.getAttribute("data-section"));
    renderPanels();
  });

  api("/api/auth/me")
    .then(function (res) {
      if (res.authenticated) return loadContent().then(showAdmin);
      showLogin();
    })
    .catch(showLogin);
})();
