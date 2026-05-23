import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CartProvider } from './context/CartContext'; 
import './index.css'; // Global styles for reset/backgrounds

/**
 * THE VAULT - ROOT INITIALIZATION
 * Wrapping the App in CartProvider ensures that:
 * 1. Cart state persists during navigation.
 * 2. The "Tray" badge updates in real-time on the UserHome.
 * 3. Order data is ready when the user hits 'Checkout'.
 */

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>
);