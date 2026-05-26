import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import GridBackground from "./GridBackground";

function UserStatus() {
  const { orderId } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tableId = queryParams.get("table") || "01";

  const activeOrderId = orderId || localStorage.getItem("latest_vault_order_id");

  const [order, setOrder] = useState(null);
  const [isError, setIsError] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const [isErrorBtnHovered, setIsErrorBtnHovered] = useState(false);

  // --- PERFECTED CORRECTED BASE URL MATRICES ---
  // Uses Vite env context configurations first, falling back to your verified root domain production service
  const API_BASE = import.meta.env.VITE_API_URL || "https://qr-cafeteria.onrender.com";
  const API_URL = `${API_BASE}/api/orders`;
  const returnToMenuRoute = `/user-home?table=${tableId}`;

  // Direct Redirection Sentinel
  useEffect(() => {
    if (!activeOrderId) {
      console.warn("No active order token in memory. Routing back to menu terminal.");
      navigate(returnToMenuRoute, { replace: true });
    }
  }, [activeOrderId, navigate, returnToMenuRoute]);

  // Synchronized API Status Pipeline Connection
  useEffect(() => {
    if (!activeOrderId) return;

    const fetchOrderStatus = async () => {
      try {
        const res = await axios.get(`${API_URL}/status/${activeOrderId}`);
        setOrder(res.data);
        setIsError(false);

        // Calculate precise elapsed session time directly using the server database timestamp
        if (res.data?.createdAt) {
          const startTime = new Date(res.data.createdAt).getTime();
          const currentTime = new Date().getTime();
          const difference = Math.floor((currentTime - startTime) / 1000);
          
          // Safeguard against local machine clock out-of-sync deviations
          setElapsedSeconds(difference > 0 ? difference : 0);
        }
      } catch (err) {
        console.error("Radar link telemetry packet loss:", err);
        setIsError(true);
      }
    };

    fetchOrderStatus();
    const interval = setInterval(fetchOrderStatus, 4000);
    return () => clearInterval(interval);
  }, [activeOrderId, API_URL]);

  // Chronological Session Timer Engine (Runs only while processing)
  useEffect(() => {
    if (!activeOrderId || isError || order?.status === "Completed") return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeOrderId, isError, order?.status]);

  const formatTime = (totalSeconds) => {
    if (totalSeconds < 0) return "00:00";
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isError || !activeOrderId) {
    return (
      <div style={styles.fullScreenCenter}>
        <GridBackground />
        <div style={styles.cardStyle}>
          <div style={{...styles.hudHeaderDecoration, borderColor: '#ff3b30', color: '#ff3b30', background: 'rgba(255,59,48,0.05)'}}>TELEMETRY ERROR</div>
          <h2 style={{color: '#ff3b30', marginTop: '20px', fontFamily: "'Share Tech Mono', monospace", fontSize: '1.5rem'}}>LINK DISCONNECTED</h2>
          <p style={{color: '#657795', fontSize: '13px', fontFamily: "'Share Tech Mono', monospace", lineHeight: '1.5'}}>Unable to sync with order token node via backend route matrix.</p>
          <button 
            type="button"
            onClick={() => navigate(returnToMenuRoute)} 
            onMouseEnter={() => setIsErrorBtnHovered(true)}
            onMouseLeave={() => setIsErrorBtnHovered(false)}
            style={{
              ...styles.menuReturnBtn,
              color: '#ff3b30',
              borderColor: '#ff3b30',
              background: isErrorBtnHovered ? 'rgba(255, 59, 48, 0.1)' : 'transparent',
              boxShadow: isErrorBtnHovered ? '0 0 15px rgba(255, 59, 48, 0.3)' : 'none'
            }}
          >
            RETURN TO TERMINAL MENU
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.containerStyle}>
      <GridBackground />
      <div style={styles.contentSuperstructure}>
        <header style={styles.globalHeader}>
          <div style={styles.headerLeft} onClick={() => navigate(returnToMenuRoute)}>
            <span style={styles.backArrow}>◀</span>
            <h1 style={styles.brandTitle}>
              VAULT <span style={styles.glowText}>// STATUS_RADAR</span>
            </h1>
          </div>
          <div style={styles.badgeContainer}>
            <span style={styles.tableBadge}>NODE_TABLE_{tableId}</span>
          </div>
        </header>

        <main style={styles.layoutMain}>
          <article style={styles.radarCard}>
            <div style={styles.hudHeaderDecoration}>LIVE KITCHEN TELEMETRY FEED</div>
            
            <div style={styles.metaRow}>
              <div>
                <span style={styles.label}>ORDER_REGISTRY_ID</span>
                <div style={styles.valueText}>
                  {activeOrderId ? `ID_${activeOrderId.toString().slice(-6).toUpperCase()}` : "UNASSIGNED"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={styles.label}>ELAPSED_SESSION_TIME</span>
                <div style={{ ...styles.valueText, color: "#ffc107" }}>{formatTime(elapsedSeconds)}</div>
              </div>
            </div>

            <div style={styles.ledgerDividerDashed}></div>

            <div style={styles.statusDisplayCluster}>
              <span style={styles.label}>CURRENT_PROCESSING_STATE</span>
              <div style={{
                ...styles.statusBadgeBig,
                color: order?.status === "Completed" ? "#00ff41" : order?.status === "Preparing" || order?.status === "Plating" ? "#00e5ff" : "#ffc107",
                borderColor: order?.status === "Completed" ? "rgba(0,255,65,0.4)" : order?.status === "Preparing" || order?.status === "Plating" ? "rgba(0,229,255,0.4)" : "rgba(255,193,7,0.4)"
              }}>
                ⚙️ {order?.status ? order.status.toUpperCase() : "PENDING_QUEUE"}
              </div>
            </div>

            <div style={styles.ledgerDividerDashed}></div>

            <div style={{ textAlign: 'left', width: '100%' }}>
              <span style={styles.label}>MANIFEST_SUMMARY:</span>
              <p style={styles.manifestText}>{order?.item_name || "Synchronizing manifest lines..."}</p>
              
              {order?.instructions && order.instructions.trim() !== "" && (
                <div style={{ marginTop: '16px' }}>
                  <span style={{ ...styles.label, color: '#ff9f0a' }}>📝 SPECIAL_DIETARY_INSTRUCTIONS:</span>
                  <p style={styles.instructionsTextWell}>{order.instructions}</p>
                </div>
              )}
              
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={styles.label}>TOTAL_VALUE:</span>
                <span style={{ fontSize: '1.4rem', color: '#00e5ff', fontWeight: 'bold' }}>₹{order?.totalAmount || "0"}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={styles.label}>PAYMENT_METHOD:</span>
                <span style={{ fontSize: '11px', color: '#fff', letterSpacing: '1px' }}>[{order?.paymentMethod || "UNSPECIFIED"}]</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => navigate(returnToMenuRoute)} 
              onMouseEnter={() => setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              style={{
                ...styles.menuReturnBtn,
                background: isBtnHovered ? 'rgba(0, 255, 65, 0.08)' : 'transparent',
                boxShadow: isBtnHovered ? '0 0 15px rgba(0, 255, 65, 0.25)' : 'none',
                transform: isBtnHovered ? 'translateY(-1px)' : 'translateY(0)'
              }}
            >
              ◀ BACK TO MENU (ORDER KEEPS TRACKING)
            </button>
          </article>
        </main>
      </div>
    </div>
  );
}

const styles = {
  containerStyle: { backgroundColor: "#020305", minHeight: '100vh', width: "100vw", position: "relative", overflowX: "hidden" },
  contentSuperstructure: { position: "relative", zIndex: 10, minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column" },
  globalHeader: { padding: "20px 30px", background: "rgba(5, 6, 8, 0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0, 255, 65, 0.15)", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Share Tech Mono', monospace" },
  headerLeft: { display: "flex", alignItems: "center", gap: "15px", cursor: "pointer" },
  backArrow: { color: "#00ff41", fontSize: "14px", fontWeight: "bold" },
  brandTitle: { margin: 0, fontSize: "1.25rem", fontWeight: "900", letterSpacing: "2px", color: "#64748b" },
  glowText: { color: "#00ff41", textShadow: "0 0 10px rgba(0, 255, 65, 0.3)" },
  badgeContainer: { display: "flex", alignItems: "center" },
  tableBadge: { color: "#00ff41", fontSize: "12px", fontWeight: "700", letterSpacing: "1px", border: "1px dashed rgba(0, 255, 65, 0.3)", padding: "4px 10px", borderRadius: "4px", background: "rgba(0,0,0,0.3)" },
  layoutMain: { flex: 1, width: "100%", maxWidth: "600px", margin: "40px auto", padding: "0 24px", display: "flex", justifyContent: "center", boxSizing: "border-box" },
  radarCard: { width: "100%", backgroundColor: "rgba(11, 13, 19, 0.9)", border: "1px solid rgba(0, 255, 65, 0.25)", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", borderRadius: "16px", padding: "30px", display: "flex", flexDirection: "column", alignItems: "center", backdropFilter: "blur(8px)", fontFamily: "'Share Tech Mono', monospace", boxSizing: "border-box" },
  hudHeaderDecoration: { width: '100%', boxSizing: 'border-box', background: "rgba(0, 229, 255, 0.1)", color: "#00e5ff", padding: "8px", fontSize: "11px", letterSpacing: "1px", border: "1px solid #00e5ff", textAlign: 'center', fontWeight: 'bold' },
  metaRow: { display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '25px' },
  label: { color: "#4f5e75", fontSize: "11px", display: "block", marginBottom: "4px", letterSpacing: "0.5px" },
  valueText: { color: "#fff", fontSize: "15px", fontWeight: "bold" },
  ledgerDividerDashed: { borderTop: "1px dashed rgba(28, 38, 60, 0.6)", width: '100%', margin: "20px 0" },
  statusDisplayCluster: { textAlign: 'center', width: '100%' },
  statusBadgeBig: { width: '100%', boxSizing: 'border-box', padding: '20px', background: 'rgba(2,4,8,0.6)', border: '1px solid', borderRadius: '8px', fontSize: '1.4rem', fontWeight: 'bold', marginTop: '8px', letterSpacing: '1px' },
  manifestText: { color: '#fff', fontSize: '13px', background: '#020408', padding: '12px', borderRadius: '6px', border: '1px solid #1c263c', margin: '4px 0 0 0', lineHeight: '1.5' },
  instructionsTextWell: { color: '#ff9f0a', fontSize: '13px', background: 'rgba(255, 159, 10, 0.04)', padding: '12px', borderRadius: '6px', border: '1px dashed rgba(255, 159, 10, 0.3)', margin: '4px 0 0 0', lineHeight: '1.5', textTransform: 'uppercase' },
  menuReturnBtn: { width: '100%', padding: '16px', color: '#00ff41', border: '1px solid #00ff41', fontWeight: 'bold', cursor: 'pointer', letterSpacing: "0.5px", borderRadius: '8px', marginTop: '30px', fontFamily: "'Share Tech Mono', monospace", transition: "all 0.2s ease-in-out" },
  fullScreenCenter: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#020305', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  cardStyle: { background: '#090d16', padding: '30px 24px', border: '1px solid #1c263c', textAlign: 'center', width: "85%", maxWidth: "380px", position: "relative", borderRadius: "12px", zIndex: 10 }
};

export default UserStatus;