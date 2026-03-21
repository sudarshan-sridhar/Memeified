"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function getParticleCount() {
  if (typeof window === "undefined") return 300;
  const isMobile = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return 50;
  if (isMobile) return 100;
  return 300;
}

export default function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [count] = useState(getParticleCount);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  const { positions, colors, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    const palette = [
      [0.659, 0.333, 0.969], // purple
      [0.925, 0.282, 0.6],   // pink
      [0.024, 0.714, 0.824], // cyan
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color[0];
      colors[i * 3 + 1] = color[1];
      colors[i * 3 + 2] = color[2];

      speeds[i] = 0.2 + Math.random() * 0.8;
    }

    return { positions, colors, speeds };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current || reducedMotionRef.current) return;
    const posArray = pointsRef.current.geometry.attributes.position
      .array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      posArray[i3 + 1] += Math.sin(time * speeds[i] + i) * 0.002;
      posArray[i3] += (mouseRef.current.x * 0.5 - posArray[i3]) * 0.0003;
      posArray[i3 + 1] +=
        (mouseRef.current.y * 0.5 - posArray[i3 + 1]) * 0.0003;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const positionAttr = useMemo(
    () => new THREE.BufferAttribute(positions, 3),
    [positions]
  );
  const colorAttr = useMemo(
    () => new THREE.BufferAttribute(colors, 3),
    [colors]
  );

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <primitive attach="attributes-position" object={positionAttr} />
        <primitive attach="attributes-color" object={colorAttr} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
