import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0); 
  const navigate = useNavigate();
  
const SERVER_IP = import.meta.env.VITE_API_URL || "https://qr-cafeteria-backend.onrender.com";
const API_BASE = `${SERVER_IP}/api/auth`;
  const selectedRole = localStorage.getItem("userRoleChoice") || "user";
  const themeAccent = selectedRole === "admin" ? "#ff3d00" : "#ff6b35"; 
  const themeGlow = selectedRole === "admin" ? "rgba(255,61,0,0.12)" : "rgba(255,107,53,0.12)";

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + 20;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);

        if (data.user.role === "admin") {
          navigate("/admin/dashboard"); 
        } else {
          navigate("/user-home"); 
        }
      } else {
        alert(data.message || "Invalid email or password. Please try again.");
      }
    } catch (error) {
      console.error("Network interface error:", error);
      alert(`Could not connect to the authentication server at ${SERVER_IP}. Please ensure it is running.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.authPage}>
      <div style={styles.gridOverlay}></div>

      <div style={{ ...styles.authCard, borderColor: themeAccent, boxShadow: `0 20px 50px ${themeGlow}` }}>
        <div style={styles.statusBar}>
          <span style={{ color: themeAccent, fontWeight: "bold" }}>● SYSTEM READY</span>
          <span style={styles.bootText}>Initializing: {loadingProgress}%</span>
        </div>

        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <span style={{ ...styles.roleLabel, backgroundColor: themeAccent }}>
            {selectedRole.toUpperCase()} PORTAL
          </span>
          <h1 style={styles.title}>The <span style={{color: themeAccent}}>Vault</span></h1>
          <p style={styles.systemVersion}>DIGITAL MANAGEMENT HUB V3.0</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={{ ...styles.fieldLabel, color: themeAccent }}>EMAIL ADDRESS</label>
            <input
              type="email"
              placeholder="name@example.com"
              style={styles.input}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={{ ...styles.fieldLabel, color: themeAccent }}>PASSWORD</label>
            <input
              type="password"
              placeholder="••••••••••••"
              style={styles.input}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.loginBtn, 
              backgroundColor: themeAccent,
              boxShadow: loading ? "none" : `0 4px 14px ${themeAccent}44`
            }}
            disabled={loading || loadingProgress < 100}
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>

        <div style={styles.authFooter}>
          <p style={styles.footerPrompt}>Need access to this portal?</p>
          <Link to="/register" style={{ ...styles.link, color: themeAccent, borderBottomColor: themeAccent }}>
            Create a New Account
          </Link>
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
    alignItems: "center", 
    justifyContent: "center", /* Fixed from layout bug: duplicate 'justify' replaced with standard property */
    backgroundColor: "#050608", 
    color: "#fff", 
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box"
  },
  gridOverlay: {
    position: "absolute",
    width: "200%",
    height: "200%",
    background: "linear-gradient(rgba(28, 35, 48, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(28, 35, 48, 0.3) 1px, transparent 1px)",
    backgroundSize: "30px 30px",
    transform: "rotateX(60deg) translateY(-20%)",
    opacity: 0.6,
    zIndex: 1
  },
  authCard: { 
    width: "100%", 
    maxWidth: "420px", 
    padding: "35px", 
    backgroundColor: "#0b0d13", 
    borderRadius: "12px", 
    border: "2px solid #1c2330", 
    zIndex: 10,
    transition: "all 0.5s ease",
    boxSizing: "border-box"
  },
  statusBar: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    marginBottom: "25px",
    borderBottom: "1px solid #1c2330",
    paddingBottom: "12px",
    letterSpacing: "0.5px"
  },
  bootText: {
    color: "#64748b"
  },
  roleLabel: { 
    color: "#fff", 
    padding: "4px 12px", 
    borderRadius: "4px", 
    fontSize: "11px", 
    fontWeight: "700", 
    letterSpacing: '0.5px',
    display: "inline-block"
  },
  title: { 
    fontSize: "2.5rem", 
    margin: "15px 0 5px 0", 
    fontWeight: '900', 
    letterSpacing: '-1px'
  },
  systemVersion: {
    color: '#64748b', 
    fontSize: '11px', 
    margin: 0,
    letterSpacing: "0.5px"
  },
  form: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "20px" 
  },
  inputGroup: { 
    display: 'flex', 
    flexDirection: 'column',
    gap: "8px"
  },
  fieldLabel: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.5px"
  },
  input: { 
    padding: "14px 16px", 
    borderRadius: "6px", 
    border: "1px solid #2a3547", 
    backgroundColor: "#020305", 
    color: "#fff", 
    outline: 'none', 
    fontSize: '0.95rem',
    transition: "border-color 0.2s",
    boxSizing: "border-box"
  },
  loginBtn: { 
    padding: "16px", 
    borderRadius: "6px", 
    border: "none", 
    color: "#fff", 
    fontWeight: "700", 
    cursor: "pointer", 
    fontSize: '0.95rem', 
    marginTop: '10px', 
    transition: 'all 0.2s',
    letterSpacing: "0.5px"
  },
  authFooter: {
    textAlign: 'center', 
    marginTop: '30px',
    borderTop: "1px solid #1c2330",
    paddingTop: "20px"
  },
  footerPrompt: {
    color: "#64748b",
    fontSize: "13px",
    margin: "0 0 8px 0"
  },
  link: { 
    textDecoration: "none", 
    fontSize: "13px", 
    fontWeight: "700",
    borderBottom: '1px solid transparent',
    paddingBottom: "2px"
  }
};

export default Login;