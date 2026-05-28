import React from "react";

export default function GridBackground() {
  return (
    <>
      <div className="scifi-grid-container" aria-hidden="true">
        {/* Top Ceiling Plane */}
        <div className="matrix-plane top-plane">
          <div className="grid-lens"></div>
        </div>
        {/* Bottom Floor Plane */}
        <div className="matrix-plane bottom-plane">
          <div className="grid-lens"></div>
        </div>
      </div>

      <style>{`
        .scifi-grid-container {
          --grid-size: clamp(6rem, 15vw, 10rem);
          /* Combine base wireframe color and safe overlay values */
          --grid-color: rgba(0, 255, 65, 0.85);
          --grid-glow: rgba(0, 255, 65, 0.25);
          
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: #020305;
          overflow: hidden;
          z-index: 1;
          perspective: 60rem;
          perspective-origin: 50% 50%;
          /* Prevent any multi-axis layer breakdown leaks */
          pointer-events: none;
        }

        .matrix-plane {
          position: absolute;
          width: 300%;
          height: 150%;
          left: -100%;
          transform-style: preserve-3d;
          pointer-events: none;
        }

        /* Bottom Floor Configuration */
        .bottom-plane {
          bottom: 0;
          transform-origin: center bottom;
          transform: rotateX(84deg);
        }

        /* Top Ceiling Configuration */
        .top-plane {
          top: 0;
          transform-origin: center top;
          transform: rotateX(-84deg);
        }

        /* 🧠 EXPERT OPTIMIZATION: Combine sharp line and neon glow into a single asset block */
        .grid-lens {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background-image: 
            /* Vertical Glow Line Array */
            repeating-linear-gradient(to right, var(--grid-glow), transparent 6px, transparent var(--grid-size)),
            repeating-linear-gradient(to right, var(--grid-color), var(--grid-color) 2px, transparent 2px, transparent var(--grid-size)),
            /* Horizontal Glow Line Array */
            repeating-linear-gradient(to bottom, var(--grid-glow), transparent 6px, transparent var(--grid-size)),
            repeating-linear-gradient(to bottom, var(--grid-color), var(--grid-color) 2px, transparent 2px, transparent var(--grid-size));
          
          /* Enforce GPU isolation parameters on active layers */
          transform: translate3d(0,0,0);
          -webkit-transform: translate3d(0,0,0);
          will-change: transform;
        }

        /* 🏎️ VELOCITY TUNING LOGIC WITH GPU REPOSITIONING HINTS */
        .bottom-plane .grid-lens {
          animation: flightFloor 45s linear infinite;
        }

        .top-plane .grid-lens {
          animation: flightCeiling 45s linear infinite;
        }

        /* Horizon Smooth Linear Gradient Coverups */
        .bottom-plane::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background-image: linear-gradient(to top, rgba(2, 3, 5, 0) 15%, rgba(2, 3, 5, 1) 75%);
          z-index: 2;
        }

        .top-plane::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background-image: linear-gradient(to bottom, rgba(2, 3, 5, 0) 15%, rgba(2, 3, 5, 1) 75%);
          z-index: 2;
        }

        /* GPU accelerated structural animation vectors */
        @keyframes flightFloor {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(0, var(--grid-size), 0); }
        }

        @keyframes flightCeiling {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(0, calc(var(--grid-size) * -1), 0); }
        }

        @media (max-width: 768px) {
          .scifi-grid-container {
            perspective: 45rem;
          }
          .bottom-plane { transform: rotateX(82deg); }
          .top-plane { transform: rotateX(-82deg); }
        }
      `}</style>
    </>
  );
}