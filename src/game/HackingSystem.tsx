'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  state,
  setNearHackable,
  advanceHack,
  completeHack,
  setPhase,
  MYSTERIES,
} from './gameStore'
import type { HackableTarget } from './gameStore'

export const HACKABLE_POSITIONS: Record<string, [number, number, number]> = {
  valve_kitchen:        [-6.5, 1.5, -3.5],
  gear_factory:         [2.2,  2.5, -8],
  door_alley:           [0,    1.5,  9.5],
  valve_plaza:          [2.5,  1.2,  1],
  door_kitchen_secret:  [-5,   1.5, -8.5],
}

const HACKABLE_LABELS: Record<string, string> = {
  valve_kitchen:        '蒸気バルブ',
  gear_factory:         '巨大歯車',
  door_alley:           '秘密の扉',
  valve_plaza:          '噴水バルブ',
  door_kitchen_secret:  '厨房の秘密扉',
}

const HACKABLE_TYPES: Record<string, HackableTarget['type']> = {
  valve_kitchen:        'valve',
  gear_factory:         'gear',
  door_alley:           'door',
  valve_plaza:          'valve',
  door_kitchen_secret:  'door',
}

const PROXIMITY_DIST = 3.0
const EXIT_PORTAL_POS = new THREE.Vector3(0, 0, 12)

// ─────────────────────────────────────────
// ValveMesh — reads state every frame
// ─────────────────────────────────────────
function ValveMesh({ hackId }: { hackId: string }) {
  const rimRef  = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame(() => {
    const unlocked  = state.unlockedDoors.includes(hackId) || state.steamBlasting.includes(hackId)
    const isActive  = !unlocked && MYSTERIES[state.currentMysteryIndex]?.hackTargetId === hackId

    if (rimRef.current) {
      rimRef.current.rotation.z += isActive ? 0.06 : (unlocked ? 0.025 : 0.006)
      const mat = rimRef.current.material as THREE.MeshStandardMaterial
      if (isActive) {
        const pulse = 0.5 + Math.sin(performance.now() / 340) * 0.5
        mat.emissiveIntensity = pulse * 4
        mat.color.setHex(0xff6600)
        mat.emissive.setHex(0xff3300)
      } else if (unlocked) {
        mat.emissiveIntensity = 1.5
        mat.color.setHex(0xff8800)
        mat.emissive.setHex(0xff4400)
      } else {
        mat.emissiveIntensity = 0.3
        mat.color.setHex(0xcc2200)
        mat.emissive.setHex(0x660000)
      }
    }
    if (lightRef.current) {
      const isActive2 = !unlocked && MYSTERIES[state.currentMysteryIndex]?.hackTargetId === hackId
      lightRef.current.intensity = unlocked
        ? 25
        : isActive2
          ? 25 + Math.abs(Math.sin(performance.now() / 280)) * 40
          : 5
    }
  })

  return (
    <group>
      <mesh ref={rimRef}>
        <torusGeometry args={[0.35, 0.06, 8, 12]} />
        <meshStandardMaterial color="#cc2200" emissive="#660000" emissiveIntensity={0.3}
          roughness={0.4} metalness={0.7} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <mesh key={i} rotation={[0, 0, angle]}>
          <boxGeometry args={[0.6, 0.04, 0.04]} />
          <meshStandardMaterial color="#8a3310" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      <pointLight ref={lightRef} color="#ff4400" intensity={1} distance={4} decay={2} />
    </group>
  )
}

// ─────────────────────────────────────────
// GearMesh
// ─────────────────────────────────────────
function GearMesh({ hackId }: { hackId: string }) {
  const meshRef  = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame((_, delta) => {
    const unlocked = state.unlockedDoors.includes(hackId)
    const isActive = !unlocked && MYSTERIES[state.currentMysteryIndex]?.hackTargetId === hackId

    if (meshRef.current) {
      meshRef.current.rotation.z += delta * (isActive ? 3.5 : unlocked ? 2.5 : 0.8)
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      if (isActive) {
        const pulse = 0.5 + Math.sin(performance.now() / 320) * 0.5
        mat.emissiveIntensity = pulse * 3
        mat.color.setHex(0xffcc00)
        mat.emissive.setHex(0xff8800)
      } else if (unlocked) {
        mat.emissiveIntensity = 1.2
        mat.color.setHex(0xffaa00)
        mat.emissive.setHex(0xff6600)
      } else {
        mat.emissiveIntensity = 0.2
        mat.color.setHex(0x8a6422)
        mat.emissive.setHex(0x3a2400)
      }
    }
    if (lightRef.current) {
      const isActive2 = !unlocked && MYSTERIES[state.currentMysteryIndex]?.hackTargetId === hackId
      lightRef.current.intensity = unlocked
        ? 30
        : isActive2
          ? 25 + Math.abs(Math.sin(performance.now() / 280)) * 40
          : 7.5
    }
  })

  return (
    <group>
      <mesh ref={meshRef}>
        <torusGeometry args={[0.45, 0.14, 6, 8]} />
        <meshStandardMaterial color="#8a6422" emissive="#3a2400" emissiveIntensity={0.2}
          roughness={0.3} metalness={0.9} />
      </mesh>
      <pointLight ref={lightRef} color="#ffaa44" intensity={1.5} distance={4} decay={2} />
    </group>
  )
}

// ─────────────────────────────────────────
// DoorMesh
// ─────────────────────────────────────────
function DoorMesh({ hackId }: { hackId: string }) {
  const meshRef  = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame(() => {
    const unlocked = state.unlockedDoors.includes(hackId)
    const isActive = !unlocked && MYSTERIES[state.currentMysteryIndex]?.hackTargetId === hackId

    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      if (isActive) {
        const pulse = 0.4 + Math.sin(performance.now() / 360) * 0.4
        mat.emissiveIntensity = pulse * 3
        mat.color.setHex(0x3388ff)
        mat.emissive.setHex(0x1144cc)
      } else if (unlocked) {
        mat.emissiveIntensity = 0.9
        mat.color.setHex(0x2a5a1a)
        mat.emissive.setHex(0x00aa44)
      } else {
        mat.emissiveIntensity = 0.15
        mat.color.setHex(0x1a1208)
        mat.emissive.setHex(0x221400)
      }
    }
    if (lightRef.current) {
      const isActive2 = !unlocked && MYSTERIES[state.currentMysteryIndex]?.hackTargetId === hackId
      lightRef.current.intensity = unlocked
        ? 25
        : isActive2
          ? 20 + Math.abs(Math.sin(performance.now() / 300)) * 30
          : 5
      lightRef.current.color.setHex(unlocked ? 0x00ff88 : isActive2 ? 0x4488ff : 0x886622)
    }
  })

  return (
    <group>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.0, 2.0, 0.1]} />
        <meshStandardMaterial color="#1a1208" emissive="#221400" emissiveIntensity={0.15}
          roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0.35, 0, 0.07]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#8a6422" roughness={0.3} metalness={1} />
      </mesh>
      <pointLight ref={lightRef} color="#886622" intensity={1} distance={4} decay={2} />
    </group>
  )
}

// ─────────────────────────────────────────
// Exit portal — visible when all 5 solved
// ─────────────────────────────────────────
function ExitPortal() {
  const groupRef    = useRef<THREE.Group>(null)
  const outerRef    = useRef<THREE.Mesh>(null)
  const innerRef    = useRef<THREE.Mesh>(null)
  const fillRef     = useRef<THREE.Mesh>(null)
  const lightRef    = useRef<THREE.PointLight>(null)

  useFrame((_state, delta) => {
    const active = state.mysteriesSolved >= 5
    if (!groupRef.current) return
    groupRef.current.visible = active
    if (!active) return

    const t = performance.now() / 1000

    if (outerRef.current) outerRef.current.rotation.z  =  t * 1.0
    if (innerRef.current) innerRef.current.rotation.z  = -t * 1.6
    if (fillRef.current) {
      const mat = fillRef.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.18 + Math.sin(t * 2) * 0.1
    }
    if (lightRef.current) {
      lightRef.current.intensity = 50 + Math.sin(t * 3) * 25
    }

    // Win trigger — player walks into portal
    if (state.phase === 'playing') {
      const playerPos = new THREE.Vector3(...state.playerPos)
      if (playerPos.distanceTo(EXIT_PORTAL_POS) < 2.2) {
        setPhase('won')
        if (typeof document !== 'undefined') document.exitPointerLock()
      }
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 12]} visible={false}>
      {/* Ground ring glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[1.0, 2.2, 32]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={1}
          transparent opacity={0.25} depthWrite={false} />
      </mesh>
      {/* Outer spinning arch */}
      <mesh ref={outerRef} position={[0, 1.6, 0]}>
        <torusGeometry args={[1.3, 0.07, 8, 28]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={4} />
      </mesh>
      {/* Inner counter-spinning ring */}
      <mesh ref={innerRef} position={[0, 1.6, 0]}>
        <torusGeometry args={[0.9, 0.05, 8, 20]} />
        <meshStandardMaterial color="#88ffcc" emissive="#88ffcc" emissiveIntensity={3} />
      </mesh>
      {/* Portal fill plane */}
      <mesh ref={fillRef} position={[0, 1.6, 0]}>
        <circleGeometry args={[1.25, 32]} />
        <meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={1.5}
          transparent opacity={0.22} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Vertical support pillar lights */}
      <mesh position={[-1.3, 0.8, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.6, 6]} />
        <meshStandardMaterial color="#00cc66" emissive="#00cc66" emissiveIntensity={2} />
      </mesh>
      <mesh position={[1.3, 0.8, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.6, 6]} />
        <meshStandardMaterial color="#00cc66" emissive="#00cc66" emissiveIntensity={2} />
      </mesh>
      <pointLight ref={lightRef} color="#00ff88" intensity={50} distance={14} decay={2}
        position={[0, 1.6, 0]} />
    </group>
  )
}

// ─────────────────────────────────────────
// HackableObject wrapper
// ─────────────────────────────────────────
function HackableObject({ id, position }: { id: string; position: [number, number, number] }) {
  const type = HACKABLE_TYPES[id] ?? 'item'
  return (
    <group position={position}>
      {type === 'valve' && <ValveMesh hackId={id} />}
      {type === 'gear'  && <GearMesh  hackId={id} />}
      {(type === 'door' || type === 'item') && <DoorMesh hackId={id} />}
    </group>
  )
}

// ─────────────────────────────────────────
// Main component
// ─────────────────────────────────────────
export default function HackingSystem() {
  useFrame((_, delta) => {
    if (state.phase !== 'playing' && state.phase !== 'hacking') return

    // Advance hacking progress
    if (state.isHacking && state.currentHackId) {
      const done = advanceHack(delta)
      if (done) {
        completeHack(state.currentHackId)
        return
      }
    }

    if (state.phase !== 'playing') return

    // Proximity detection
    const playerPos = new THREE.Vector3(...state.playerPos)
    let nearest: HackableTarget | null = null
    let nearestDist = PROXIMITY_DIST

    for (const [id, pos] of Object.entries(HACKABLE_POSITIONS)) {
      const objPos = new THREE.Vector3(...pos)
      const dist = playerPos.distanceTo(objPos)
      if (dist < nearestDist) {
        nearestDist = dist
        nearest = {
          id,
          type: HACKABLE_TYPES[id] ?? 'item',
          label: HACKABLE_LABELS[id] ?? id,
        }
      }
    }

    setNearHackable(nearest)
  })

  return (
    <>
      {Object.entries(HACKABLE_POSITIONS).map(([id, pos]) => (
        <HackableObject key={id} id={id} position={pos} />
      ))}
      <ExitPortal />
    </>
  )
}
