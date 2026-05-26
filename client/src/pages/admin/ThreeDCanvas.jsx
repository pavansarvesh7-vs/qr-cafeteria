import React, { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Float, MeshDistortMaterial, Text, ContactShadows, MeshWobbleMaterial } from "@react-three/drei";
import * as THREE from "three";

// Tracks mouse movement to subtly tilt the 3D dashboard view
const ResponsiveInteractiveGroup = ({ children }) => {
  const ref = useRef();
  const { viewport, mouse } = useThree();

  useFrame(() => {
    const x = (mouse.x * viewport.width) / 2;
    const y = (mouse.y * viewport.height) / 2;
    ref.current.rotation.set(y * 0.1, x * 0.1, 0);
  });

  return <group ref={ref}>{children}</group>;
};

// 3D Menu Button / Card
const FloatingMenuCard = ({ products = [], onSelect }) => (
  <Float speed={4} rotationIntensity={1} floatIntensity={2}>
    <mesh position={[-4, 2, 0]} onClick={onSelect}>
      <boxGeometry args={[1.8, 2.8, 0.1]} />
      <MeshDistortMaterial color="#050505" speed={5} distort={0.2} metalness={1} roughness={0} />
      <Text position={[0, 1, 0.1]} fontSize={0.15} color="#00f0ff" fontFamily="'Share Tech Mono', monospace">MANAGE MENU</Text>
      <Text position={[0, 0, 0.1]} fontSize={0.12} color="white" fontFamily="'Share Tech Mono', monospace">ITEMS: {products.length}</Text>
    </mesh>
  </Float>
);

// 3D Centerpiece showcasing total earnings
const RevenueDisplaySphere = ({ stats }) => (
  <Float speed={2} rotationIntensity={2} floatIntensity={1}>
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[1.3, 64, 64]} />
      <MeshWobbleMaterial color="#080808" factor={1} speed={2} emissive="#39ff14" emissiveIntensity={0.5} />
      <Text position={[0, 2, 0]} fontSize={0.25} color="#39ff14" fontFamily="'Share Tech Mono', monospace">₹{stats.revenue.toLocaleString()}</Text>
    </mesh>
  </Float>
);

// 3D Visual Indicators representing physical restaurant tables
const TableStatusIndicator = ({ tableId, hasAlert }) => (
  <Float speed={5} floatIntensity={3}>
    <mesh position={[4, (tableId * 1.5) - 3, 0]}>
      <octahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color={hasAlert ? "#ff0055" : "#00ff66"} emissive={hasAlert ? "#ff0055" : "#00ff66"} emissiveIntensity={1} />
      <Text position={[0, 0.8, 0]} fontSize={0.2} color="white" fontFamily="'Share Tech Mono', monospace">Table {tableId}</Text>
    </mesh>
  </Float>
);

const ThreeDCanvas = ({ products, stats, notifications, setActiveSection }) => {
  return (
    <div style={{ width: "100%", height: "100%", background: "black" }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f0ff" />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#39ff14" />

        <Suspense fallback={null}>
          <ResponsiveInteractiveGroup>
            {/* Menu access shortcut panel */}
            <FloatingMenuCard products={products} onSelect={() => setActiveSection("menu")} />
            
            {/* Main daily earnings display */}
            <RevenueDisplaySphere stats={stats} />
            
            {/* Interactive maps of live table alerts */}
            {[1, 2, 3, 4].map((id) => (
              <TableStatusIndicator 
                key={id} 
                tableId={id} 
                hasAlert={notifications.some(n => Number(n.table_id || n.tableId) === id)} 
              />
            ))}
          </ResponsiveInteractiveGroup>

          <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2} />
        </Suspense>

        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
};

export default ThreeDCanvas;