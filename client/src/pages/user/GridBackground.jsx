import React from "react";

export default function GridBackground() {
  return (
    <>
      <div className="scifi-grid-container">
        {/* Top Ceiling Plane */}
        <div className="matrix-plane top-plane">
          <div className="grid-lens"></div>
          <div className="glow-lens"></div>
        </div>
        {/* Bottom Floor Plane */}
        <div className="matrix-plane bottom-plane">
          <div className="grid-lens"></div>
          <div className="glow-lens"></div>
        </div>
      </div>

      <style>{`
        .scifi-grid-container {
          --grid-size: clamp(6rem, 15vw, 10rem);
          --grid-color: #00ff41;
          --grid-glow: rgba(0, 255, 65, 0.35);
          
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: #020305;
          overflow: hidden;
          z-index: 1;
          perspective: 80rem;
          perspective-origin: 50% 50%;
        }

        .matrix-plane {
          position: absolute;
          width: 400%;
          height: 200%;
          left: -150%;
          transform-style: preserve-3d;
        }

        /* Bottom Floor Configuration */
        .bottom-plane {
          bottom: 0;
          transform-origin: center bottom;
          transform: rotateX(82deg);
        }

        /* Top Ceiling Configuration */
        .top-plane {
          top: 0;
          transform-origin: center top;
          transform: rotateX(-82deg);
        }

        .grid-lens, .glow-lens {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          transform-style: preserve-3d;
        }

        /* Infinite Grid Line Generators */
        .grid-lens::before, .glow-lens::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background-image: 
            repeating-linear-gradient(to right, var(--grid-color), var(--grid-color) 2px, transparent 2px, transparent var(--grid-size)),
            repeating-linear-gradient(to bottom, var(--grid-color), var(--grid-color) 2px, transparent 2px, transparent var(--grid-size));
        }

        /* 🏎️ VELOCITY TUNING LOGIC:
          Changed from 12s to 90s. 
          Increase to 120s if you want it even slower, or lower to 60s to speed it up slightly.
        */
        .bottom-plane .grid-lens::before, .bottom-plane .glow-lens::before {
          animation: flightFloor 90s linear infinite;
        }

        .top-plane .grid-lens::before, .top-plane .glow-lens::before {
          animation: flightCeiling 90s linear infinite;
        }

        /* Horizon Fade Gradient Coverups */
        .bottom-plane .grid-lens::after, .bottom-plane .glow-lens::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background-image: linear-gradient(to top, rgba(2, 3, 5, 0) 20%, rgba(2, 3, 5, 1) 85%);
          z-index: 2;
          transform: translateZ(1px);
        }

        .top-plane .grid-lens::after, .top-plane .glow-lens::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background-image: linear-gradient(to bottom, rgba(2, 3, 5, 0) 20%, rgba(2, 3, 5, 1) 85%);
          z-index: 2;
          transform: translateZ(1px);
        }

        /* Expanded Blur Layer for High Intensity Neons */
        .glow-lens {
          filter: blur(6px);
          opacity: 0.6;
          mix-blend-mode: screen;
        }

        @keyframes flightFloor {
          from { transform: translateY(0); }
          to { transform: translateY(var(--grid-size)); }
        }

        @keyframes flightCeiling {
          from { transform: translateY(0); }
          to { transform: translateY(calc(var(--grid-size) * -1)); }
        }

        @media (max-width: 768px) {
          .scifi-grid-container {
            perspective: 50rem;
          }
          .bottom-plane { transform: rotateX(80deg); }
          .top-plane { transform: rotateX(-80deg); }
        }
      `}</style>
    </>
  );
}