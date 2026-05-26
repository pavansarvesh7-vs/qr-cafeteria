import React, { useEffect, useState, useContext, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import MenuCard from "./MenuCard";
import GridBackground from "./GridBackground";

export default function UserHome() {
  const [products, setProducts] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);
  const [error, setError] = useState(null);
  const { cart, addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isInitializingScan, setIsInitializingScan] = useState(false);
  const [isRadarHovered, setIsRadarHovered] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "https://qr-cafeteria.onrender.com";

  // Cache table identity query param
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const tableId = queryParams.get("table") || localStorage.getItem("assigned_vault_table") || "01";

  // QR Scan Lifecycle Management
  useEffect(() => {
    const isScanEvent = queryParams.get("scan") === "true";
    const currentTableParam = queryParams.get("table");

    if (currentTableParam) {
      localStorage.setItem("assigned_vault_table", currentTableParam);
    }

    if (isScanEvent && currentTableParam) {
      setIsInitializingScan(true);
      const timer = setTimeout(() => {
        setIsInitializingScan(false);
        navigate(`/user-home?table=${currentTableParam}`, { replace: true });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [navigate, queryParams]);

  // Sync Active Session Cache
  useEffect(() => {
    const cachedId = localStorage.getItem("latest_vault_order_id");
    if (cachedId) {
      setActiveSessionId(cachedId);
    }
  }, []);

  // Menu Database Data Polling Loop
  useEffect(() => {
    const syncMenuFromDatabase = () => {
      fetch(`${API_BASE}/api/products`)
        .then((res) => {
          if (!res.ok) throw new Error("Server communication broken.");
          return res.json();
        })
        .then((data) => {
          // SAFE SANITIZATION FILTER: Checks for missing fields and intercepts null image values cleanly
          const formatted = data.map((item) => {
            let sanitizedImage = null;
            if (item.image && typeof item.image === "string" && item.image.trim() !== "") {
              sanitizedImage = item.image.startsWith("http") 
                ? item.image 
                : `${API_BASE}/uploads/${item.image}`;
            }

            return {
              ...item,
              name: item.item_name || item.name || "UNNAMED_PROTOTYPE_ITEM",
              price: item.totalAmount || item.price || 0,
              image: sanitizedImage,
              description: item.description || "No description provided."
            };
          });
          
          setProducts(formatted);
          setError(null);

          // Gracefully retain selection focus without aggressive snapping
          setActiveProduct((prevActive) => {
            if (!formatted.length) return null;
            if (!prevActive) return formatted[0];
            return formatted.find((p) => p._id === prevActive._id) || formatted[0];
          });
        })
        .catch((err) => {
          console.error("Background sync fault:", err);
          setError("Menu stream sync interrupted. Reconnecting...");
        });
    };

    syncMenuFromDatabase();
    const backgroundSyncTimer = setInterval(syncMenuFromDatabase, 8000);
    return () => clearInterval(backgroundSyncTimer);
  }, [API_BASE]);

  // Service Request Handler
  const handleServiceRequest = async (requestType) => {
    try {
      const response = await fetch(`${API_BASE}/api/orders/service-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId,
          requestType, 
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error("Network array rejected packet payload.");
      alert(`🛰️ TRANSMISSION SUCCESSFUL:\nRequest [${requestType.replace("_", " ")}] deployed for Table ${tableId}.`);
    } catch (err) {
      console.error("Service request pipeline loss:", err);
      alert("❌ TELEMETRY FAULT: Link connection broken. Please try again.");
    }
  };

  if (isInitializingScan) {
    return (
      <div style={styles.scanOverlayContainer}>
        <GridBackground />
        <div style={styles.scanOverlayContent}>
          <div style={styles.glitchText}>LINKING QR_CODE MATRIX...</div>
          <div style={styles.tableNodeBadge}>ALLOCATING NODE_TABLE_{tableId}</div>
          <div style={styles.progressBarTrack}>
            <div style={styles.progressBarFill}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appViewport}>
      <GridBackground />

      <div style={styles.contentSuperstructure}>
        <header style={styles.globalHeader}>
          <h1 style={styles.brandTitle}>
            VAULT <span style={styles.glowText}>// DIGITAL_MENU</span>
          </h1>
          <div style={styles.badgeContainer}>
            <span style={styles.terminalBlink}>●</span>
            <span style={styles.tableBadge}>NODE_TABLE_{tableId}</span>
          </div>
        </header>

        <main style={styles.layoutMain} className="app-main-layout">
          <section style={styles.directorySection}>
            <div style={styles.sectionHeader}>
              <span style={styles.bracketTitle}>[ INDEX_MANIFEST ]</span>
              {error && <span style={styles.inlineWarning}>⚠️ LIVE_SYNC_PAUSED</span>}
            </div>
            <div style={styles.verticalListContainer}>
              {products.map((item) => {
                const isSelected = activeProduct?._id === item._id;
                return (
                  <div
                    key={item._id}
                    onClick={() => setActiveProduct(item)}
                    style={{
                      ...styles.menuItemRow,
                      borderColor: isSelected ? "#00ff41" : "rgba(0, 255, 65, 0.15)",
                      boxShadow: isSelected ? "0 0 15px rgba(0, 255, 65, 0.15)" : "none",
                      background: isSelected ? "rgba(0, 255, 65, 0.04)" : "rgba(11, 13, 19, 0.65)"
                    }}
                  >
                    <div style={styles.itemRowLeft}>
                      <span style={{
                        ...styles.statusNodeDot,
                        color: isSelected ? "#00ff41" : "rgba(0, 255, 65, 0.3)"
                      }}>
                        {isSelected ? "▶" : "•"}
                      </span>
                      <span style={styles.itemRowName}>{item.name}</span>
                    </div>
                    <span style={styles.itemRowPrice}>₹{item.price}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section style={styles.showcaseCardSection}>
            {error && products.length === 0 ? (
              <div style={styles.terminalError}>{error}</div>
            ) : (
              activeProduct && (
                <div style={styles.showcaseCenterStack}>
                  {/* FIXED COMPONENT PROPS SIGNATURE: Feeds the pure single object structure directly */}
                  <MenuCard product={activeProduct} addToCart={addToCart} />

                  <div style={styles.hudDeckPanel}>
                    <div style={styles.hudHeaderLine}>[ INTERFACE_TELEMETRY ]</div>
                    <div style={styles.hudMetricRow}>
                      <div style={styles.hudLabel}>EST_PREP_TIME:</div>
                      <div style={styles.hudValueHighlight}>
                        {Math.floor((activeProduct.price % 15) + 8)} MINS
                      </div>
                    </div>
                    <div style={styles.hudMetricRow}>
                      <div style={styles.hudLabel}>CALORIC_DENSITY:</div>
                      <div style={styles.hudValue}>
                        {Math.floor((activeProduct.price % 300) + 350)} KCAL
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </section>
        </main>

        {activeSessionId && (
          <button 
            type="button"
            onClick={() => navigate(`/order-status/${activeSessionId}?table=${tableId}`)}
            onMouseEnter={() => setIsRadarHovered(true)}
            onMouseLeave={() => setIsRadarHovered(false)}
            style={{
              ...styles.floatingRadarBtn,
              transform: isRadarHovered ? 'scale(1.04)' : 'scale(1)',
              boxShadow: isRadarHovered ? '0 0 25px rgba(0, 255, 65, 0.6)' : '0 0 20px rgba(0, 255, 65, 0.4)'
            }}
          >
            🛰️ LIVE_TRACK_ACTIVE_ORDER // STATUS
          </button>
        )}

        <footer style={styles.dockedFooter}>
          <div style={styles.footerActionRow}>
            <button type="button" onClick={() => handleServiceRequest("CALL_WAITER")} style={styles.footerUtilityBtn}>✋ CALL WAITER</button>
            <button type="button" onClick={() => handleServiceRequest("CLEAN_TABLE")} style={styles.footerUtilityBtn}>🧹 CLEAN TABLE</button>
            <button type="button" onClick={() => handleServiceRequest("BILL_REQUEST")} style={styles.footerUtilityBtn}>🧾 REQUEST BILL</button>
          </div>

          <div onClick={() => navigate(`/cart?table=${tableId}`)} style={styles.cartCircleAnchor}>
            <button type="button" style={styles.cartCircleBtn}>
              🛒
              {cart?.length > 0 && (
                <span style={styles.cartCounterBadge}>{cart.length}</span>
              )}
            </button>
          </div>
        </footer>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .app-main-layout {
            flex-direction: column-reverse !important; 
            align-items: center !important;
            gap: 40px !important;
            padding-bottom: 220px !important;
          }
          .app-main-layout section {
            max-width: 100% !important;
            width: 100% !important;
          }
        }
        @keyframes cyberPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes scanProgress {
          0% { left: -60px; }
          100% { left: 180px; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  appViewport: { backgroundColor: "#020305", minHeight: "100vh", width: "100vw", position: "relative", overflowX: "hidden" },
  contentSuperstructure: { position: "relative", zIndex: 10, minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column" },
  globalHeader: { padding: "20px 30px", background: "rgba(5, 6, 8, 0.75)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0, 255, 65, 0.15)", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Share Tech Mono', monospace" },
  brandTitle: { margin: 0, fontSize: "1.25rem", fontWeight: "900", letterSpacing: "2px", color: "#64748b" },
  glowText: { color: "#00ff41", textShadow: "0 0 10px rgba(0, 255, 65, 0.3)" },
  badgeContainer: { display: "flex", alignItems: "center", gap: "10px" },
  terminalBlink: { color: "#00ff41", fontSize: "10px", animation: "cyberPulse 1.5s infinite" },
  tableBadge: { color: "#00ff41", fontSize: "12px", fontWeight: "700", letterSpacing: "1px" },
  layoutMain: { flex: 1, width: "100%", maxWidth: "1150px", margin: "0 auto", padding: "40px 24px 120px 24px", display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "50px", boxSizing: "border-box" },
  directorySection: { flex: 1, maxWidth: "420px", width: "100%", display: "flex", flexDirection: "column", gap: "16px", fontFamily: "'Share Tech Mono', monospace" },
  sectionHeader: { borderBottom: "1px dashed rgba(0, 255, 65, 0.2)", paddingBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  bracketTitle: { color: "#64748b", fontSize: "12px", letterSpacing: "1.5px", fontWeight: "bold" },
  inlineWarning: { color: "#ff3b30", fontSize: "10px", fontWeight: "bold", letterSpacing: "0.5px" },
  verticalListContainer: { display: "flex", flexDirection: "column", gap: "10px" },
  menuItemRow: { borderWidth: "1px", borderStyle: "solid", borderRadius: "10px", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", backdropFilter: "blur(6px)", transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)" },
  itemRowLeft: { display: "flex", alignItems: "center", gap: "14px" },
  statusNodeDot: { fontSize: "11px", lineHeight: 1 },
  itemRowName: { color: "#fff", fontSize: "15px", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase" },
  itemRowPrice: { color: "#00ff41", fontSize: "14px", fontWeight: "700" },
  showcaseCardSection: { flex: 1, maxWidth: "430px", width: "100%", display: "flex", justifyContent: "center" },
  showcaseCenterStack: { width: "100%", display: "flex", flexDirection: "column", gap: "20px" },
  terminalError: { color: "#ff3b30", fontFamily: "'Share Tech Mono', monospace", fontSize: "14px", padding: "20px", background: "rgba(255,59,48,0.03)", border: "1px solid rgba(255,59,48,0.2)", borderRadius: "8px", width: "100%" },
  hudDeckPanel: { background: "rgba(11, 13, 19, 0.8)", border: "1px solid rgba(0, 255, 65, 0.2)", boxShadow: "0 10px 30px rgba(0,0,0,0.4)", borderRadius: "16px", padding: "20px", backdropFilter: "blur(8px)", fontFamily: "'Share Tech Mono', monospace", display: "flex", flexDirection: "column", gap: "12px" },
  hudHeaderLine: { color: "#64748b", fontSize: "11px", letterSpacing: "1px", fontWeight: "bold", borderBottom: "1px dashed rgba(0,255,65,0.1)", paddingBottom: "6px" },
  hudMetricRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" },
  hudLabel: { color: "#8fa0bc" },
  hudValue: { color: "#fff", fontWeight: "bold" },
  hudValueHighlight: { color: "#00ff41", fontWeight: "bold", textShadow: "0 0 8px rgba(0,255,65,0.4)" },
  floatingRadarBtn: { position: 'fixed', bottom: '96px', right: '24px', background: 'linear-gradient(135deg, #00ff41 0%, #00b32d 100%)', color: '#000', padding: '14px 22px', borderRadius: '50px', fontWeight: '900', fontSize: '11px', fontFamily: "'Share Tech Mono', monospace", letterSpacing: '1px', border: '1px solid rgba(0, 255, 65, 0.6)', cursor: 'pointer', zIndex: 9999, transition: 'all 0.2s ease-in-out' },
  dockedFooter: { position: "fixed", bottom: 0, left: 0, width: "100%", padding: "16px 30px 24px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(to top, #020305 80%, transparent)", boxSizing: "border-box", gap: "20px", zIndex: 999 },
  footerActionRow: { display: "flex", gap: "10px", flexWrap: "wrap", flex: 1, maxWidth: "calc(100% - 72px)" },
  footerUtilityBtn: { background: "rgba(11, 13, 19, 0.85)", color: "#fff", border: "1px solid rgba(0, 255, 65, 0.2)", fontFamily: "'Share Tech Mono', monospace", padding: "14px 16px", fontSize: "12px", fontWeight: "bold", borderRadius: "10px", cursor: "pointer", flex: "1 1 auto", textAlign: "center", transition: "all 0.2s ease" },
  cartCircleAnchor: { display: "block" },
  cartCircleBtn: { width: "54px", height: "54px", borderRadius: "50%", background: "#ff6b35", border: "none", fontSize: "20px", cursor: "pointer", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(255, 107, 53, 0.4)" },
  cartCounterBadge: { position: "absolute", top: "-3px", right: "-3px", background: "#fff", color: "#ff6b35", width: "18px", height: "18px", borderRadius: "50%", fontSize: "10px", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center" },
  scanOverlayContainer: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "#020305", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000 },
  scanOverlayContent: { display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'Share Tech Mono', monospace", zIndex: 10001 },
  glitchText: { color: "#00ff41", fontSize: "20px", letterSpacing: "3px", marginBottom: "8px", fontWeight: "bold" },
  tableNodeBadge: { color: "#64748b", fontSize: "12px", letterSpacing: "1px", marginBottom: "20px" },
  progressBarTrack: { width: "180px", height: "2px", background: "rgba(0, 255, 65, 0.15)", position: "relative", overflow: "hidden" },
  progressBarFill: { position: "absolute", width: "60px", height: "100%", background: "#00ff41", animation: "scanProgress 1.2s infinite ease-in-out" }
};