const jwt = require("jsonwebtoken");
const Joi = require("joi");
const User = require("../models/user");

const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().email().max(254).required(),
  password: Joi.string().min(8).max(128).required(),
}).unknown(false);

const loginSchema = Joi.object({
  email: Joi.string().trim().email().max(254).required(),
  password: Joi.string().min(1).max(128).required(),
}).unknown(false);

const createToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");

  return jwt.sign(
    { id: userId.toString() },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
});

const signup = async (req, res) => {
  const { error, value } = signupSchema.validate(req.body, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  try {
    const email = value.email.toLowerCase();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({
      name: value.name,
      email,
      password: value.password,
    });

    return res.status(201).json({
      message: "Account created successfully",
      user: publicUser(user),
      token: createToken(user._id),
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    console.error("Signup failed:", error.message);
    return res.status(500).json({ message: "Unable to create account" });
  }
};

const login = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  try {
    const user = await User.findOne({ email: value.email.toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(value.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({
      message: "Login successful",
      user: publicUser(user),
      token: createToken(user._id),
    });
  } catch (error) {
    console.error("Login failed:", error.message);
    return res.status(500).json({ message: "Unable to log in" });
  }
};

module.exports = { signup, login };
