const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_123';

/**
 * --- REGISTRATION ROUTE ---
 */
router.post('/register', async (req, res) => {
  try {
    // 1. Force lowercase and trim to prevent spacing/casing issues
    const email = req.body.email.toLowerCase().trim();
    const { name, password, role } = req.body;

    // 2. Validation: Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // ======================================================================
    // FIX 1: REMOVED MANUAL BCRYPT HASHING HERE!
    // Your User.js model has a 'beforeCreate' hook that already hashes it.
    // Passing raw password here lets the model hash it exactly ONCE.
    // ======================================================================

    // 3. Database: Create user in MySQL
    // FIX 2: Defaults to 'user' instead of 'customer' to match your ENUM
    const newUser = await User.create({
      name,
      email,
      password, // Send plain text directly to let the model hooks do their job!
      role: role || 'user' 
    });

    res.status(201).json({ 
      message: "User registered successfully!",
      user: { id: newUser.id, name: newUser.name, role: newUser.role }
    });

  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

/**
 * --- LOGIN ROUTE ---
 */
router.post('/login', async (req, res) => {
  try {
    // Force lowercase and trim to match how we saved it
    const email = req.body.email.toLowerCase().trim();
    const { password } = req.body;

    console.log("=== LOGIN ATTEMPT ===");
    console.log("Looking for email:", email);

    // 1. Find User
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log("❌ User not found in DB");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ User found. DB Hashed Password:", user.password);

    // 2. Verify Password using your model's prototype helper
    // This compares your text password to the single-hashed database value
    const isMatch = await user.comparePassword(password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      console.log("❌ Password did not match");
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    console.log("🎉 Success! Logging in user role:", user.role);

    // 4. Send Response
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        role: user.role 
      } 
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = router;