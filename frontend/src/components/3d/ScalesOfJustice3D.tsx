import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";

function Scales() {
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: "#60a5fa",
    metalness: 0.8,
    roughness: 0.2,
    emissive: "#3b82f6",
    emissiveIntensity: 0.3,
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <group rotation={[0, 0, 0]}>
        {/* Center post */}
        <mesh position={[0, 0, 0]} material={goldMaterial}>
          <cylinderGeometry args={[0.08, 0.12, 2, 16]} />
        </mesh>

        {/* Base */}
        <mesh position={[0, -1.1, 0]} material={goldMaterial}>
          <cylinderGeometry args={[0.6, 0.7, 0.2, 32]} />
        </mesh>

        {/* Cross beam */}
        <mesh position={[0, 0.9, 0]} material={goldMaterial}>
          <boxGeometry args={[2.4, 0.08, 0.08]} />
        </mesh>

        {/* Top ornament */}
        <mesh position={[0, 1.05, 0]} material={goldMaterial}>
          <sphereGeometry args={[0.12, 16, 16]} />
        </mesh>

        {/* Left chain */}
        {[-0.2, -0.4, -0.6].map((y, i) => (
          <mesh key={`left-${i}`} position={[-1.1, 0.7 + y, 0]} material={goldMaterial}>
            <torusGeometry args={[0.04, 0.015, 8, 16]} />
          </mesh>
        ))}

        {/* Right chain */}
        {[-0.2, -0.4, -0.6].map((y, i) => (
          <mesh key={`right-${i}`} position={[1.1, 0.7 + y, 0]} material={goldMaterial}>
            <torusGeometry args={[0.04, 0.015, 8, 16]} />
          </mesh>
        ))}

        {/* Left pan */}
        <mesh position={[-1.1, 0, 0]} rotation={[0.1, 0, 0]} material={goldMaterial}>
          <cylinderGeometry args={[0.4, 0.35, 0.1, 32]} />
        </mesh>

        {/* Right pan */}
        <mesh position={[1.1, -0.15, 0]} rotation={[-0.1, 0, 0]} material={goldMaterial}>
          <cylinderGeometry args={[0.4, 0.35, 0.1, 32]} />
        </mesh>
      </group>
    </Float>
  );
}

export function ScalesOfJustice3D() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        className="!bg-transparent"
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#60a5fa" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
          <spotLight
            position={[0, 5, 5]}
            angle={0.3}
            penumbra={1}
            intensity={1}
            color="#ffffff"
          />

          {/* Scales */}
          <Scales />

          {/* Controls */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={1}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
