import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function RoleSelection() {
  const navigate = useNavigate();
  const [hoveredRole, setHoveredRole] = useState(null);

  const handleRoleChoice = (role) => {
    localStorage.setItem("userRoleChoice", role);
    navigate("/login");
  };

  return (
    <div style={styles.authPage}>
      <div style={styles.ambientGlow}></div>
      <div style={styles.scanGrid}></div>

      <div style={styles.authCard}>
        <header style={styles.brandHeader}>
          <div style={styles.topBarDecoration}></div>
          <h1 style={styles.logo}>VAULT</h1>
          <p style={styles.subtitle}>SELECT YOUR PORTAL</p>
        </header>
        
        <div style={styles.roleGrid}>
          {/* CUSTOMER PORTAL OPTION */}
          <button 
            style={{
              ...styles.roleBtn,
              ...(hoveredRole === "user" ? styles.customerHover : {})
            }} 
            onClick={() => handleRoleChoice("user")}
            onMouseEnter={() => setHoveredRole("user")}
            onMouseLeave={() => setHoveredRole(null)}
          >
            <div style={styles.cardHeader}>
              <span style={styles.roleLabel}>CUSTOMER PANEL</span>
              <span style={styles.nodeStatus}>● ACTIVE</span>
            </div>
            
            <div style={{...styles.iconBox, color: "#bb86fc", textShadow: "0 0 15px rgba(187,134,252,0.3)"}}>
              🍽️
            </div>
            
            <div style={styles.textGroup}>
              <span style={styles.title}>Digital Menu</span>
              <span style={styles.desc}>Browse restaurant items, customize food choices, and monitor order prep progress live.</span>
            </div>
            <div style={{...styles.cardFooterAccent, backgroundColor: "#bb86fc"}}></div>
          </button>

          {/* ADMIN MANAGEMENT PORTAL OPTION */}
          <button 
            style={{
              ...styles.roleBtn,
              ...(hoveredRole === "admin" ? styles.adminHover : {})
            }} 
            onClick={() => handleRoleChoice("admin")}
            onMouseEnter={() => setHoveredRole("admin")}
            onMouseLeave={() => setHoveredRole(null)}
          >
            <div style={styles.cardHeader}>
              <span style={{...styles.roleLabel, color: "#03dac6", borderColor: "rgba(3,218,198,0.3)"}}>ADMIN HUB</span>
              <span style={{...styles.nodeStatus, color: "#03dac6"}}>● AUTHORIZED ONLY</span>
            </div>
            
            <div style={{...styles.iconBox, color: "#03dac6", textShadow: "0 0 15px rgba(3,218,198,0.3)"}}>
              📊
            </div>
            
            <div style={styles.textGroup}>
              <span style={styles.title}>Management Terminal</span>
              <span style={styles.desc}>Update menu product stock settings, organize ongoing orders, and view kitchen throughput analytics.</span>
            </div>
            <div style={{...styles.cardFooterAccent, backgroundColor: "#03dac6"}}></div>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  authPage: {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",     /* Centers content horizontally */
    justifyContent: "center",   /* Centers content vertically */
    backgroundColor: "#030406",
    color: "#fff",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box"
  },
  ambientGlow: {
    position: "absolute",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(187,134,252,0.02) 0%, transparent 70%)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none"
  },
  scanGrid: { 
    position: "absolute", 
    top: 0, left: 0, 
    width: "100%", height: "100%", 
    background: "linear-gradient(rgba(28, 35, 48, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(28, 35, 48, 0.2) 1px, transparent 1px)", 
    backgroundSize: "50px 50px", 
    opacity: 0.4, 
    pointerEvents: "none" 
  },
  authCard: {
    width: "100%",
    maxWidth: "720px",
    zIndex: 5,
    boxSizing: "border-box"
  },
  brandHeader: { 
    marginBottom: "50px", 
    textAlign: "center",
    position: "relative"
  },
  topBarDecoration: {
    width: "40px",
    height: "2px",
    backgroundColor: "#1c2330",
    margin: "0 auto 20px auto"
  },
  logo: { 
    fontSize: "clamp(3rem, 10vw, 4.5rem)", 
    letterSpacing: "16px", 
    fontWeight: "900", 
    margin: 0,
    color: "#fff",
    textShadow: "0 0 20px rgba(255,255,255,0.05)"
  },
  subtitle: { 
    color: "#64748b", 
    letterSpacing: "2px", 
    fontSize: "11px", 
    marginTop: "14px",
    fontWeight: "700" 
  },
  roleGrid: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
    gap: "25px",
    width: "100%"
  },
  roleBtn: {
    background: "#090d16",
    border: "1px solid #1c263c",
    borderRadius: "8px",
    padding: "35px 25px",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
    color: "#fff",
    outline: "none",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box"
  },
  cardHeader: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    fontSize: "11px",
    letterSpacing: "0.5px"
  },
  roleLabel: {
    color: "#bb86fc",
    border: "1px solid rgba(187,134,252,0.3)",
    padding: "4px 10px",
    borderRadius: "4px",
    background: "rgba(0,0,0,0.2)",
    fontWeight: "700"
  },
  nodeStatus: {
    color: "#64748b",
    fontWeight: "600"
  },
  iconBox: { 
    fontSize: "2.2rem", 
    marginBottom: "25px"
  },
  textGroup: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "10px" 
  },
  title: { 
    fontSize: "1.25rem", 
    fontWeight: "800",
    letterSpacing: "0.5px",
    color: "#fff"
  },
  desc: { 
    fontSize: "13px", 
    color: "#8fa0bc", 
    lineHeight: "1.6"
  },
  cardFooterAccent: {
    position: "absolute",
    bottom: 0, left: 0, 
    width: "100%", height: "4px",
    opacity: 0.2,
    transition: "all 0.3s ease"
  },
  customerHover: {
    borderColor: "#bb86fc",
    transform: "translateY(-4px)",
    background: "rgba(187,134,252, 0.02)",
    boxShadow: "0 12px 30px rgba(187,134,252, 0.08)"
  },
  adminHover: {
    borderColor: "#03dac6",
    transform: "translateY(-4px)",
    background: "rgba(3,218,198, 0.02)",
    boxShadow: "0 12px 30px rgba(3,218,198, 0.08)"
  }
};

export default RoleSelection;