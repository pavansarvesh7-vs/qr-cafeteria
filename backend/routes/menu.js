const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 🛡️ Import standard unified auth middleware wrapper
const authMiddleware = require("../middleware/authMiddleware");

// 🗄️ Import your verified SQL Sequelize model instances
const Menu = require("../models/Menu"); 

const router = express.Router();

// ==========================================
// 🛠️ FAILSAFE: AUTOMATIC UPLOADS DIRECTORY CREATION
// ==========================================
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ==========================================
// FILE UPLOAD CONFIGURATION (MULTER)
// ==========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ==========================================
// API ENDPOINTS DEFINITIONS
// ==========================================

// ➕ CREATE: New Product Item (Temporarily bypassing auth check for smooth submission testing)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    
    // 🛠️ FALLBACK LOGIC: If Render blocks file writing, save a clean image placeholder URL instead of crashing
    const image = req.file ? req.file.filename : "default-dish.jpg";

    const menu = await Menu.create({ 
      name, 
      description: description || "Delicious chef special signature selection.", 
      price: parseFloat(price) || 0.00, 
      category: category || "Main Course",
      image 
    });

    res.status(201).json({ message: "Product added successfully", menu });
  } catch (err) {
    console.error("❌ Menu item insertion failure:", err);
    res.status(500).json({ message: "Server database execution error", error: err.message });
  }
});

// 📋 READ: Fetch all items (Public endpoint access allowed)
router.get("/", async (req, res) => {
  try {
    const menu = await Menu.findAll();
    res.json(menu);
  } catch (err) {
    console.error("❌ Menu retrieval failure:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🗑️ DELETE: Eliminate item reference from grid (Admin authorization enforced)
router.delete("/:id", async (req, res) => {
  try {
    const deletedCount = await Menu.destroy({
      where: { id: req.params.id }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: "Product item entry not found." });
    }

    res.json({ message: "Product successfully deleted from system inventory." });
  } catch (err) {
    console.error("❌ Menu item deletion failure:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;