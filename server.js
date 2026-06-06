"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const multer = require("multer");
require("dotenv").config();

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const UPLOADS_DIR = path.join(ROOT, "uploads");
const IMAGES_DIR = path.join(UPLOADS_DIR, "images");
const VIDEOS_DIR = path.join(UPLOADS_DIR, "videos");

const PORT = Number(process.env.PORT) || 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "olga";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Olga2026!";
const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");

[DATA_DIR, IMAGES_DIR, VIDEOS_DIR].forEach(function (dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

if (!fs.existsSync(CONTENT_FILE)) {
  fs.writeFileSync(CONTENT_FILE, "{}", "utf8");
}

const app = express();

app.use(express.json({ limit: "12mb" }));
app.use(
  session({
    name: "ok_admin_session",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 12,
    },
  })
);

function readContent() {
  const raw = fs.readFileSync(CONTENT_FILE, "utf8");
  return JSON.parse(raw);
}

function writeContent(data) {
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2), "utf8");
}

function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  res.status(401).json({ error: "Требуется авторизация" });
}

const imageStorage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, IMAGES_DIR);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, Date.now() + "-" + crypto.randomBytes(6).toString("hex") + ext);
  },
});

const videoStorage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, VIDEOS_DIR);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || ".mp4";
    cb(null, Date.now() + "-" + crypto.randomBytes(6).toString("hex") + ext);
  },
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: function (_req, file, cb) {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error("Допустимы только изображения"));
  },
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 120 * 1024 * 1024 },
  fileFilter: function (_req, file, cb) {
    if (/^video\//.test(file.mimetype)) cb(null, true);
    else cb(new Error("Допустимы только видео"));
  },
});

app.get("/api/content", function (_req, res) {
  try {
    res.json(readContent());
  } catch (err) {
    res.status(500).json({ error: "Не удалось прочитать контент" });
  }
});

app.put("/api/content", requireAuth, function (req, res) {
  try {
    writeContent(req.body);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Не удалось сохранить контент" });
  }
});

app.post("/api/auth/login", async function (req, res) {
  const { username, password } = req.body || {};

  if (username !== ADMIN_USERNAME) {
    return res.status(401).json({ error: "Неверный логин или пароль" });
  }

  const valid =
    password === ADMIN_PASSWORD ||
    (ADMIN_PASSWORD.startsWith("$2") &&
      (await bcrypt.compare(password, ADMIN_PASSWORD)));

  if (!valid) {
    return res.status(401).json({ error: "Неверный логин или пароль" });
  }

  req.session.isAdmin = true;
  req.session.username = username;
  res.json({ ok: true, username });
});

app.post("/api/auth/logout", function (req, res) {
  req.session.destroy(function () {
    res.json({ ok: true });
  });
});

app.get("/api/auth/me", function (req, res) {
  if (req.session && req.session.isAdmin) {
    return res.json({ authenticated: true, username: req.session.username });
  }
  res.json({ authenticated: false });
});

app.post("/api/upload/image", requireAuth, uploadImage.single("file"), function (req, res) {
  if (!req.file) return res.status(400).json({ error: "Файл не получен" });
  res.json({ url: "/uploads/images/" + req.file.filename });
});

app.post("/api/upload/video", requireAuth, uploadVideo.single("file"), function (req, res) {
  if (!req.file) return res.status(400).json({ error: "Файл не получен" });
  res.json({ url: "/uploads/videos/" + req.file.filename });
});

app.use("/uploads", express.static(UPLOADS_DIR));
app.use(express.static(ROOT));

app.get("/admin", function (_req, res) {
  res.sendFile(path.join(ROOT, "admin", "index.html"));
});

app.use(function (err, _req, res, _next) {
  res.status(400).json({ error: err.message || "Ошибка загрузки" });
});

app.listen(PORT, function () {
  console.log("Сайт:  http://localhost:" + PORT);
  console.log("Админ: http://localhost:" + PORT + "/admin");
  console.log("Логин: " + ADMIN_USERNAME);
});
