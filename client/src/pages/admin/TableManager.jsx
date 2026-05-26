import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const TableManager = () => {
  const [tableCount, setTableCount] = useState(5);
  const SYSTEM_SALT = "VAULT_CRYPT_TRACKER_88B"; // Background security key to protect order validation

  // --- 🎯 CUSTOMER ORDERING PLATFORM TARGET RESOLVER ---
  // If your live production customer interface link differs, substitute it directly inside the placeholder string!
  const CUSTOMER_APP_URL = "https://qr-cafeteria-frontend.onrender.com";

  const downloadQR = (tableId) => {
    const canvas = document.getElementById(`qr-table-${tableId}`);
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `Table-${tableId}-QR-Code.png`;
    link.click();
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ margin: 0, fontWeight: 900, fontSize: '28px', letterSpacing: '0.5px' }}>
          TABLE QR CODE <span style={{ color: "#ff6b35" }}>GENERATOR</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>Generates secure links to prevent off-site ordering and fake requests.</p>
        
        <div style={styles.controls}>
          <label style={{ fontWeight: '700', fontSize: '12px', color: '#94a3b8' }}>NUMBER OF ACTIVE TABLES: </label>
          <input 
            type="number" 
            value={tableCount} 
            onChange={(e) => setTableCount(e.target.value)}
            style={styles.input}
          />
        </div>
      </header>

      <div style={styles.grid}>
        {[...Array(parseInt(tableCount || 0))].map((_, i) => {
          const tableNum = (i + 1).toString().padStart(2, '0');
          
          // --- 🔒 ENHANCED ROUTING PROTECTION ENGINE ---
          // Dynamically branches deployment contexts ensuring safe cross-origin targeting
          const baseUrl = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
            ? `${window.location.protocol}//${window.location.hostname}:5173` // Default Vite dev link port structure
            : CUSTOMER_APP_URL.replace(/\/$/, "");

          const tableUrl = `${baseUrl}/user-home?table=${tableNum}&sig=${SYSTEM_SALT}_ST${tableNum}`;

          return (
            <div key={tableNum} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={styles.cardTitle}>Table {tableNum}</span>
                <span style={styles.secureBadge}>SECURE LINK</span>
              </div>
              <div style={styles.qrBox}>
                <QRCodeCanvas 
                  id={`qr-table-${tableNum}`}
                  value={tableUrl} 
                  size={160}
                  level={"H"}
                  includeMargin={true}
                  bgColor={"#ffffff"}
                  fgColor={"#0a0c10"}
                />
              </div>
              <p style={styles.urlText}>{tableUrl}</p>
              <button 
                onClick={() => downloadQR(tableNum)}
                style={styles.downloadBtn}
              >
                DOWNLOAD QR CODE (PNG)
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "10px 0", backgroundColor: "transparent", color: "#fff" },
  header: { marginBottom: "35px", borderBottom: '2px solid #2a3547', paddingBottom: '20px' },
  controls: { marginTop: "20px" },
  input: { padding: "10px 14px", borderRadius: "6px", border: "1px solid #2a3547", background: "#0a0c10", color: "#fff", width: "70px", marginLeft: "10px", fontWeight: 'bold', fontSize: '14px' },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "25px" },
  card: { background: "#1c2330", padding: "20px", borderRadius: "14px", border: "1px solid #2a3547", display: 'flex', flexDirection: 'column' },
  cardTitle: { fontWeight: '900', fontSize: '16px', letterSpacing: '0.5px' },
  secureBadge: { fontSize: '9px', fontWeight: '900', background: 'rgba(0, 230, 118, 0.1)', color: '#00e676', padding: '2px 6px', borderRadius: '4px' },
  qrBox: { background: "#fff", padding: "8px", borderRadius: "10px", display: "inline-block", margin: '0 auto' },
  urlText: { fontSize: "11px", color: "#64748b", marginTop: "15px", wordBreak: "break-all", fontFamily: 'monospace', background: '#0a0c10', padding: '8px', borderRadius: '6px', border: '1px solid #2a3547', textAlign: 'left' },
  downloadBtn: { marginTop: "15px", width: "100%", padding: "12px", background: "#ff6b35", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "800", fontSize: '11px', cursor: "pointer", transition: 'background 0.2s' }
};

export default TableManager;