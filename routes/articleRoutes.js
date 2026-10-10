const express = require("express");
const {
  createArticle,
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle,
  searchArticles,
} = require("../controllers/articleController");
const requireAuth = require("../middleware/requireAuth");
const validateArticle = require("../middleware/validateArticle");

const router = express.Router();

// Protect every article endpoint, including search and all CRUD routes.
router.use(requireAuth);

router.post("/", validateArticle, createArticle);
router.get("/", getArticles);
router.get("/search", searchArticles);
router.get("/:id", getArticle);
router.put("/:id", validateArticle, updateArticle);
router.delete("/:id", deleteArticle);

module.exports = router;
