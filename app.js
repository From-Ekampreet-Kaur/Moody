// -------------------------
//    Moody – app.js
// -------------------------

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// -------------------------
// VIEW ENGINE SETUP (EJS)
// -------------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// -------------------------
// MIDDLEWARE
// -------------------------
app.use(express.static("public"));      // For CSS, JS, images
app.use(bodyParser.urlencoded({ extended: true })); // For form data
app.use(express.json());

// -------------------------
// ROUTES
// -------------------------

// Landing Page
app.get("/landing", (req, res) => {
  res.render("landing");
});

// Login Page
app.get("/login", (req, res) => {
  res.render("login");
});

// Signup Page
app.get("/signup", (req, res) => {
  res.render("signup");
});

// Home Page (after login)
app.get("/home", (req, res) => {
  res.render("home");
});

// Profile Page
app.get("/profile", (req, res) => {
  res.render("profile");
});

// Mood Page
app.get("/mood", (req, res) => {
  res.render("mood");
});

// Craving Page
app.get("/craving", (req, res) => {
  res.render("craving");
});

// About Page
app.get("/about", (req, res) => {
  res.render("about");
});

// Contact Page
app.get("/contact", (req, res) => {
  res.render("contact");
});


// -------------------------
// 404 PAGE
// -------------------------
app.use((req, res) => {
  res.status(404).send("<h1>404 – Page Not Found</h1>");
});

// -------------------------
// START SERVER
// -------------------------
app.listen(PORT, () => {
  console.log(`Moody server running at http://localhost:${PORT}`);
});
