const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 5,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      minlength: 20,
      trim: true,
    },
    author: {
      type: String,
      default: "Guest",
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

articleSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("Article", articleSchema);
