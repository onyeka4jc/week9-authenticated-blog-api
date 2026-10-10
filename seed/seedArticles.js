require("dotenv").config();

const connectDB = require("../config/db");
const Article = require("../models/article");
const User = require("../models/user");

const seedArticles = async () => {
  try {
    await connectDB();

    const user = await User.findOne().sort({ createdAt: 1 });
    if (!user) {
      throw new Error("Register a user with POST /api/auth/signup before seeding articles.");
    }

    // Retain the original seed command's behavior of replacing the articles,
    // but associate the sample records with a real registered user.
    await Article.deleteMany({});
    const articles = [
      {
        title: "Getting Started with Node.js",
        content: "Node.js allows developers to build fast and scalable backend applications using JavaScript.",
        author: user.name,
        userId: user._id,
      },
      {
        title: "Understanding REST APIs",
        content: "REST APIs allow different applications to communicate through standard HTTP methods and resources.",
        author: user.name,
        userId: user._id,
      },
    ];

    const createdArticles = await Article.insertMany(articles);
    console.log(`${createdArticles.length} articles seeded for ${user.email}`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedArticles();
