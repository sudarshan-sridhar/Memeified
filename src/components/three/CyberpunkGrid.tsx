"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function CyberpunkGrid() {
  const gridRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => {
    const points: number[] = [];
    const gridSize = 40;
    const divisions = 40;
    const step = gridSize / divisions;
    const half = gridSize / 2;

    // Horizontal lines (along X)
    for (let i = 0; i <= divisions; i++) {
      const z = -half + i * step;
      points.push(-half, 0, z, half, 0, z);
    }

    // Vertical lines (along Z)
    for (let i = 0; i <= divisions; i++) {
      const x = -half + i * step;
      points.push(x, 0, -half, x, 0, half);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(points, 3)
    );
    return geo;
  }, []);

  useFrame((state) => {
    if (!gridRef.current) return;
    // Subtle scroll-forward animation
    gridRef.current.position.z =
      (state.clock.elapsedTime * 0.3) % 1;
  });

  return (
    <lineSegments
      ref={gridRef}
      geometry={geometry}
      position={[0, -3, 0]}
      rotation={[0, 0, 0]}
    >
      <lineBasicMaterial
        color="#a855f7"
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}
