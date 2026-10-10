require("dotenv").config();

const connectDB = require("../config/db");
const Article = require("../models/article");
const User = require("../models/user");

const migrateLegacyArticles = async () => {
  const ownerEmail = (process.env.LEGACY_ARTICLE_OWNER_EMAIL || "").trim().toLowerCase();
  if (!ownerEmail) {
    console.error("Set LEGACY_ARTICLE_OWNER_EMAIL to the existing account that should own legacy articles.");
    process.exit(1);
  }

  try {
    await connectDB();
    const user = await User.findOne({ email: ownerEmail });
    if (!user) {
      throw new Error(`No registered user found for ${ownerEmail}. Sign up first, then retry.`);
    }

    const result = await Article.updateMany(
      { $or: [{ userId: { $exists: false } }, { userId: null }] },
      { $set: { userId: user._id, author: user.name } }
    );

    console.log(`Assigned ${result.modifiedCount} legacy article(s) to ${user.email}.`);
    process.exit(0);
  } catch (error) {
    console.error("Legacy article migration failed:", error.message);
    process.exit(1);
  }
};

migrateLegacyArticles();
