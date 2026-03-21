"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import ParticleField from "./ParticleField";
import CyberpunkGrid from "./CyberpunkGrid";
import CameraController from "./CameraController";
import FloatingMemeCards from "./FloatingMemeCards";

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 2, 8], fov: 60 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "auto",
      }}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} color="#a855f7" intensity={1} />
        <pointLight position={[-5, 3, -5]} color="#ec4899" intensity={0.8} />
        <pointLight position={[0, -2, 5]} color="#06b6d4" intensity={0.6} />

        {/* Fog for depth */}
        <fog attach="fog" args={["#0a0a0f", 8, 30]} />

        {/* Components */}
        <ParticleField />
        <CyberpunkGrid />
        <FloatingMemeCards />
        <CameraController />
      </Suspense>
    </Canvas>
  );
}
