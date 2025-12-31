// app.js
const express = require("express");
const app = express();
const PORT = 5000;

// Define your secret API Key (keep it safe!)
const API_KEY = "cosmogalaxy123";

// Middleware to enforce API Key
function checkApiKey(req, res, next) {
  const clientKey = req.header("x-api-key"); // Expecting key in request header

  if (!clientKey) {
    return res.status(401).json({ error: "API Key is missing" });
  }

  if (clientKey !== API_KEY) {
    return res.status(403).json({ error: "Invalid API Key" });
  }

  next(); // Key is valid → continue to route
}

// Example secure route
app.get("/secure-data", checkApiKey, (req, res) => {
  res.json({
    message: "You accessed secure data!",
    data: { user: "Alice", role: "admin" },
  });
});

// Example public route (no key required)
app.get("/public", (req, res) => {
  res.json({ message: "This is public data, no API key needed." });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
