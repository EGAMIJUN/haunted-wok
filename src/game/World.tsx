'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const NEON_PALETTE = ['#ff00ff', '#00ffff', '#ffff00', '#ff0044', '#00ff44', '#8800ff']

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[42, 42]} />
      <meshStandardMaterial color="#050505" roughness={0.9} metalness={0.0} />
    </mesh>
  )
}

// Sparse neon grid: every 4 units = 11 strips per direction = 22 meshes total
function NeonGrid() {
  const strips: JSX.Element[] = []
  for (let i = -20; i <= 20; i += 4) {
    const color = NEON_PALETTE[Math.abs(i / 4) % 6]
    strips.push(
      <mesh key={`x${i}`} position={[i, 0.01, 0]}>
        <boxGeometry args={[0.06, 0.02, 40]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3.0} roughness={0.5} />
      </mesh>
    )
    strips.push(
      <mesh key={`z${i}`} position={[0, 0.01, i]}>
        <boxGeometry args={[40, 0.02, 0.06]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3.0} roughness={0.5} />
      </mesh>
    )
  }
  return <>{strips}</>
}

function GasLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 3, 6]} />
        <meshStandardMaterial color="#b48840" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[0, 3.1, 0]}>
        <cylinderGeometry args={[0.18, 0.12, 0.4, 5]} />
        <meshStandardMaterial color="#b48840" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[0, 3.0, 0]}>
        <sphereGeometry args={[0.1, 5, 4]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={10} roughness={0.5} />
      </mesh>
    </group>
  )
}

function Restaurant() {
  return (
    <group>
      <mesh position={[-5, 1.5, -9]}>
        <boxGeometry args={[8, 3, 0.3]} />
        <meshStandardMaterial color="#330022" emissive="#ff00ff" emissiveIntensity={1.5} roughness={0.85} />
      </mesh>
      <mesh position={[-7.5, 1.5, -3]}>
        <boxGeometry args={[3, 3, 0.3]} />
        <meshStandardMaterial color="#330022" emissive="#ff00ff" emissiveIntensity={1.5} roughness={0.85} />
      </mesh>
      <mesh position={[-2.5, 1.5, -3]}>
        <boxGeometry args={[3, 3, 0.3]} />
        <meshStandardMaterial color="#330022" emissive="#ff00ff" emissiveIntensity={1.5} roughness={0.85} />
      </mesh>
      <mesh position={[-9, 1.5, -6]}>
        <boxGeometry args={[0.3, 3, 6]} />
        <meshStandardMaterial color="#330022" emissive="#ff00ff" emissiveIntensity={1.5} roughness={0.85} />
      </mesh>
      <mesh position={[-1, 1.5, -6]}>
        <boxGeometry args={[0.3, 3, 6]} />
        <meshStandardMaterial color="#330022" emissive="#ff00ff" emissiveIntensity={1.5} roughness={0.85} />
      </mesh>
      <mesh position={[-5, 3.2, -6]}>
        <boxGeometry args={[8.6, 0.3, 6.6]} />
        <meshStandardMaterial color="#220011" emissive="#880044" emissiveIntensity={1.0} roughness={1} />
      </mesh>
      {/* Neon sign */}
      <mesh position={[-5, 2.8, -2.85]}>
        <boxGeometry args={[4, 0.8, 0.1]} />
        <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={8} roughness={0.3} />
      </mesh>
      <mesh position={[-5, 2.0, -2.85]}>
        <boxGeometry args={[3, 0.5, 0.1]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={6} roughness={0.3} />
      </mesh>
      {/* Door frame */}
      <mesh position={[-5, 1.5, -3.1]}>
        <boxGeometry args={[1.2, 3, 0.05]} />
        <meshStandardMaterial color="#220011" roughness={1} />
      </mesh>
    </group>
  )
}

function FactoryGear({ gearRef }: { gearRef: React.RefObject<THREE.Mesh> }) {
  return (
    <mesh ref={gearRef} position={[6, 2.5, -4.1]}>
      <torusGeometry args={[0.9, 0.3, 5, 8]} />
      <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={5} roughness={0.2} metalness={0.9} />
    </mesh>
  )
}

function Factory() {
  const gearRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (gearRef.current) gearRef.current.rotation.z += delta * 0.8
  })

  return (
    <group>
      <mesh position={[6, 2, -12]}>
        <boxGeometry args={[8, 4, 0.3]} />
        <meshStandardMaterial color="#002233" emissive="#00ffff" emissiveIntensity={1.5} roughness={0.9} />
      </mesh>
      <mesh position={[3.5, 2, -4]}>
        <boxGeometry args={[3, 4, 0.3]} />
        <meshStandardMaterial color="#002233" emissive="#00ffff" emissiveIntensity={1.5} roughness={0.9} />
      </mesh>
      <mesh position={[8.5, 2, -4]}>
        <boxGeometry args={[3, 4, 0.3]} />
        <meshStandardMaterial color="#002233" emissive="#00ffff" emissiveIntensity={1.5} roughness={0.9} />
      </mesh>
      <mesh position={[2, 2, -8]}>
        <boxGeometry args={[0.3, 4, 8]} />
        <meshStandardMaterial color="#002233" emissive="#00ffff" emissiveIntensity={1.5} roughness={0.9} />
      </mesh>
      <mesh position={[10, 2, -8]}>
        <boxGeometry args={[0.3, 4, 8]} />
        <meshStandardMaterial color="#002233" emissive="#00ffff" emissiveIntensity={1.5} roughness={0.9} />
      </mesh>
      <mesh position={[6, 4.2, -8]}>
        <boxGeometry args={[8.6, 0.3, 8.6]} />
        <meshStandardMaterial color="#001122" emissive="#004455" emissiveIntensity={1.0} roughness={1} />
      </mesh>
      <mesh position={[8, 6, -10]}>
        <cylinderGeometry args={[0.3, 0.4, 4, 6]} />
        <meshStandardMaterial color="#001a2a" roughness={1} />
      </mesh>
      {/* Iron doors */}
      <mesh position={[5.4, 1.5, -4.1]}>
        <boxGeometry args={[1.0, 2.8, 0.08]} />
        <meshStandardMaterial color="#002233" emissive="#00ffff" emissiveIntensity={1} roughness={0.6} metalness={0.5} />
      </mesh>
      <mesh position={[6.6, 1.5, -4.1]}>
        <boxGeometry args={[1.0, 2.8, 0.08]} />
        <meshStandardMaterial color="#002233" emissive="#00ffff" emissiveIntensity={1} roughness={0.6} metalness={0.5} />
      </mesh>
      <FactoryGear gearRef={gearRef} />
    </group>
  )
}

function Alley() {
  return (
    <group>
      <mesh position={[-4, 1.5, 6]}>
        <boxGeometry args={[0.3, 3, 8]} />
        <meshStandardMaterial color="#220011" emissive="#ff0044" emissiveIntensity={1.5} roughness={0.9} />
      </mesh>
      <mesh position={[4, 1.5, 6]}>
        <boxGeometry args={[0.3, 3, 8]} />
        <meshStandardMaterial color="#220011" emissive="#ff0044" emissiveIntensity={1.5} roughness={0.9} />
      </mesh>
      <mesh position={[0, 3, 6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 8, 6]} />
        <meshStandardMaterial color="#ff0044" emissive="#ff0044" emissiveIntensity={2} roughness={0.6} metalness={0.4} />
      </mesh>
    </group>
  )
}

function Plaza() {
  const waterRef = useRef<THREE.Mesh>(null)

  useFrame((s) => {
    if (waterRef.current) {
      const sc = 1 + Math.sin(s.clock.elapsedTime * 1.5) * 0.03
      waterRef.current.scale.set(sc, sc, 1)
    }
  })

  return (
    <group>
      <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.3, 6, 12]} />
        <meshStandardMaterial color="#1a2a1a" emissive="#00ff44" emissiveIntensity={0.5} roughness={0.85} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 0.9, 6]} />
        <meshStandardMaterial color="#1a2a1a" emissive="#00ff44" emissiveIntensity={0.5} roughness={0.85} metalness={0.2} />
      </mesh>
      <mesh ref={waterRef} position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.0, 12]} />
        <meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={3} roughness={0.1} transparent opacity={0.85} />
      </mesh>
      <GasLamp position={[-5.5, 0, -3]} />
      <GasLamp position={[5.5, 0, -3]} />
      <GasLamp position={[-5.5, 0, 3]} />
      <GasLamp position={[5.5, 0, 3]} />
    </group>
  )
}

function SkyDome() {
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[180, 12, 8]} />
      <meshBasicMaterial color="#050514" side={THREE.BackSide} />
    </mesh>
  )
}

export default function World() {
  return (
    <group>
      <ambientLight color="#ffffff" intensity={8.0} />
      <hemisphereLight args={['#ff00ff', '#00ff44', 3.0]} />
      <directionalLight color="#00ffff" intensity={2.0} position={[-8, 20, 10]} />
      {/* 4 global neon point lights */}
      <pointLight color="#ff00ff" intensity={120} distance={22} decay={2} position={[-5, 5, -6]} />
      <pointLight color="#00ffff" intensity={120} distance={22} decay={2} position={[6, 5, -8]} />
      <pointLight color="#ff0044" intensity={100} distance={18} decay={2} position={[0, 5, 6]} />
      <pointLight color="#00ff44" intensity={100} distance={18} decay={2} position={[0, 5, 0]} />
      <SkyDome />
      <Ground />
      <NeonGrid />
      <Restaurant />
      <Factory />
      <Alley />
      <Plaza />
    </group>
  )
}
