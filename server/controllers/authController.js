const User = require("../models/Users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Role = require("../models/Role");

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Register
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role: roleName } = req.body;

    // Validate role name
    const roleDoc = await Role.findOne({ name: roleName });
    if (!roleDoc) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Check if user already exists by phone (email is optional but unique if provided)
    const existingByPhone = await User.findOne({ phone });
    if (existingByPhone) {
      return res.status(400).json({ message: "Phone already exists" });
    }
    if (email) {
      const existingByEmail = await User.findOne({ email });
      if (existingByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Only include email if provided
    const userData = {
      name,
      phone,
      password: hashedPassword,
      role: roleDoc._id,
    };
    if (email) {
      userData.email = email;
    }

    const user = await User.create(userData);

    // Populate for response
    const populatedUser = await User.findById(user._id).populate("role");

    res.status(201).json({ message: "User registered successfully", user: populatedUser });
  } catch (error) {
    res.status(400).json({ message: "Error registering user", error: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    let query = {};
    if (email) query.email = email;
    if (phone) query.phone = phone;

    if (!Object.keys(query).length) {
      return res.status(400).json({ message: "Email or phone is required" });
    }

    const user = await User.findOne(query).populate("role");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Logout
const logout = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

// Current User
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("role");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
