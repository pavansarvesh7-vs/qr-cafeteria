import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManageProducts.css";

const ManageProducts = ({ serverIp }) => {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", image: null });

  const API_URL = `http://${serverIp}:5000/api/products`;
  const IMAGE_BASE_URL = `http://${serverIp}:5000/uploads`;

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) { 
      console.error("Failed to load menu items:", err); 
    }
  };

  useEffect(() => { 
    fetchProducts(); 
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("price", newProduct.price);
    
    if (newProduct.image) {
      formData.append("image", newProduct.image);
    }

    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${currentProductId}`, formData);
      } else {
        await axios.post(`${API_URL}/add`, formData);
      }
      
      setNewProduct({ name: "", price: "", image: null });
      setShowAddForm(false);
      setIsEditing(false);
      fetchProducts();
    } catch (err) { 
      console.error(err);
      alert("Error: Failed to save menu item updates."); 
    }
  };

  const startEdit = (product) => {
    setIsEditing(true);
    setShowAddForm(true);
    setCurrentProductId(product.id || product._id);
    setNewProduct({ name: product.name, price: product.price, image: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this item from the menu?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchProducts();
      } catch (err) { 
        alert("Failed to delete the menu item."); 
      }
    }
  };

  return (
    <div className="manage-container">
      <div className="manage-header">
        <div>
          <h1>MENU ITEM <span className="accent-text">MANAGEMENT</span></h1>
          <p className="subtitle">Total Items on Menu: {products.length}</p>
        </div>
        <button className="add-main-btn" onClick={() => {
          setShowAddForm(!showAddForm);
          setIsEditing(false);
          setNewProduct({ name: "", price: "", image: null });
        }}>
          {showAddForm ? "✕ Cancel Action" : "+ Add New Dish / Drink"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSave} className="add-form-card animate-slide-down">
          <div className="form-group">
            <label>DISH NAME</label>
            <input type="text" placeholder="e.g., Veggie Burger or Hot Espresso" required value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
          </div>
          
          <div className="form-group">
            <label>ITEM PRICE (₹)</label>
            <input type="number" placeholder="180" required value={newProduct.price}
              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
          </div>
          
          <div className="form-group">
            <label>UPLOAD ITEM IMAGE {isEditing && "(Leave empty to keep current photo)"}</label>
            <input type="file" accept="image/*" onChange={(e) => setNewProduct({...newProduct, image: e.target.files[0]})} />
          </div>
          
          <button type="submit" className="save-btn">
            {isEditing ? "Save Updates to Menu Item" : "Publish Item to Live Menu"}
          </button>
        </form>
      )}

      <div className="asset-grid">
        {products.map((p) => (
          <div key={p.id || p._id} className="asset-card">
            <div className="image-container">
              <img 
                src={p.image ? `${IMAGE_BASE_URL}/${p.image}` : "https://via.placeholder.com/300x180/080808/333333?text=NO_IMAGE_UPLOADED"} 
                alt={p.name} 
                onError={(e) => { 
                  e.target.onerror = null; 
                  e.target.src = "https://via.placeholder.com/300x180/080808/333333?text=IMAGE_LOAD_ERROR";
                }}
              />
            </div>
            <div className="asset-info">
              <div>
                <div className="asset-tag">Food & Beverage</div>
                <div className="asset-title">{p.name}</div>
              </div>
              <div className="asset-price">₹{p.price}</div>
            </div>
            
            <div className="asset-actions">
              <button className="cyber-btn edit" onClick={() => startEdit(p)}>Edit Details</button>
              <button className="cyber-btn delete" onClick={() => handleDelete(p.id || p._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageProducts;