import React from "react";

export default function MenuCard({ products, addToCart }) {
  // Graceful fallback structure if initial rendering array handles are empty
  const activeProduct = products?.[0] || {
    name: "idly",
    price: 10,
    image: "",
    description: "Soft, fluffy steamed rice cakes served alongside house signature sambar streams."
  };

  return (
    <div style={styles.cardContainer}>
      {/* Product Interactive Display Frame Panel */}
      <div style={styles.imageFrame}>
        {activeProduct.image ? (
          <img 
            src={activeProduct.image} 
            alt={activeProduct.name} 
            style={styles.productImg} 
          />
        ) : (
          <div style={styles.imagePlaceholder}>
            <span style={styles.placeholderIcon}>🍽️</span>
          </div>
        )}
        
        {/* Selection Status Badge Tag */}
        <div style={styles.selectionRibbon}>
          <span style={styles.pulseDot}>●</span> ACTIVE_SHOWCASE
        </div>
      </div>

      {/* Main Structural Details Block Container */}
      <div style={styles.detailsContent}>
        <div style={styles.textGroup}>
          <h2 style={styles.productTitle}>{activeProduct.name}</h2>
          {activeProduct.description && (
            <p style={styles.productDesc}>{activeProduct.description}</p>
          )}
        </div>

        {/* Pricing Actions Group Segment Block */}
        <div style={styles.interactiveRow}>
          <div style={styles.priceContainer}>
            <span style={styles.priceLabel}>VAL_UNIT:</span>
            <span style={styles.priceTag}>₹{activeProduct.price}</span>
          </div>
          
          <button 
            onClick={() => addToCart && addToCart(activeProduct)}
            style={styles.actionBtn}
          >
            INITIALIZE_ORDER
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  cardContainer: {
    width: "100%",
    backgroundColor: "rgba(11, 13, 19, 0.85)",
    border: "2px solid #00ff41", 
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0, 255, 65, 0.1)",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    backdropFilter: "blur(10px)"
  },
  imageFrame: {
    width: "100%",
    height: "210px",
    position: "relative",
    backgroundColor: "#020305",
    borderBottom: "1px solid rgba(0, 255, 65, 0.2)"
  },
  productImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0b0d13 0%, #020305 100%)"
  },
  placeholderIcon: {
    fontSize: "2.5rem",
    opacity: 0.15
  },
  selectionRibbon: {
    position: "absolute",
    top: "16px",
    left: "16px",
    backgroundColor: "rgba(2, 3, 5, 0.85)",
    backdropFilter: "blur(6px)",
    color: "#00ff41",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
    fontFamily: "'Share Tech Mono', monospace",
    letterSpacing: "1px",
    border: "1px solid rgba(0, 255, 65, 0.35)",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  pulseDot: {
    fontSize: "10px",
    color: "#00ff41"
  },
  detailsContent: {
    padding: "26px 24px", 
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  textGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  productTitle: {
    fontSize: "1.8rem",
    fontWeight: "800",
    color: "#fff",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontFamily: "'Share Tech Mono', monospace"
  },
  productDesc: {
    fontSize: "13.5px",
    color: "#8fa0bc",
    lineHeight: "1.6",
    margin: 0
  },
  interactiveRow: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    fontFamily: "'Share Tech Mono', monospace"
  },
  priceContainer: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px"
  },
  priceLabel: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "bold"
  },
  priceTag: {
    fontSize: "1.75rem",
    fontWeight: "900",
    color: "#00ff41",
    textShadow: "0 0 10px rgba(0, 255, 65, 0.2)"
  },
  actionBtn: {
    width: "100%",
    padding: "16px",
    backgroundColor: "#fff",
    color: "#000",
    border: "none",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "900",
    letterSpacing: "1px",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.15s ease"
  }
};