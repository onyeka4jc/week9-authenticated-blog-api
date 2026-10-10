const mongoose = require("mongoose");
const Article = require("../models/article");

const isValidArticleId = (id) => mongoose.Types.ObjectId.isValid(id);

const userOwnsArticle = (article, user) =>
  Boolean(article.userId && user && article.userId.toString() === user._id.toString());

// CREATE ARTICLE (the authenticated user's identity is assigned server-side)
const createArticle = async (req, res) => {
  try {
    const article = await Article.create({
      title: req.body.title,
      content: req.body.content,
      author: req.user.name,
      userId: req.user._id,
    });

    return res.status(201).json({ message: "Article created successfully", article });
  } catch (error) {
    console.error("Failed to create article:", error.message);
    return res.status(500).json({ message: "Failed to create article" });
  }
};

// GET ALL ARTICLES (requires authentication; any authenticated user may read)
const getArticles = async (_req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    return res.status(200).json({ count: articles.length, articles });
  } catch (error) {
    console.error("Failed to retrieve articles:", error.message);
    return res.status(500).json({ message: "Failed to retrieve articles" });
  }
};

// GET ONE ARTICLE (requires authentication; any authenticated user may read)
const getArticle = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidArticleId(id)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }

    const article = await Article.findById(id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    return res.status(200).json(article);
  } catch (error) {
    console.error("Failed to retrieve article:", error.message);
    return res.status(500).json({ message: "Failed to retrieve article" });
  }
};

// UPDATE ARTICLE (owner only)
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidArticleId(id)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }

    const article = await Article.findById(id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    if (!userOwnsArticle(article, req.user)) {
      return res.status(403).json({ message: "Forbidden: you can only update your own articles" });
    }

    article.title = req.body.title;
    article.content = req.body.content;
    await article.save();

    return res.status(200).json({ message: "Article updated successfully", article });
  } catch (error) {
    console.error("Failed to update article:", error.message);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation failed", error: error.message });
    }
    return res.status(500).json({ message: "Failed to update article" });
  }
};

// DELETE ARTICLE (owner only)
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidArticleId(id)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }

    const article = await Article.findById(id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    if (!userOwnsArticle(article, req.user)) {
      return res.status(403).json({ message: "Forbidden: you can only delete your own articles" });
    }

    await article.deleteOne();
    return res.status(200).json({ message: "Article deleted successfully", article });
  } catch (error) {
    console.error("Failed to delete article:", error.message);
    return res.status(500).json({ message: "Failed to delete article" });
  }
};

// SEARCH ARTICLES (also protected by requireAuth on the router)
const searchArticles = async (req, res) => {
  try {
    const { q } = req.query;
    if (typeof q !== "string" || !q.trim()) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const articles = await Article.find({ $text: { $search: q } }).sort({ createdAt: -1 });
    return res.status(200).json({ count: articles.length, articles });
  } catch (error) {
    console.error("Error searching articles:", error.message);
    return res.status(500).json({ message: "Error searching articles" });
  }
};

module.exports = {
  createArticle,
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle,
  searchArticles,
};
