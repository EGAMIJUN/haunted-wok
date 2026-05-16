'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { state, setPhase, setCookProximity } from './gameStore'
import { WALL_BOUNDS } from './Player'

const WALL_PUSH_RADIUS = 0.5

function pushCookOutOfBounds(pos: THREE.Vector3): void {
  for (const b of WALL_BOUNDS) {
    if (
      pos.x > b.minX - WALL_PUSH_RADIUS &&
      pos.x < b.maxX + WALL_PUSH_RADIUS &&
      pos.z > b.minZ - WALL_PUSH_RADIUS &&
      pos.z < b.maxZ + WALL_PUSH_RADIUS
    ) {
      const ol = pos.x - (b.minX - WALL_PUSH_RADIUS)
      const or_ = (b.maxX + WALL_PUSH_RADIUS) - pos.x
      const of_ = pos.z - (b.minZ - WALL_PUSH_RADIUS)
      const ob = (b.maxZ + WALL_PUSH_RADIUS) - pos.z
      const min = Math.min(ol, or_, of_, ob)
      if (min === ol)  pos.x = b.minX - WALL_PUSH_RADIUS
      else if (min === or_) pos.x = b.maxX + WALL_PUSH_RADIUS
      else if (min === of_) pos.z = b.minZ - WALL_PUSH_RADIUS
      else pos.z = b.maxZ + WALL_PUSH_RADIUS
    }
  }
}

// The 3m INSANE COOK MODEL
function InsaneCookModel() {
  return (
    <group>
      {/* LEGS — black */}
      <mesh position={[-0.35, 0.55, 0]} castShadow>
        <boxGeometry args={[0.38, 1.1, 0.38]} />
        <meshStandardMaterial color="#000000" roughness={0.8} />
      </mesh>
      <mesh position={[0.35, 0.55, 0]} castShadow>
        <boxGeometry args={[0.38, 1.1, 0.38]} />
        <meshStandardMaterial color="#000000" roughness={0.8} />
      </mesh>
      {/* LOWER BODY — neon red */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <boxGeometry args={[0.9, 0.65, 0.55]} />
        <meshStandardMaterial color="#ff0044" emissive="#ff0044" emissiveIntensity={2} roughness={0} />
      </mesh>
      {/* CHEST — wide inverted triangle, black */}
      <mesh position={[0, 1.95, 0]} castShadow>
        <boxGeometry args={[1.8, 0.85, 0.75]} />
        <meshStandardMaterial color="#000000" roughness={0.8} />
      </mesh>
      {/* CHEST STRIPES — neon red strips */}
      <mesh position={[-0.5, 1.95, 0.39]}>
        <boxGeometry args={[0.2, 0.7, 0.02]} />
        <meshStandardMaterial color="#ff0044" emissive="#ff0044" emissiveIntensity={4} roughness={0} />
      </mesh>
      <mesh position={[0.5, 1.95, 0.39]}>
        <boxGeometry args={[0.2, 0.7, 0.02]} />
        <meshStandardMaterial color="#ff0044" emissive="#ff0044" emissiveIntensity={4} roughness={0} />
      </mesh>
      {/* NECK — neon red */}
      <mesh position={[0, 2.48, 0]}>
        <boxGeometry args={[0.55, 0.35, 0.5]} />
        <meshStandardMaterial color="#ff0044" emissive="#ff0044" emissiveIntensity={2} roughness={0} />
      </mesh>
      {/* HEAD — horizontally stretched ellipsoid, jet black */}
      <mesh position={[0, 2.88, 0]} scale={[2.4, 0.72, 1.1]} castShadow>
        <sphereGeometry args={[0.75, 8, 6]} />
        <meshStandardMaterial color="#0a0000" roughness={0.9} />
      </mesh>
      {/* 3 EYES — pure black, no emissive */}
      <mesh position={[-0.7, 2.95, 0.72]}>
        <sphereGeometry args={[0.1, 6, 5]} />
        <meshStandardMaterial color="#000000" roughness={1} />
      </mesh>
      <mesh position={[0, 2.98, 0.78]}>
        <sphereGeometry args={[0.12, 6, 5]} />
        <meshStandardMaterial color="#000000" roughness={1} />
      </mesh>
      <mesh position={[0.7, 2.95, 0.72]}>
        <sphereGeometry args={[0.1, 6, 5]} />
        <meshStandardMaterial color="#000000" roughness={1} />
      </mesh>
      {/* CHEF HAT — small, absurd */}
      <mesh position={[0, 3.45, 0]}>
        <cylinderGeometry args={[0.35, 0.5, 0.12, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.72, 0]}>
        <cylinderGeometry args={[0.28, 0.35, 0.5, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      {/* LEFT ARM — neon red */}
      <mesh position={[-1.35, 1.9, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.8, 0.38, 0.38]} />
        <meshStandardMaterial color="#ff0044" emissive="#ff0044" emissiveIntensity={2} roughness={0} />
      </mesh>
      {/* LEFT CLEAVER — metal, glowing edge */}
      <mesh position={[-2.0, 1.8, 0]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.07, 0.9, 0.42]} />
        <meshStandardMaterial color="#888888" emissive="#ffffff" emissiveIntensity={3} roughness={0.1} metalness={1} />
      </mesh>
      {/* RIGHT ARM */}
      <mesh position={[1.35, 1.9, 0]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.8, 0.38, 0.38]} />
        <meshStandardMaterial color="#ff0044" emissive="#ff0044" emissiveIntensity={2} roughness={0} />
      </mesh>
      {/* RIGHT CLEAVER */}
      <mesh position={[2.0, 1.8, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.07, 0.9, 0.42]} />
        <meshStandardMaterial color="#888888" emissive="#ffffff" emissiveIntensity={3} roughness={0.1} metalness={1} />
      </mesh>
      {/* Red point light for menace */}
      <pointLight color="#ff0044" intensity={80} distance={10} decay={2} position={[0, 2, 0]} />
    </group>
  )
}

export default function CookEnemy() {
  const groupRef = useRef<THREE.Group>(null)
  const posRef = useRef(new THREE.Vector3(-5, 0, -3))
  const burstVelRef = useRef(0)
  const burstTimerRef = useRef(0)
  const prevKickRef = useRef(false)

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return
    if (state.phase !== 'playing' || state.horrorLevel < 4) {
      group.visible = false
      return
    }
    group.visible = true

    const playerPos = new THREE.Vector3(...state.playerPos)
    const cookPos = posRef.current

    // Beat kick burst
    if (state.beatKick && !prevKickRef.current) {
      burstVelRef.current = 6.0
      burstTimerRef.current = 0.18
    }
    prevKickRef.current = state.beatKick

    if (burstTimerRef.current > 0) {
      burstTimerRef.current -= delta
      if (burstTimerRef.current <= 0) burstVelRef.current = 0
    }

    // Direction to player
    const dir = new THREE.Vector3(playerPos.x - cookPos.x, 0, playerPos.z - cookPos.z)
    const dist = dir.length()

    if (dist > 0.01) {
      dir.normalize()
      const speed = 1.5 + burstVelRef.current
      cookPos.addScaledVector(dir, speed * delta)
      cookPos.x = Math.max(-19, Math.min(19, cookPos.x))
      cookPos.z = Math.max(-19, Math.min(19, cookPos.z))
      pushCookOutOfBounds(cookPos)
      group.rotation.y = Math.atan2(dir.x, dir.z)
    }

    // Jitter on beat — INSANE SHAKE
    const jitter = state.beatKick ? (Math.random() - 0.5) * 0.35 : (Math.random() - 0.5) * 0.04
    group.position.set(cookPos.x, cookPos.y + jitter, cookPos.z)
    group.rotation.z = state.beatKick ? (Math.random() - 0.5) * 0.4 : (Math.random() - 0.5) * 0.05

    state.cookPos = [cookPos.x, cookPos.y, cookPos.z]

    const proximity = 1 - Math.min(dist / 12, 1)
    setCookProximity(proximity)

    if (dist < 1.8) {
      setPhase('caught')
      if (typeof document !== 'undefined') document.exitPointerLock()
    }
  })

  return (
    <group ref={groupRef} position={[-5, 0, -3]} visible={false}>
      <InsaneCookModel />
    </group>
  )
}
