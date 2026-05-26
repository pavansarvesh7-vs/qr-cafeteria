import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const OrderTimer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState("00:00");

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const diff = Math.floor((now - start) / 1000);
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      setElapsed(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };
    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const minsElapsed = parseInt(elapsed.split(":")[0]);
  let color = "#00e676"; 
  let animation = "none";
  if (minsElapsed >= 10) color = "#ffb300"; 
  if (minsElapsed >= 20) {
    color = "#ff3d00"; 
    animation = "timer-flash 1.5s infinite";
  }

  return (
    <div style={{ 
      fontFamily: 'monospace', fontSize: '1.1rem', color: color, fontWeight: 'bold',
      background: '#0a0c10', padding: '6px 12px', borderRadius: '6px', border: `1px solid ${color}`, animation: animation
    }}>
      ⏱ {elapsed}
    </div>
  );
};

// --- 🎯 FIXED INGESTION OF SERVER_IP PROP FROM PARENT COMPONENT ---
function Orders({ serverIp }) {
  const [orders, setOrders] = useState([]);

  const BASE_URL = (serverIp || import.meta.env.VITE_API_URL || "https://qr-cafeteria.onrender.com").replace(/\/$/, "");
  const API_URL = `${BASE_URL}/api/orders`; 
  const lastOrderCount = useRef(0);

  useEffect(() => {
    if ("Notification" in window) { Notification.requestPermission(); }
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/active`);
      const currentOrders = Array.isArray(res.data) ? res.data : [];

      if (currentOrders.length > lastOrderCount.current) {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio.play().catch(() => console.log("Audio notice waiting for user dashboard interaction to initialize."));

        if (Notification.permission === "granted") {
          new Notification("🔔 New Incoming Order!", {
            body: `Table ${currentOrders[0].tableId} has submitted a new food/drink order.`,
          });
        }
      }
      lastOrderCount.current = currentOrders.length;
      setOrders(currentOrders);
    } catch (err) { console.error("Error connecting to live orders data:", err); }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, [API_URL]);

  const verifyPayment = async (id) => {
    try { 
      await axios.put(`${API_URL}/${id}/verify`); 
      fetchOrders(); 
    } catch (err) { 
      alert("Could not approve or verify payment. Check system connection."); 
    }
  };

  const updateStatus = async (id, status) => {
    try { 
      await axios.put(`${API_URL}/${id}/status`, { status }); 
      fetchOrders(); 
    } catch (err) { 
      alert("Failed to update kitchen tracking status."); 
    }
  };

  const renderItemWithNotes = (itemName) => {
    if (!itemName) return null;
    const pureItems = itemName.split('[NOTE:')[0];
    return pureItems.split(", ").map((item, index) => {
      const parts = item.split(/(\(.*?\))/g);
      return (
        <div key={index} style={{ marginBottom: '8px', borderBottom: '1px solid #1c2330', paddingBottom: '6px' }}>
          {parts.map((part, i) => 
            part.startsWith("(") ? (
              <span key={i} style={{ color: '#ff6b35', fontWeight: 'bold', marginLeft: '6px', fontSize: '0.85rem' }}>
                ⚠️ {part.toUpperCase()}
              </span>
            ) : (
              <span key={i} style={{ fontWeight: '600', color: '#f1f5f9' }}>{part}</span>
            )
          )}
        </div>
      );
    });
  };

  return (
    <div style={{ background: '#141923', minHeight: '100vh', padding: '10px 20px', color: 'white', fontFamily: 'sans-serif' }}>
      <style>{`
        @keyframes timer-flash {
          0% { box-shadow: 0 0 5px #ff3d00; border-color: #ff3d00; }
          50% { box-shadow: 0 0 18px #ff3d00; border-color: #ffb300; }
          100% { box-shadow: 0 0 5px #ff3d00; border-color: #ff3d00; }
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #2a3547', paddingBottom: '20px', marginBottom: '25px' }}>
        <div>
           <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 900, letterSpacing: '0.5px' }}>KITCHEN | <span style={{color: '#ff6b35'}}>LIVE ORDERS WORKFLOW</span></h1>
           <span style={{ fontSize: '11px', fontWeight: 800, color: '#00e676', background: 'rgba(0, 230, 118, 0.08)', padding: '3px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '6px' }}>TOTAL LIVE ORDERS: {orders.length}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', display: 'block' }}>Production Environment</span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#475569' }}>CONNECTION: LIVE</span>
          </div>
          <span style={{ height: '12px', width: '12px', background: '#00e676', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 10px #00e676' }}></span>
        </div>
      </div>
      
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '100px', border: '1px dashed #2a3547', padding: '40px', borderRadius: '12px', background: '#0f131a' }}>
            <p style={{ color: '#64748b', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '1px', margin: 0 }}>WAITING FOR NEW CUSTOMER ORDERS...</p>
        </div>
      ) : (
        orders.map(o => (
          <div key={o.id || o._id} style={{ 
            background: '#1c2330', margin: '15px 0', padding: '20px', borderRadius: '12px', border: '1px solid #2a3547',
            borderLeft: o.paymentStatus === 'Verified' ? '5px solid #00e676' : '5px solid #ffb300',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)', position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontWeight: 900, color: o.paymentStatus === 'Verified' ? '#00e676' : '#ffb300' }}>
                    TABLE {o.tableId}
                </h2>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px'}}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>STAGE: {o.status.toUpperCase()}</span>
                  {o.surgeApplied && <span style={{background: '#ff3d00', color: '#fff', fontSize: '10px', fontWeight: '900', padding: '1px 5px', borderRadius: '3px'}}>⚡ PEAK HOURS PRICING</span>}
                </div>
              </div>

              <OrderTimer startTime={o.createdAt} />

              <span style={{ background: '#0a0c10', border: '1px solid #2a3547', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', color: o.paymentMethod === 'UPI' ? '#00b0ff' : '#94a3b8' }}>
                {o.paymentMethod} • {o.paymentStatus === 'Verified' ? 'PAID' : 'PAYMENT PENDING'}
              </span>
            </div>
            
            <div style={{ margin: '15px 0', padding: '15px', background: '#0a0c10', borderRadius: '8px', border: '1px solid #2a3547' }}>
                <div style={{ margin: 0, color: '#f1f5f9', lineHeight: '1.6' }}>
                  {renderItemWithNotes(o.item_name || o.itemsDescription)}
                </div>

                {o.instructions && o.instructions.trim() !== "" && (
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '10px 14px', 
                    backgroundColor: 'rgba(255, 107, 53, 0.06)', 
                    border: '1px dashed #ff6b35', 
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#ff6b35', letterSpacing: '0.5px' }}>
                      PREPARATION NOTE: "{o.instructions.toUpperCase()}"
                    </span>
                  </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>₹{o.totalAmount}</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {o.paymentStatus === 'Pending' && o.paymentMethod === 'UPI' && (
                  <button onClick={() => verifyPayment(o.id || o._id)} style={btnStyle("#00e676")}>APPROVE PAYMENT</button>
                )}

                {o.status === "Pending" && (
                    <button onClick={() => updateStatus(o.id || o._id, "Preparing")} style={btnStyle("#ff6b35")}>START PREPARATION</button>
                )}

                {o.status === "Preparing" && (
                    <button onClick={() => updateStatus(o.id || o._id, "Plating")} style={btnStyle("#00b0ff")}>READY FOR PLATING</button>
                )}

                <button onClick={() => updateStatus(o.id || o._id, "Completed")} style={btnStyle("#651fff")}>ORDER COMPLETED & ARCHIVE</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const btnStyle = (bg) => ({ 
  background: bg, border: 'none', color: 'white', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '11px', transition: '0.15s ease'
});

export default Orders;