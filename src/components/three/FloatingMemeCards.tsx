"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const CARD_DATA = [
  { emoji: "😂", color: "#ec4899" },
  { emoji: "🔥", color: "#f97316" },
  { emoji: "⚔️", color: "#a855f7" },
  { emoji: "🎬", color: "#06b6d4" },
];

function FloatingCard({
  position,
  color,
  speed,
  offset,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
  offset: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.position.y =
      position[1] + Math.sin(t * speed + offset) * 0.5;
    meshRef.current.rotation.y = t * 0.3 + offset;
    meshRef.current.rotation.x = Math.sin(t * 0.5 + offset) * 0.1;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.8, 1.0, 0.05]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.15}
        emissive={color}
        emissiveIntensity={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function FloatingMemeCards() {
  const cards = useMemo(
    () =>
      CARD_DATA.map((card, i) => ({
        ...card,
        position: [
          (i - 1.5) * 4 + (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 3 + 2,
          -5 - Math.random() * 5,
        ] as [number, number, number],
        speed: 0.4 + Math.random() * 0.4,
        offset: i * 1.5,
      })),
    []
  );

  return (
    <group>
      {cards.map((card, i) => (
        <FloatingCard
          key={i}
          position={card.position}
          color={card.color}
          speed={card.speed}
          offset={card.offset}
        />
      ))}
    </group>
  );
}
