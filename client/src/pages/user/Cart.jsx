import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../../context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react"; 
import axios from "axios";
import GridBackground from "./GridBackground";

function Cart() {
  const { 
    cart: contextCart = [], 
    clearCart, 
    updateCustomization = () => {}, 
    updateQuantity: contextUpdateQuantity, 
    removeFromCart: contextRemoveFromCart 
  } = useContext(CartContext);

  const navigate = useNavigate();
  const [paymentStep, setPaymentStep] = useState("selection"); 
  const [loading, setLoading] = useState(false);
  const [upiUrl, setUpiUrl] = useState("");
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [splitCount, setSplitCount] = useState(1);
  const [localCart, setLocalCart] = useState([]);

  useEffect(() => {
    if (contextCart && contextCart.length > 0) {
      setLocalCart(contextCart);
    }
  }, [contextCart]);

  const queryParams = new URLSearchParams(useLocation().search);
  const tableId = queryParams.get("table") || "01";

  // --- FIXED DYNAMIC ENVIRONMENT URL ROUTING LAYER ---
  const SERVER_IP = import.meta.env.VITE_API_URL || "https://qr-cafeteria-backend.onrender.com"; 
  
  const API_BASE = SERVER_IP.includes("onrender.com")
    ? `${SERVER_IP}/api/orders`
    : `http://localhost:5000/api/orders`;

  const handleIncreaseQty = (itemId) => {
    if (typeof contextUpdateQuantity === "function") {
      const targetItem = localCart.find(item => (item.id || item._id) === itemId);
      const currentQty = targetItem ? (targetItem.quantity || targetItem.qty || 1) : 1;
      contextUpdateQuantity(itemId, currentQty + 1);
    }
    
    setLocalCart(prevCart => 
      prevCart.map(item => {
        if ((item.id || item._id) === itemId) {
          const oldQty = item.quantity || item.qty || 1;
          return { ...item, quantity: oldQty + 1, qty: oldQty + 1 };
        }
        return item;
      })
    );
  };

  const handleDecreaseQty = (itemId) => {
    const targetItem = localCart.find(item => (item.id || item._id) === itemId);
    const currentQty = targetItem ? (targetItem.quantity || targetItem.qty || 1) : 1;

    if (currentQty <= 1) {
      if (typeof contextRemoveFromCart === "function") {
        contextRemoveFromCart(itemId);
      }
      setLocalCart(prevCart => prevCart.filter(item => (item.id || item._id) !== itemId));
    } else {
      if (typeof contextUpdateQuantity === "function") {
        contextUpdateQuantity(itemId, currentQty - 1);
      }
      setLocalCart(prevCart => 
        prevCart.map(item => {
          if ((item.id || item._id) === itemId) {
            return { ...item, quantity: currentQty - 1, qty: currentQty - 1 };
          }
          return item;
        })
      );
    }
  };

  const total = localCart.reduce((acc, item) => {
    const q = item.quantity || item.qty || 1;
    return acc + (Number(item.price) * q);
  }, 0);

  const individualShare = (total / splitCount).toFixed(2);

  useEffect(() => {
    let interval;
    if (paymentStep === "waiting" && activeOrderId) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_BASE}/${activeOrderId}`);
          if (res.data.paymentStatus === "Verified" || res.data.status !== "Pending") {
            handleFinalRedirect(activeOrderId);
            clearInterval(interval);
          }
        } catch (err) { 
          console.warn("Checking payment status..."); 
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [paymentStep, activeOrderId]);

  const handleFinalRedirect = (orderId) => {
    try {
      if (typeof clearCart === "function") {
        clearCart();
      }
    } catch (contextError) {
      console.error("Cart Context failed to clear, continuing navigation bypass...", contextError);
    }
    navigate(`/order-status/${orderId}?table=${tableId}`);
  };

  const handleOrder = async (method) => {
    if (localCart.length === 0) return;
    setLoading(true);
    
    try {
      const itemsString = localCart
        .map(item => {
          const qty = item.quantity || item.qty || 1;
          const hasNote = item.note && item.note.trim() !== "";
          return `${item.name} (x${qty})${hasNote ? ` (NOTE: ${item.note.trim().toUpperCase()})` : ""}`;
        })
        .join(", ");

      const aggregatedNotes = localCart
        .filter(item => item.note && item.note.trim() !== "")
        .map(item => `${item.name}: "${item.note.trim()}"`)
        .join(" | ");

      const orderData = { 
        tableId, 
        orderItems: localCart, 
        item_name: itemsString, 
        totalAmount: total, 
        paymentMethod: method,
        instructions: aggregatedNotes 
      };
      
      const res = await axios.post(API_BASE, orderData);
      const newId = res.data.id || res.data._id;
      
      if (newId) {
        setActiveOrderId(newId);
        localStorage.setItem("latest_vault_order_id", newId);

        if (method === "UPI") {
          const vpa = "vault.kitchen@okicici"; 
          const generatedUrl = `upi://pay?pa=${vpa}&pn=Vault&am=${total}&cu=INR&tn=Table${tableId}`;
          setUpiUrl(generatedUrl);
          setPaymentReference(Math.random().toString(16).substring(2, 12).toUpperCase());
          setPaymentStep("qr");
        } else {
          handleFinalRedirect(newId);
        }
      }
    } catch (err) {
      alert(`Order Failed: Could not connect to the restaurant server at ${SERVER_IP}`);
    } finally {
      setLoading(false);
    }
  };

  if (paymentStep === "qr") {
    return (
      <div style={styles.fullScreenCenter}>
        <GridBackground />
        <div style={styles.cardStyle}>
          <div style={styles.hudHeaderDecoration}>SECURE UPI PAYMENT GATEWAY</div>
          <h2 style={{color: '#00e5ff', margin: "20px 0 5px 0", fontSize: "1.1rem", fontFamily: "'Share Tech Mono', monospace"}}>SCAN TO PAY VIA UPI</h2>
          <p style={{fontSize: '2.2rem', color: "#fff", margin: "5px 0", fontWeight: "bold", fontFamily: "'Share Tech Mono', monospace"}}>₹{total}</p>
          
          <div style={styles.qrContainer}>
            <QRCodeSVG value={upiUrl} size={180} fgColor="#000" bgColor="#fff" />
          </div>
          
          <div style={styles.hashBlock}>
            <span style={{color: "#4f5e75"}}>REF CODE //</span> <span style={{color: "#00ff41"}}>{paymentReference}</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={() => setPaymentStep("selection")} style={styles.secondaryCancelBtn}>
              ◀ CANCEL
            </button>
            <button onClick={() => setPaymentStep("waiting")} style={styles.confirmBtnInline}>
              CONFIRM PAYMENT →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStep === "waiting") {
    return (
      <div style={styles.fullScreenCenter}>
        <GridBackground />
        <div style={styles.cardStyle}>
          <div style={styles.spinnerStyle}></div>
          <h2 style={{marginTop: '25px', color: '#ffc107', letterSpacing: "1px", fontSize: "1.1rem", fontFamily: "'Share Tech Mono', monospace"}}>PROCESSING YOUR ORDER</h2>
          <p style={{color: '#657795', fontSize: "13px", lineHeight: "1.6", fontFamily: "'Share Tech Mono', monospace"}}>Awaiting payment approval from the kitchen desk dashboard...</p>
          
          <button 
            onClick={() => handleFinalRedirect(activeOrderId)} 
            style={{ ...styles.cashBtn, marginTop: '25px', borderColor: 'rgba(255,193,7,0.3)', color: '#ffc107', fontSize: '10px', padding: '10px' }}
          >
            FORCE OPEN STATUS RADAR WINDOW →
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
          <div style={styles.headerLeft} onClick={() => navigate(`/user-home?table=${tableId}`)}>
            <span style={styles.backArrow}>◀</span>
            <h1 style={styles.brandTitle}>
              VAULT <span style={styles.glowText}>// CHECKOUT_TERMINAL</span>
            </h1>
          </div>
          <div style={styles.badgeContainer}>
            <span style={styles.tableBadge}>NODE_TABLE_{tableId}</span>
          </div>
        </header>

        <main style={styles.layoutMain} className="cart-layout">
          {localCart.length === 0 ? (
            <div style={styles.emptyTerminal}>
              <div style={styles.emptyIcon}>📂</div>
              <h2 style={styles.emptyTitle}>MANIFEST_EMPTY</h2>
              <p style={styles.emptyDesc}>No pending data items queued inside your current table session.</p>
              <button onClick={() => navigate(`/user-home?table=${tableId}`)} style={styles.returnBrowseBtn}>
                RETURN TO NODE MENU
              </button>
            </div>
          ) : (
            <>
              <section style={styles.itemStreamSection}>
                <div style={{ marginBottom: '5px' }}>
                  <button 
                    onClick={() => navigate(`/user-home?table=${tableId}`)} 
                    style={styles.inlineBackToMenuBtn}
                  >
                    ◀ BACK TO NODE MENU
                  </button>
                </div>

                <div style={styles.sectionHeader}>
                  <span style={styles.bracketTitle}>[ QUEUED_DATA_ENTRIES ({localCart.length}) ]</span>
                </div>

                <div style={styles.streamList}>
                  {localCart.map((item, i) => {
                    const currentQty = item.quantity || item.qty || 1;
                    const itemId = item.id || item._id || `idx-${i}`;

                    return (
                      <div key={itemId} style={styles.cartRowCard}>
                        <div style={styles.cardHeaderLine}>
                          <span style={styles.itemIdToken}>ID_LN_{itemId.toString().slice(-5).toUpperCase()}</span>
                          <span style={styles.itemPriceToken}>₹{item.price * currentQty}</span>
                        </div>

                        <div style={styles.cardCoreDetails}>
                          <div style={styles.metaTextBox}>
                            <h3 style={styles.itemNameText}>{item.name}</h3>
                            <span style={styles.unitCostLabel}>UNIT_COST: ₹{item.price}</span>
                          </div>

                          <div style={styles.counterControlDeck}>
                            <button onClick={() => handleDecreaseQty(itemId)} style={styles.counterBtn}>-</button>
                            <span style={styles.counterDisplay}>{currentQty}</span>
                            <button onClick={() => handleIncreaseQty(itemId)} style={styles.counterBtn}>+</button>
                          </div>
                        </div>

                        <div style={styles.instructionBoxContainer}>
                          <span style={styles.terminalLabelSmall}>&gt; ADD_PREPARATION_INSTRUCTIONS:</span>
                          <input 
                            type="text" 
                            placeholder="Less spicy, allergy markers, extra modifications..." 
                            value={item.note || ""} 
                            onChange={(e) => updateCustomization(itemId, e.target.value)} 
                            style={styles.inputStyle} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section style={styles.ledgerSummarySection}>
                <div style={styles.sectionHeader}>
                  <span style={styles.bracketTitle}>[ TRANSACTION_LEDGER ]</span>
                </div>

                <div style={styles.ledgerPaperDeck}>
                  <div style={styles.splitterModule}>
                    <div style={styles.splitterHeader}>SPLIT BILL MATRIX</div>
                    <div style={styles.splitterControls}>
                      <span style={{color: "#8fa0bc", fontSize: "11px"}}>Guests: {splitCount}</span>
                      <input 
                        type="range" 
                        min="1" 
                        max="8" 
                        value={splitCount} 
                        onChange={(e) => setSplitCount(Number(e.target.value))}
                        style={styles.slider} 
                      />
                    </div>
                    {splitCount > 1 && (
                      <div style={styles.splitResult}>
                        <span>PER_NODE_SHARE:</span>
                        <span style={{color: "#00ff41", fontWeight: "bold"}}>₹{individualShare} / each</span>
                      </div>
                    )}
                  </div>

                  <div style={styles.ledgerDividerDashed}></div>

                  <div style={styles.ledgerGrandRow}>
                    <span style={styles.grandTitleToken}>TOTAL_NET_PAYABLE</span>
                    <span style={styles.grandValueToken}>₹{total}</span>
                  </div>

                  <div style={styles.statusBannerRow}>
                    <span style={styles.greenDotBlink}>●</span>
                    <span style={styles.statusText}>ROUTING_SECURE_VIA_VAULT_NET</span>
                  </div>

                  <div style={styles.btnGroup}>
                    <button disabled={localCart.length === 0 || loading} onClick={() => handleOrder("UPI")} style={styles.upiBtn}>
                      {loading ? "TRANSMITTING DATA..." : "📡 TRANSMIT VIA UPI"}
                    </button>
                    <button disabled={localCart.length === 0 || loading} onClick={() => handleOrder("CASH")} style={styles.cashBtn}>
                      PAY LATER IN CASH ON ARRIVAL
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .cart-layout {
            flex-direction: column !important;
            align-items: center !important;
            gap: 30px !important;
          }
          .cart-layout section {
            max-width: 100% !important;
            width: 100% !important;
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
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
  layoutMain: { flex: 1, width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "20px 24px 40px 24px", display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "40px", boxSizing: "border-box" },
  inlineBackToMenuBtn: { background: "transparent", border: "1px solid rgba(255, 59, 48, 0.4)", color: "#ff3b30", padding: "8px 16px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", letterSpacing: "1px", cursor: "pointer", transition: "all 0.2s", fontFamily: "'Share Tech Mono', monospace" },
  itemStreamSection: { flex: 1.3, display: "flex", flexDirection: "column", gap: "15px", fontFamily: "'Share Tech Mono', monospace" },
  ledgerSummarySection: { flex: 0.9, maxWidth: "460px", width: "100%", display: "flex", flexDirection: "column", gap: "20px", fontFamily: "'Share Tech Mono', monospace", position: "sticky", top: "40px", marginTop: "36px" },
  sectionHeader: { borderBottom: "1px dashed rgba(0, 255, 65, 0.2)", paddingBottom: "8px" },
  bracketTitle: { color: "#64748b", fontSize: "12px", letterSpacing: "1.5px", fontWeight: "bold" },
  streamList: { display: "flex", flexDirection: "column", gap: "16px" },
  cartRowCard: { backgroundColor: "rgba(11, 13, 19, 0.8)", border: "1px solid rgba(28, 38, 60, 0.8)", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "15px", backdropFilter: "blur(8px)" },
  cardHeaderLine: { display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(28,38,60,0.4)", paddingBottom: "8px" },
  itemIdToken: { color: "#64748b", fontSize: "11px" },
  itemPriceToken: { color: "#00ff41", fontSize: "14px", fontWeight: "bold" },
  cardCoreDetails: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px" },
  metaTextBox: { display: "flex", flexDirection: "column", gap: "4px" },
  itemNameText: { margin: 0, color: "#fff", fontSize: "1.1rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" },
  unitCostLabel: { color: "#8fa0bc", fontSize: "11px" },
  counterControlDeck: { display: "flex", alignItems: "center", backgroundColor: "#020305", border: "1px solid #1c263c", borderRadius: "6px", overflow: "hidden" },
  counterBtn: { background: "transparent", border: "none", color: "#64748b", width: "32px", height: "32px", fontSize: "16px", cursor: "pointer", outline: "none" },
  counterDisplay: { color: "#00ff41", fontWeight: "bold", minWidth: "24px", textAlign: "center", fontSize: "13px" },
  instructionBoxContainer: { display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" },
  terminalLabelSmall: { color: "#64748b", fontSize: "10px" },
  inputStyle: { width: '100%', background: '#020408', border: '1px solid #1c263c', color: '#00ff41', padding: '12px', boxSizing: "border-box", outline: "none", fontSize: "12px", borderRadius: '6px', fontFamily: "'Share Tech Mono', monospace" },
  ledgerPaperDeck: { backgroundColor: "rgba(11, 13, 19, 0.9)", border: "1px solid rgba(0, 255, 65, 0.25)", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", borderRadius: "16px", padding: "25px", display: "flex", flexDirection: "column", backdropFilter: "blur(8px)" },
  splitterModule: { background: "#020408", border: "1px solid #1c263c", padding: "16px", borderRadius: "8px" },
  splitterHeader: { fontSize: "10px", color: "#00e5ff", letterSpacing: "0.5px", marginBottom: "12px", fontWeight: "bold" },
  splitterControls: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px" },
  slider: { flex: 1, accentColor: "#00e5ff", cursor: "pointer", height: "4px" },
  splitResult: { borderTop: "1px dashed #1c263c", marginTop: "12px", paddingTop: "10px", display: "flex", justifyContent: "space-between", fontSize: "12px" },
  ledgerDividerDashed: { borderTop: "1px dashed rgba(28, 38, 60, 0.6)", margin: "20px 0" },
  ledgerGrandRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  grandTitleToken: { color: "#64748b", fontWeight: "bold", fontSize: "12px" },
  grandValueToken: { color: "#00e5ff", fontSize: "1.8rem", fontWeight: "bold" },
  statusBannerRow: { display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(0,255,65,0.02)", border: "1px dashed rgba(0,255,65,0.15)", padding: "10px", borderRadius: "6px", marginBottom: "25px" },
  greenDotBlink: { color: "#00ff41", fontSize: "10px" },
  statusText: { color: "#64748b", fontSize: "10px" },
  btnGroup: { display: 'flex', flexDirection: 'column', gap: '12px' },
  upiBtn: { width: '100%', padding: '16px', background: '#00ff41', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer', letterSpacing: "0.5px", borderRadius: '8px', fontFamily: "'Share Tech Mono', monospace" },
  cashBtn: { width: '100%', padding: '16px', background: 'none', color: '#fff', border: '1px solid #1c263c', fontWeight: 'bold', cursor: 'pointer', letterSpacing: "0.5px", borderRadius: '8px', fontFamily: "'Share Tech Mono', monospace", fontSize: "12px" },
  fullScreenCenter: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#020305', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  cardStyle: { background: '#090d16', padding: '30px 24px', border: '1px solid #1c263c', textAlign: 'center', width: "85%", maxWidth: "380px", position: "relative", borderRadius: "12px", zIndex: 10 },
  hudHeaderDecoration: { background: "rgba(0, 229, 255, 0.1)", color: "#00e5ff", padding: "6px", fontSize: "10px", letterSpacing: "0.5px", border: "1px solid #00e5ff", fontFamily: "'Share Tech Mono', monospace" },
  qrContainer: { background: '#fff', padding: '15px', display: 'inline-block', marginTop: "15px", borderRadius: "8px" },
  hashBlock: { background: "#020408", border: "1px solid #1c263c", padding: "10px", marginTop: "15px", fontSize: "11px", letterSpacing: "0.5px", fontFamily: "'Share Tech Mono', monospace" },
  secondaryCancelBtn: { flex: 0.4, padding: '16px', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', border: '1px solid #ff3b30', fontWeight: 'bold', cursor: 'pointer', borderRadius: '8px', fontFamily: "'Share Tech Mono', monospace", fontSize: '12px' },
  confirmBtnInline: { flex: 0.6, padding: '16px', background: '#00e5ff', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer', letterSpacing: "0.5px", borderRadius: '8px', fontFamily: "'Share Tech Mono', monospace" },
  emptyTerminal: { margin: "80px auto", textAlign: "center", maxWidth: "400px", fontFamily: "'Share Tech Mono', monospace" },
  emptyIcon: { fontSize: "3.5rem", marginBottom: "20px", opacity: 0.5 },
  emptyTitle: { color: "#ff3b30", fontSize: "1.5rem", fontWeight: "bold", letterSpacing: "1px", margin: "0 0 10px 0" },
  emptyDesc: { color: "#64748b", fontSize: "13px", lineHeight: "1.6", margin: "0 0 30px 0" },
  returnBrowseBtn: { background: "transparent", border: "1px solid #00ff41", color: "#00ff41", padding: "12px 24px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", letterSpacing: "1px" },
  spinnerStyle: { width: "45px", height: "45px", border: "4px solid rgba(0, 255, 65, 0.05)", borderTop: "4px solid #ffc107", borderRadius: "50%", margin: "0 auto", animation: "spin 1s linear infinite" }
};

export default Cart;