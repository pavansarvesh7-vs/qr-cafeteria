import mongoose from "mongoose";

const MenuSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Product name is required"],
    trim: true 
  },
  description: { 
    type: String,
    trim: true 
  },
  price: { 
    type: Number, 
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"]
  },
  category: { 
    type: String, 
    required: [true, "Category is required"],
    enum: ["Starter", "Main Course", "Dessert", "Beverage", "Sides"],
    default: "Main Course"
  },
  image: { 
    type: String, 
    default: null // Stores the filename from Multer
  },
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// --- VIRTUAL FIELD FOR IMAGE URL ---
// Dynamically builds the image link depending on whether it's local or live on Render
MenuSchema.virtual('imageUrl').get(function() {
  if (!this.image) return null;
  
  // Checks if running live on Render, otherwise falls back to local machine
  const backendUrl = process.env.NODE_ENV === 'production' 
    ? "https://qr-cafeteria-backend.onrender.com" 
    : "http://localhost:5000";

  return `${backendUrl}/uploads/${this.image}`;
});

export default mongoose.model("Menu", MenuSchema);