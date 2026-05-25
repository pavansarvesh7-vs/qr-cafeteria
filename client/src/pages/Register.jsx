import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 📡 FIXED: Set default fallback to your real backend domain
  const SERVER_IP = import.meta.env.VITE_API_URL || "https://qr-cafeteria.onrender.com";
  const API_BASE = `${SERVER_IP}/api/auth`;
  const selectedRole = localStorage.getItem("userRoleChoice") || "user";
  const themeAccent = selectedRole === "admin" ? "#ff3d00" : "#03dac6"; 
  const themeGlow = selectedRole === "admin" ? "rgba(255,61,0,0.12)" : "rgba(3,218,198,0.12)";

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.toLowerCase().trim(), 
          password, 
          role: selectedRole 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Account created successfully! Redirecting to login page.");
        navigate("/login");
      } else {
        alert(data.message || "Registration failed. Please check your data form layout.");
      }
    } catch (error) {
      console.error("Network interface error:", error);
      alert(`Could not connect to the registration server at ${SERVER_IP}. Please ensure it is running.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.authPage}>
      <div style={styles.gridOverlay}></div>

      <div style={{ ...styles.authCard, borderColor: themeAccent, boxShadow: `0 20px 50px ${themeGlow}` }}>
        <div style={styles.statusBar}>
          <span style={{ color: themeAccent, fontWeight: "bold" }}>● NEW REGISTRATION</span>
          <span style={styles.secToken}>SECURE MODE</span>
        </div>

        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <span style={{ ...styles.roleLabel, backgroundColor: themeAccent }}>
            CREATE {selectedRole.toUpperCase()} ACCOUNT
          </span>
          <h1 style={styles.title}>Register</h1>
          <p style={styles.systemVersion}>ENTER YOUR DETAILS BELOW TO ACCESS THE PORTAL</p>
        </div>

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={{ ...styles.fieldLabel, color: themeAccent }}>FULL NAME</label>
            <input 
              type="text" 
              placeholder="e.g., Pavan Sarvesh" 
              style={styles.input}
              required 
              value={name}
              onChange={(e) => setName(e.target.value)} 
            />
          </div>

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
              placeholder="Minimum 8 characters..." 
              style={styles.input}
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.regBtn, 
              backgroundColor: themeAccent,
              boxShadow: loading ? "none" : `0 4px 14px ${themeAccent}44`
            }} 
            disabled={loading}
          >
            {loading ? "Creating your account..." : "Submit Registration"}
          </button>
        </form>

        <div style={styles.authFooter}>
          <p style={styles.footerPrompt}>Already have an account?</p>
          <Link to="/login" style={{ ...styles.link, color: themeAccent, borderBottomColor: themeAccent }}>
            Return to Sign In
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
    justifyContent: "center", 
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
    fontSize: "11px", 
    marginBottom: "25px", 
    borderBottom: "1px solid #1c2330", 
    paddingBottom: "12px", 
    letterSpacing: "0.5px", 
    justifyContent: 'space-between' 
  },
  secToken: { 
    color: "#64748b" 
  },
  roleLabel: { 
    color: "#000", 
    padding: "4px 12px", 
    borderRadius: "4px", 
    fontSize: "11px", 
    fontWeight: "700", 
    letterSpacing: "0.5px", 
    display: "inline-block" 
  },
  title: { 
    fontSize: "2.5rem", 
    margin: "15px 0 5px 0", 
    fontWeight: "900", 
    letterSpacing: "-1px" 
  },
  systemVersion: { 
    color: "#64748b", 
    fontSize: "11px", 
    margin: 0, 
    letterSpacing: "0.5px" 
  },
  form: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "20px" 
  },
  inputGroup: { 
    display: "flex", 
    flexDirection: "column", 
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
    outline: "none", 
    fontSize: "0.95rem",
    boxSizing: "border-box",
    transition: "border-color 0.2s"
  },
  regBtn: { 
    padding: "16px", 
    borderRadius: "6px", 
    border: "none", 
    color: "#000", 
    fontSize: "0.95rem", 
    fontWeight: "700", 
    cursor: "pointer", 
    marginTop: '10px', 
    transition: "all 0.2s", 
    letterSpacing: "0.5px" 
  },
  authFooter: { 
    textAlign: "center", 
    marginTop: "30px", 
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
    borderBottom: "1px solid transparent", 
    paddingBottom: "2px" 
  }
};

export default Register;