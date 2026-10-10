require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const articleRoutes = require("./routes/articleRoutes");

const app = express();
app.use(express.json({ limit: "1mb" }));

// JWTs must never be signed with a hard-coded fallback secret.
if (!process.env.JWT_SECRET) {
  console.error("Startup blocked: set JWT_SECRET in your environment before starting the API.");
  process.exit(1);
}

connectDB();

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Week 9 Authenticated Blog API is running",
    endpoints: {
      signup: "POST /api/auth/signup",
      login: "POST /api/auth/login",
      articles: "/api/articles",
    },
  });
});

// /api paths are the documented paths. Short aliases are kept for convenience.
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/articles", articleRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Avoid leaking stack traces or database details in unexpected HTTP errors.
app.use((error, _req, res, _next) => {
  console.error("Unhandled request error:", error.message);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
