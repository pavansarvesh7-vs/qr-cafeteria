import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
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
  const [isScanningCamera, setIsScanningCamera] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "https://qr-cafeteria.onrender.com";

  const productsRef = useRef([]);
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

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

  // Integrated Camera Instance lifecycle loop
  useEffect(() => {
    let scannerInstance = null;

    if (isScanningCamera) {
      const setupTimer = setTimeout(() => {
        scannerInstance = new Html5QrcodeScanner(
          "qr-reader-container",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true
          },
          false
        );

        scannerInstance.render(
          (decodedText) => {
            try {
              let parsedTable = decodedText;
              if (decodedText.includes("table=")) {
                const urlObj = new URL(decodedText);
                parsedTable = urlObj.searchParams.get("table") || "01";
              }
              
              localStorage.setItem("assigned_vault_table", parsedTable);
              scannerInstance.clear().then(() => {
                setIsScanningCamera(false);
                window.location.href = `/user-home?table=${parsedTable}&scan=true`;
              });
            } catch (err) {
              console.error("Matrix compilation error mapping code contents:", err);
            }
          },
          (errorMessage) => {}
        );
      }, 100);

      return () => {
        clearTimeout(setupTimer);
        if (scannerInstance) {
          scannerInstance.clear().catch((err) => console.error("Scanner exit fault:", err));
        }
      };
    }
  }, [isScanningCamera]);

  // Sync Active Session Cache
  useEffect(() => {
    const cachedId = localStorage.getItem("latest_vault_order_id");
    if (cachedId) {
      setActiveSessionId(cachedId);
    }
  }, []);

  // Menu Database Data Polling Loop
  useEffect(() => {
    let isMounted = true;

    const syncMenuFromDatabase = () => {
      fetch(`${API_BASE}/api/products`)
        .then((res) => {
          if (!res.ok) throw new Error("Server communication broken.");
          return res.json();
        })
        .then((data) => {
          if (!isMounted) return;

          const rawComparisonString = JSON.stringify(data);
          const currentComparisonString = JSON.stringify(
            productsRef.current.map(({ name, price, image, description, ...rest }) => rest)
          );

          if (productsRef.current.length > 0 && rawComparisonString === currentComparisonString) {
            return; 
          }

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

          setActiveProduct((prevActive) => {
            if (!formatted.length) return null;
            if (!prevActive) return formatted[0];
            return formatted.find((p) => p._id === prevActive._id) || formatted[0];
          });
        })
        .catch((err) => {
          console.error("Background sync fault:", err);
          if (isMounted) setError("Menu stream sync interrupted. Reconnecting...");
        });
    };

    syncMenuFromDatabase();
    const backgroundSyncTimer = setInterval(syncMenuFromDatabase, 12000);
    
    return () => {
      isMounted = false;
      clearInterval(backgroundSyncTimer);
    };
  }, [API_BASE]);

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

      {isScanningCamera && (
        <div style={styles.cameraLightBoxOverlay}>
          <div style={styles.scannerInterfacePanel}>
            <div style={styles.scannerHeaderRow}>
              <div style={styles.scannerCardTitle}>⚡ HARDWARE_CAMERA_LINK</div>
              <button 
                type="button" 
                onClick={() => setIsScanningCamera(false)} 
                style={styles.closeScannerBtn}
              >
                [ TERMINATE_LINK ]
              </button>
            </div>
            <p style={styles.scannerInstructionText}>Align target Table Node QR Code within the interface reticle tracking lines below:</p>
            <div id="qr-reader-container" style={styles.nativeCameraHole}></div>
          </div>
        </div>
      )}

      <div style={styles.contentSuperstructure}>
        <header style={styles.globalHeader}>
          <h1 style={styles.brandTitle}>
            VAULT <span style={styles.glowText}>// DIGITAL_MENU</span>
          </h1>
          <div style={styles.badgeContainer}>
            <button 
              type="button" 
              onClick={() => setIsScanningCamera(true)} 
              style={styles.headerScanTrigger}
            >
              📷 SYNC_NODE_SCANNER
            </button>
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
                      background: isSelected ? "rgba(0, 255, 65, 0.08)" : "#0b0d13"
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
            🛰️ LIVE_TRACK_ACTIVE_ORDER
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
            gap: 24px !important;
            padding-bottom: 180px !important;
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
        #qr-reader-container button {
          background: #00ff41 !important;
          color: #000 !important;
          border: none !important;
          padding: 8px 14px !important;
          font-family: 'Share Tech Mono', monospace !important;
          font-weight: bold !important;
          border-radius: 4px !important;
          cursor: pointer !important;
          margin-top: 10px !important;
        }
        #qr-reader-container select {
          background: #111313 !important;
          color: #00ff41 !important;
          border: 1px solid rgba(0, 255, 65, 0.4) !important;
          padding: 6px !important;
          font-family: 'Share Tech Mono', monospace !important;
        }
      `}</style>
    </div>
  );
}

// 🧠 OPTIMIZED STYLES MATRIX FOR NO-CRASH PERFORMANCE COMPILES
const styles = {
  appViewport: { backgroundColor: "#020305", minHeight: "100vh", width: "100%", position: "relative", overflowX: "hidden" },
  contentSuperstructure: { position: "relative", zIndex: 10, minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column" },
  globalHeader: { padding: "20px 16px", background: "#050608", borderBottom: "1px solid rgba(0, 255, 65, 0.15)", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Share Tech Mono', monospace" },
  brandTitle: { margin: 0, fontSize: "1.1rem", fontWeight: "900", letterSpacing: "1px", color: "#64748b" },
  glowText: { color: "#00ff41" },
  badgeContainer: { display: "flex", alignItems: "center", gap: "8px" },
  headerScanTrigger: { background: "rgba(0, 255, 65, 0.08)", color: "#00ff41", border: "1px solid rgba(0, 255, 65, 0.4)", padding: "6px 10px", borderRadius: "6px", fontFamily: "'Share Tech Mono', monospace", fontSize: "10px", fontWeight: "bold", cursor: "pointer" },
  terminalBlink: { color: "#00ff41", fontSize: "10px", animation: "cyberPulse 1.5s infinite" },
  tableBadge: { color: "#00ff41", fontSize: "11px", fontWeight: "700" },
  layoutMain: { flex: 1, width: "100%", maxWidth: "1150px", margin: "0 auto", padding: "20px 16px 120px 16px", display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "30px", boxSizing: "border-box" },
  directorySection: { flex: 1, maxWidth: "420px", width: "100%", display: "flex", flexDirection: "column", gap: "16px", fontFamily: "'Share Tech Mono', monospace" },
  sectionHeader: { borderBottom: "1px dashed rgba(0, 255, 65, 0.2)", paddingBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  bracketTitle: { color: "#64748b", fontSize: "12px", letterSpacing: "1.5px", fontWeight: "bold" },
  inlineWarning: { color: "#ff3b30", fontSize: "10px", fontWeight: "bold" },
  verticalListContainer: { display: "flex", flexDirection: "column", gap: "10px" },
  menuItemRow: { borderWidth: "1px", borderStyle: "solid", borderRadius: "10px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "transform 0.15s ease" },
  itemRowLeft: { display: "flex", alignItems: "center", gap: "12px" },
  statusNodeDot: { fontSize: "11px", lineHeight: 1 },
  itemRowName: { color: "#fff", fontSize: "14px", fontWeight: "600", textTransform: "uppercase" },
  itemRowPrice: { color: "#00ff41", fontSize: "14px", fontWeight: "700" },
  showcaseCardSection: { flex: 1, maxWidth: "430px", width: "100%", display: "flex", justifyContent: "center" },
  showcaseCenterStack: { width: "100%", display: "flex", flexDirection: "column", gap: "20px" },
  terminalError: { color: "#ff3b30", fontFamily: "'Share Tech Mono', monospace", fontSize: "14px", padding: "20px", background: "rgba(255,59,48,0.03)", border: "1px solid rgba(255,59,48,0.2)", borderRadius: "8px", width: "100%" },
  hudDeckPanel: { background: "#0b0d13", border: "1px solid rgba(0, 255, 65, 0.2)", borderRadius: "16px", padding: "20px", fontFamily: "'Share Tech Mono', monospace", display: "flex", flexDirection: "column", gap: "12px" },
  hudHeaderLine: { color: "#64748b", fontSize: "11px", letterSpacing: "1px", fontWeight: "bold", borderBottom: "1px dashed rgba(0,255,65,0.1)", paddingBottom: "6px" },
  hudMetricRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" },
  hudLabel: { color: "#8fa0bc" },
  hudValue: { color: "#fff", fontWeight: "bold" },
  hudValueHighlight: { color: "#00ff41", fontWeight: "bold" },
  floatingRadarBtn: { position: 'fixed', bottom: '96px', right: '16px', background: 'linear-gradient(135deg, #00ff41 0%, #00b32d 100%)', color: '#000', padding: '12px 18px', borderRadius: '50px', fontWeight: '900', fontSize: '11px', fontFamily: "'Share Tech Mono', monospace", border: '1px solid rgba(0, 255, 65, 0.6)', cursor: 'pointer', zIndex: 9999 },
  dockedFooter: { position: "fixed", bottom: 0, left: 0, width: "100%", padding: "12px 16px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#020305", borderTop: "1px solid rgba(0, 255, 65, 0.1)", boxSizing: "border-box", gap: "12px", zIndex: 999 },
  footerActionRow: { display: "flex", gap: "8px", flexWrap: "wrap", flex: 1, maxWidth: "calc(100% - 64px)" },
  footerUtilityBtn: { background: "#0b0d13", color: "#fff", border: "1px solid rgba(0, 255, 65, 0.2)", fontFamily: "'Share Tech Mono', monospace", padding: "12px 8px", fontSize: "11px", fontWeight: "bold", borderRadius: "8px", cursor: "pointer", flex: "1 1 auto", textAlign: "center" },
  cartCircleAnchor: { display: "block" },
  cartCircleBtn: { width: "48px", height: "48px", borderRadius: "50%", background: "#ff6b35", border: "none", fontSize: "18px", cursor: "pointer", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" },
  cartCounterBadge: { position: "absolute", top: "-3px", right: "-3px", background: "#fff", color: "#ff6b35", width: "16px", height: "16px", borderRadius: "50%", fontSize: "9px", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center" },
  scanOverlayContainer: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "#020305", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000 },
  scanOverlayContent: { display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'Share Tech Mono', monospace", zIndex: 10001 },
  glitchText: { color: "#00ff41", fontSize: "20px", letterSpacing: "3px", marginBottom: "8px", fontWeight: "bold" },
  tableNodeBadge: { color: "#64748b", fontSize: "12px", letterSpacing: "1px", marginBottom: "20px" },
  progressBarTrack: { width: "180px", height: "2px", background: "rgba(0, 255, 65, 0.15)", position: "relative", overflow: "hidden" },
  progressBarFill: { position: "absolute", width: "60px", height: "100%", background: "#00ff41", animation: "scanProgress 1.2s infinite ease-in-out" },
  cameraLightBoxOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(2, 3, 5, 0.95)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 11000, padding: "20px", boxSizing: "border-box" },
  scannerInterfacePanel: { width: "100%", maxWidth: "500px", background: "#0b0d13", border: "2px solid #00ff41", borderRadius: "16px", padding: "24px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "16px", fontFamily: "'Share Tech Mono', monospace" },
  scannerHeaderRow: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed rgba(0, 255, 65, 0.2)", paddingBottom: "12px" },
  scannerCardTitle: { color: "#fff", fontWeight: "bold", fontSize: "14px", letterSpacing: "1px" },
  closeScannerBtn: { background: "none", border: "none", color: "#ff3b30", fontSize: "12px", fontWeight: "bold", cursor: "pointer" },
  scannerInstructionText: { margin: 0, fontSize: "13px", color: "#8fa0bc", lineHeight: "1.5" },
  nativeCameraHole: { width: "100%", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(0, 255, 65, 0.15)", color: "#fff" }
};