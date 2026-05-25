import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminServiceAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FIXED DYNAMIC ENVIRONMENT URL ROUTING LAYER ---
  const SERVER_IP = import.meta.env.VITE_API_URL || "https://qr-cafeteria-backend.onrender.com"; 
  
  const API_BASE = SERVER_IP.includes("onrender.com")
    ? `${SERVER_IP}/api/service`
    : `http://localhost:5000/api/service`;

  const fetchActiveAlerts = async () => {
    try {
      const res = await axios.get(API_BASE);
      setAlerts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to sync customer alerts:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveAlerts();
    const interval = setInterval(fetchActiveAlerts, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (id) => {
    try {
      const res = await axios.put(`${API_BASE}/${id}`);
      if (res.data.success) {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id));
      }
    } catch (err) {
      alert("Error marking this request as completed.");
    }
  };

  // Modern hook deployment dynamically tracking layout viewport widths
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ ...styles.container, padding: isMobile ? "15px" : "30px" }}>
      <div style={{ ...styles.hudHeader, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: "10px" }}>
        <h2 style={{ ...styles.title, fontSize: isMobile ? "1.1rem" : "1.3rem" }}>⚠️ Live Customer Service Requests</h2>
        <span style={styles.badge}>{alerts.length} Active Calls</span>
      </div>

      {loading ? (
        <p style={styles.infoText}>Loading live updates from tables...</p>
      ) : alerts.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={{ color: "#00ff41", margin: 0, letterSpacing: "1px", fontSize: isMobile ? "11px" : "13px" }}>✓ All tables are satisfied. No pending assistance requests.</p>
        </div>
      ) : (
        <div style={styles.listStack}>
          {alerts.map((alertItem) => (
            <div key={alertItem.id || alertItem._id} style={{ ...styles.alertCard, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? "15px" : "30px" }}>
              <div style={styles.metaSide}>
                <span style={styles.tableTag}>Table {alertItem.table_id}</span>
                <span style={styles.timeTag}>
                  Called at: {new Date(alertItem.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              
              <div style={{ ...styles.payloadSide, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", width: isMobile ? "100%" : "auto", justifyContent: "space-between" }}>
                <div style={styles.requestType}>
                  Service Needed: <span style={styles.typeHighlight}>{alertItem.request_type}</span>
                </div>
                <button style={{ ...styles.resolveBtn, width: isMobile ? "100%" : "auto", padding: isMobile ? "12px" : "10px 18px" }} onClick={() => handleResolve(alertItem.id || alertItem._id)}>
                  Mark as Handled
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { background: "#030406", minHeight: "100vh", color: "#fff", fontFamily: "sans-serif", boxSizing: "border-box" },
  hudHeader: { display: "flex", borderBottom: "1px dashed #1c263c", paddingBottom: "15px", marginBottom: "20px" },
  title: { fontWeight: "900", letterSpacing: "0.5px", margin: 0, color: "#ff3b30" },
  badge: { background: "rgba(255, 59, 48, 0.15)", border: "1px solid #ff3b30", color: "#ff3b30", padding: "4px 10px", fontSize: "11px", borderRadius: "3px", fontWeight: "bold" },
  infoText: { color: "#4f5e75", fontSize: "13px" },
  emptyBox: { border: "1px solid #00ff41", background: "rgba(0, 255, 65, 0.02)", padding: "25px", textAlign: "center", borderRadius: "4px" },
  listStack: { display: "flex", flexDirection: "column", gap: "15px" },
  alertCard: { background: "#090d16", border: "1px solid #1c263c", borderRadius: "4px", display: "flex", justifyContent: "space-between", padding: "20px", boxSizing: "border-box" },
  metaSide: { display: "flex", flexDirection: "column", gap: "6px" },
  tableTag: { color: "#00e5ff", fontWeight: "bold", fontSize: "16px", letterSpacing: "0.5px" },
  timeTag: { color: "#4f5e75", fontSize: "12px" },
  payloadSide: { display: "flex", gap: "20px", flexGrow: 1 },
  requestType: { fontSize: "14px", color: "#8fa0bc", letterSpacing: "0.5px" },
  typeHighlight: { color: "#ffc107", fontWeight: "bold" },
  resolveBtn: { background: "#00ff41", color: "#000", border: "none", fontWeight: "bold", borderRadius: "4px", cursor: "pointer", fontSize: "12px", letterSpacing: "0.5px" }
};

export default AdminServiceAlerts;