const express = require("express");
const path = require("path");

const app = express();

// Set EJS as template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files (CSS, images, JS, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", (req, res) => {
    res.render("login", { title: "Moody | Login" });
});

app.post("/login", (req, res) => {
    // TODO: add login logic here later
    res.send("Login received!");
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
