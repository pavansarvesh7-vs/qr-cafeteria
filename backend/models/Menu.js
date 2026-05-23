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
  // This allows us to see virtual fields when we convert to JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// --- VIRTUAL FIELD FOR IMAGE URL ---
// This automatically prepends the server IP so the frontend doesn't have to
MenuSchema.virtual('imageUrl').get(function() {
  if (!this.image) return null;
  const SERVER_IP = "172.20.10.4"; // Your Laptop's IP
  return `http://${SERVER_IP}:5000/uploads/${this.image}`;
});

export default mongoose.model("Menu", MenuSchema);