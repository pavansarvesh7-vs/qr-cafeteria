import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import RoleSelection from "./pages/RoleSelection"; 
import Login from "./pages/Login";
import Register from "./pages/Register";

// Modules
import UserHome from "./pages/user/UserHome"; 
import Cart from "./pages/user/Cart";
import UserStatus from "./pages/user/UserStatus"; 
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminServiceAlerts from "./pages/admin/AdminServiceAlerts"; // Make sure to save the file in your pages/admin folder!

/**
 * Helper component to extract :orderId from the URL 
 * and pass it to the UserStatus component as a prop.
 */
const OrderStatusWrapper = () => {
  const { orderId } = useParams();
  return <UserStatus orderId={orderId} />;
};

function App() {
  // Simple check for authentication (Optional but recommended)
  const isAuthenticated = () => !!localStorage.getItem("token");
  const isAdmin = () => localStorage.getItem("role") === "admin";

  return (
    <BrowserRouter>
      <Routes>
        {/* --- 1. AUTHENTICATION & ENTRY --- */}
        <Route path="/" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- 2. CUSTOMER MODULE --- */}
        {/* Users can access via /user or /user-home */}
        <Route path="/user" element={<UserHome />} /> 
        <Route path="/user-home" element={<UserHome />} /> 
        <Route path="/cart" element={<Cart />} />
        
        {/* LIVE TRACKER: Uses the wrapper to grab the ID from the URL */}
        <Route path="/order-status/:orderId" element={<OrderStatusWrapper />} />

        {/* --- 3. ADMIN MODULE --- */}
        {/* Using a wildcard (*) for AdminDashboard allows it to handle 
           its own internal sub-routes (Menu, Orders, etc.) 
        */}
        <Route path="/admin/*" element={<AdminDashboard />} />

        {/* --- 4. REDIRECTS & SAFETY --- */}
        {/* If user hits an unknown route, send them back to the start */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;