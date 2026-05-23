const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// 1. GET ALL: Fetches all product entities
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// 2. PUT UPDATE: Modifies an existing asset
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Dish not found" });

    const { name, price } = req.body;
    let imageName = product.image;
    
    if (req.file) {
      imageName = req.file.filename;
    }

    await product.update({ name, price, image: imageName });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST ADD: For creating new entries
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { name, price } = req.body;
    const imageName = req.file ? req.file.filename : null;
    const product = await Product.create({ name, price, image: imageName });
    res.status(201).json(product);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// 4. 🔥 ADDED: DELETE PURGE ROUTE
router.delete('/:id', async (req, res, next) => {
  try {
    const productId = req.params.id;

    // Verify the product actually exists in the database first
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: "ASSET_NOT_FOUND", message: "Target ID missing from matrix registry." });
    }

    // Execute the destruction process
    await product.destroy();

    return res.status(200).json({ 
      status: "SUCCESS", 
      message: "ASSET_PURGED_FROM_CORE_REGISTER", 
      id: productId 
    });

  } catch (err) {
    // If Sequelize blocks this because the product is attached to an order history row
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        error: "FOREIGN_KEY_VIOLATION",
        message: "CANNOT PURGE ASSET: This item is linked to active order histories. Clear those dependencies first."
      });
    }
    
    // Pass other unexpected database errors cleanly down to server.js logger
    res.status(500).json({ error: "DATABASE_PURGE_FAILURE", details: err.message });
  }
});

module.exports = router;