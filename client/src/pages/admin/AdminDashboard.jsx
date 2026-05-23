import React, { useState, useEffect, useRef } from "react";
import ManageProducts from "./ManageProducts";
import Orders from "./Orders";
import TableManager from "./TableManager";
import axios from "axios";
import "./AdminDashboard.css";
import AdminServiceAlerts from "./AdminServiceAlerts";
import ThreeDCanvas from "./ThreeDCanvas";

// Notification sound for incoming alerts/orders
const ALERT_BELL_AUDIO = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, liveOrders: 0, activeTables: 0 });
  const [surgeActive, setSurgeActive] = useState(false);
  const [isServerOnline, setIsServerOnline] = useState(true);
  
  // Track toggle drawer navigation layout on small screens
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const SERVER_IP = "172.20.10.4"; 
  const API_URL = `http://${SERVER_IP}:5000/api`;
  
  const prevOrderCount = useRef(0);
  const prevServiceCount = useRef(0);

  const fetchDashboardData = async () => {
    try {
      const serviceRes = await axios.get(`${API_URL}/service`, { timeout: 3000 });
      const currentServices = Array.isArray(serviceRes.data) ? serviceRes.data : [];
      setNotifications(currentServices);

      const orderRes = await axios.get(`${API_URL}/orders`, { timeout: 3000 });
      const allOrders = Array.isArray(orderRes.data) ? orderRes.data : [];

      const pendingOrders = allOrders.filter(o => o.status === "Pending" || o.status === "Preparing" || o.status === "Plating");
      const totalRev = allOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
      const uniqueTables = new Set(pendingOrders.map(o => o.tableId)).size;

      if (pendingOrders.length > prevOrderCount.current || currentServices.length > prevServiceCount.current) {
        ALERT_BELL_AUDIO.play().catch(() => console.log("Audio alert waiting for user interaction initialization."));
      }

      prevOrderCount.current = pendingOrders.length;
      prevServiceCount.current = currentServices.length;

      setStats({ revenue: totalRev, liveOrders: pendingOrders.length, activeTables: uniqueTables });
      setIsServerOnline(true);
    } catch (err) {
      console.error("Dashboard synchronization error:", err.message);
      setIsServerOnline(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const acknowledgeRequest = async (id) => {
    try {
      await axios.put(`${API_URL}/service/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      prevServiceCount.current = Math.max(0, prevServiceCount.current - 1); 
    } catch (err) {
      console.error("Error clearing table request:", err);
    }
  };

  const handleNavClick = (section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>MANAGEMENT</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className={`status-indicator ${isServerOnline ? "online" : "offline"}`}>
              {isServerOnline ? "CONNECTED" : "DISCONNECTED"}
            </span>
            <button 
              className="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
        
        <nav className={`sidebar-nav ${mobileMenuOpen ? "mobile-expanded" : ""}`}>
          <button className={activeSection === "dashboard" ? "nav-link active" : "nav-link"} onClick={() => handleNavClick("dashboard")}>OVERVIEW DASHBOARD</button>
          <button className={activeSection === "alerts" ? "nav-link active" : "nav-link"} onClick={() => handleNavClick("alerts")}>
            TABLE REQUESTS {notifications.length > 0 && <span className="badge urgent">{notifications.length}</span>}
          </button>
          <button className={activeSection === "menu" ? "nav-link active" : "nav-link"} onClick={() => handleNavClick("menu")}>MANAGE MENU</button>
          <button className={activeSection === "orders" ? "nav-link active" : "nav-link"} onClick={() => handleNavClick("orders")}>
            KITCHEN ORDERS {stats.liveOrders > 0 && <span className="badge">{stats.liveOrders}</span>}
          </button>
          <button className={activeSection === "tables" ? "nav-link active" : "nav-link"} onClick={() => handleNavClick("tables")}>TABLE QR CODES</button>
        </nav>

        <div className={`sidebar-alerts ${mobileMenuOpen ? "mobile-expanded" : ""}`}>
          <label>ACTIVE CALLS ({notifications.length})</label>
          <div className="alert-scroll-zone">
            {notifications.length > 0 ? notifications.map(n => (
              <div key={n.id || n._id} className="alert-item pulse" onClick={() => acknowledgeRequest(n.id || n._id)}>
                <span className="alert-type">{n.request_type || "🚨 ASSISTANCE"}</span>
                <span className="alert-table">Table {n.table_id || n.tableId}</span>
              </div>
            )) : <p className="no-alerts">No active table calls.</p>}
          </div>
        </div>
      </aside>

      <main className="main-content">
        {!isServerOnline && (
          <div className="server-disconnect-banner">
            ⚠️ CONNECTION ERROR: Unable to reach the restaurant system server at {SERVER_IP}:5000. Please check your network or restart the database service.
          </div>
        )}

        {activeSection === "dashboard" && (
          <div className="overview-section">
            <header className="content-header layout-split">
              <div>
                <h2>RESTAURANT OVERVIEW</h2>
                <p className="ip-display">Local Server Connection Address: {SERVER_IP}</p>
              </div>
              
              <div className={`surge-control-deck ${surgeActive ? "active" : ""}`}>
                <div className="text">
                  <span className="title">PEAK HOURS PRICING</span>
                  <span className="desc">{surgeActive ? "⚡ +10% Peak Rate Enabled" : "🟢 Standard Pricing Active"}</span>
                </div>
                <button onClick={() => setSurgeActive(!surgeActive)} className="surge-toggle-btn">
                  {surgeActive ? "DISABLE" : "ACTIVATE PEAK"}
                </button>
              </div>
            </header>
            
            <div className="metric-grid">
              <div className="metric-card">
                <label>TOTAL EARNINGS (TODAY)</label>
                <div className="value">₹{stats.revenue.toLocaleString()}</div>
              </div>
              <div className="metric-card highlight">
                <label>ACTIVE LIVE ORDERS</label>
                <div className="value">{stats.liveOrders}</div>
              </div>
              <div className="metric-card">
                <label>CURRENTLY SEATED TABLES</label>
                <div className="value">{stats.activeTables}</div>
              </div>
            </div>

            <div className="service-queue">
              <header className="content-header" style={{marginTop: '40px'}}>
                <h2>LIVE TABLE ASSISTANCE QUEUE</h2>
              </header>
              <div className="queue-list">
                {notifications.length > 0 ? notifications.map(n => (
                  <div key={n.id || n._id} className="queue-card buzzer-border">
                    <div className="queue-info">
                      <span className="q-table">TABLE {n.table_id || n.tableId}</span>
                      <span className="q-detail">{n.request_type || "Server assistance requested"}</span>
                    </div>
                    <button className="q-action" onClick={() => acknowledgeRequest(n.id || n._id)}>MARK AS RESOLVED</button>
                  </div>
                )) : (
                  <div className="no-data-card">
                    <p className="no-data">All customers are currently satisfied. System running smoothly. ✅</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeSection === "alerts" && <AdminServiceAlerts />}
        {activeSection === "menu" && <ManageProducts serverIp={SERVER_IP} />}
        {activeSection === "orders" && <Orders serverIp={SERVER_IP} />}
        {activeSection === "tables" && <TableManager serverIp={SERVER_IP} />}
      </main>
    </div>
  );
};

export default AdminDashboard;