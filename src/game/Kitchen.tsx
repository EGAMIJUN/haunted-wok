'use client'
import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { state, subscribe } from './gameStore'

// ── Material constants ───────────────────────────────────────────
const COPPER = '#7a4a1a'
const BRASS  = '#8a6422'
const LBRASS = '#b87030'

// ── Steam puff ──────────────────────────────────────────────────
function SteamPuff({ delay }: { delay: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const t = useRef(delay)

  useFrame((_, delta) => {
    t.current += delta * 0.45
    if (t.current > 1) t.current -= 1
    const mesh = ref.current
    if (!mesh) return
    const p = t.current
    mesh.scale.setScalar(0.05 + p * 0.28)
    mesh.position.y = p * 0.65
    ;(mesh.material as THREE.MeshStandardMaterial).opacity = (1 - p) * 0.5
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 5, 5]} />
      <meshStandardMaterial color="#d4d4c2" transparent opacity={0} roughness={1} depthWrite={false} />
    </mesh>
  )
}

function SteamVent({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.14, 8]} />
        <meshStandardMaterial color={BRASS} roughness={0.3} metalness={0.8} />
      </mesh>
      <SteamPuff delay={0} />
      <SteamPuff delay={0.34} />
      <SteamPuff delay={0.67} />
    </group>
  )
}

// ── Pipe helpers ─────────────────────────────────────────────────
function HPipeX({ pos, len, r = 0.065 }: { pos: [number, number, number]; len: number; r?: number }) {
  return (
    <mesh position={pos} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[r, r, len, 8]} />
      <meshStandardMaterial color={COPPER} roughness={0.45} metalness={0.7} />
    </mesh>
  )
}

function HPipeZ({ pos, len, r = 0.065 }: { pos: [number, number, number]; len: number; r?: number }) {
  return (
    <mesh position={pos} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[r, r, len, 8]} />
      <meshStandardMaterial color={COPPER} roughness={0.45} metalness={0.7} />
    </mesh>
  )
}

function VPipe({ pos, len, r = 0.065 }: { pos: [number, number, number]; len: number; r?: number }) {
  return (
    <mesh position={pos}>
      <cylinderGeometry args={[r, r, len, 8]} />
      <meshStandardMaterial color={COPPER} roughness={0.45} metalness={0.7} />
    </mesh>
  )
}

function Joint({ pos, r = 0.1 }: { pos: [number, number, number]; r?: number }) {
  return (
    <mesh position={pos}>
      <sphereGeometry args={[r, 8, 8]} />
      <meshStandardMaterial color={BRASS} roughness={0.25} metalness={0.9} />
    </mesh>
  )
}

// ── Gas lamp (wall-mounted) ──────────────────────────────────────
// armDir: +1 = arm extends in +X, -1 = extends in -X
function GasLamp({ position, armDir = 1 }: { position: [number, number, number]; armDir?: number }) {
  const d = armDir
  return (
    <group position={position}>
      {/* Wall bracket arm */}
      <mesh position={[d * 0.22, -0.04, 0]} rotation={[0, 0, -d * 1.3]}>
        <cylinderGeometry args={[0.03, 0.03, 0.44, 6]} />
        <meshStandardMaterial color={BRASS} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Lamp housing (hexagonal) */}
      <mesh position={[d * 0.4, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.09, 0.26, 6]} />
        <meshStandardMaterial color={BRASS} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Top cap cone */}
      <mesh position={[d * 0.4, 0.2, 0]}>
        <coneGeometry args={[0.14, 0.13, 6]} />
        <meshStandardMaterial color="#6a4810" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Bottom flare */}
      <mesh position={[d * 0.4, -0.17, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.13, 0.09, 6]} />
        <meshStandardMaterial color="#6a4810" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Flame glow */}
      <mesh position={[d * 0.4, 0.06, 0]}>
        <sphereGeometry args={[0.065, 6, 6]} />
        <meshStandardMaterial color="#ffb040" emissive="#ff9000" emissiveIntensity={5} roughness={1} />
      </mesh>
      <pointLight position={[d * 0.4, 0.1, 0]} color="#ff8820" intensity={9} distance={5} />
    </group>
  )
}

// ── Porthole window (replaces rectangular window) ────────────────
function Porthole() {
  return (
    <group position={[0, 2.45, -8.88]}>
      {/* Outer brass ring */}
      <mesh>
        <torusGeometry args={[0.82, 0.13, 12, 32]} />
        <meshStandardMaterial color={BRASS} roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Dark glass disk */}
      <mesh position={[0, 0, -0.02]}>
        <circleGeometry args={[0.69, 32]} />
        <meshStandardMaterial color="#030810" transparent opacity={0.85} roughness={0.05} metalness={0.3} />
      </mesh>
      {/* Crossbars */}
      <mesh>
        <boxGeometry args={[1.7, 0.055, 0.07]} />
        <meshStandardMaterial color={BRASS} roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.055, 1.7, 0.07]} />
        <meshStandardMaterial color={BRASS} roughness={0.2} metalness={0.9} />
      </mesh>
      {/* 8 bolts around rim */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.94, Math.sin(a) * 0.94, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.11, 6]} />
            <meshStandardMaterial color={LBRASS} roughness={0.2} metalness={0.9} />
          </mesh>
        )
      })}
    </group>
  )
}

// ── Wok ──────────────────────────────────────────────────────────
function Wok({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.35, 0.25, 0.12, 12]} />
        <meshStandardMaterial color="#1a1a18" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.02, 12]} />
        <meshStandardMaterial color="#ff3300" emissive="#ff2200" emissiveIntensity={4} roughness={1} />
      </mesh>
      <pointLight color="#ff5500" intensity={4} distance={2.5} position={[0, 0.35, 0]} />
    </group>
  )
}

// ── Window shadow (horror level 2+) ──────────────────────────────
function WindowShadow() {
  const meshRef = useRef<THREE.Mesh>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const unsub = subscribe(() => setVisible(state.horrorLevel >= 2))
    return unsub
  }, [])

  useFrame(() => {
    if (!meshRef.current) return
    const t = performance.now() / 1000
    meshRef.current.position.x = Math.sin(t * 0.28) * 1.0
    meshRef.current.position.y = 2.45 + Math.sin(t * 0.13) * 0.15
  })

  if (!visible) return null

  return (
    <mesh ref={meshRef} position={[0, 2.45, -9.35]}>
      <planeGeometry args={[0.55, 1.9]} />
      <meshStandardMaterial color="#000000" transparent opacity={0.9} roughness={1} depthWrite={false} />
    </mesh>
  )
}

// ── Exit door (steampunk) ────────────────────────────────────────
function ExitDoor() {
  const panelRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame(() => {
    const open = state.mysteriesSolved >= 5
    const t = performance.now() / 1000
    const pulse = open ? 0.4 + Math.sin(t * 2.5) * 0.3 : 0
    if (panelRef.current) {
      ;(panelRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse
    }
    if (lightRef.current) lightRef.current.intensity = pulse * 8
  })

  return (
    <group position={[0, 0, 6.9]}>
      {/* Heavy iron frame with rivets */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[1.6, 3.0, 0.18]} />
        <meshStandardMaterial color="#1a1208" roughness={0.8} metalness={0.4} />
      </mesh>
      {/* Door panel — dark iron */}
      <mesh ref={panelRef} position={[0, 1.5, 0.1]}>
        <boxGeometry args={[1.2, 2.7, 0.06]} />
        <meshStandardMaterial color="#120e08" emissive="#00ff44" emissiveIntensity={0} roughness={0.8} metalness={0.3} />
      </mesh>
      {/* Brass frame rivets */}
      {([-0.68, 0.68] as number[]).flatMap(x =>
        ([0.4, 1.0, 1.6, 2.1, 2.6] as number[]).map((y, j) => (
          <mesh key={`rv-${x}-${j}`} position={[x, y, 0.16]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color={LBRASS} roughness={0.2} metalness={0.9} />
          </mesh>
        ))
      )}
      {/* Small porthole in door */}
      <group position={[0, 2.0, 0.14]}>
        <mesh>
          <torusGeometry args={[0.22, 0.05, 8, 20]} />
          <meshStandardMaterial color={BRASS} roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0, -0.01]}>
          <circleGeometry args={[0.17, 20]} />
          <meshStandardMaterial color="#030810" transparent opacity={0.9} roughness={0.05} metalness={0.3} />
        </mesh>
      </group>
      {/* Brass door handle */}
      <mesh position={[0.48, 1.45, 0.16]}>
        <cylinderGeometry args={[0.04, 0.04, 0.22, 8]} />
        <meshStandardMaterial color={LBRASS} roughness={0.2} metalness={0.9} />
      </mesh>
      {/* "出口" neon */}
      <mesh position={[0, 3.2, 0.1]}>
        <boxGeometry args={[0.85, 0.3, 0.05]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={1.2} roughness={1} />
      </mesh>
      <pointLight ref={lightRef} color="#00ff44" intensity={0} distance={6} position={[0, 1.5, 0.5]} />
    </group>
  )
}

// ── Main Kitchen ─────────────────────────────────────────────────
export default function Kitchen() {
  return (
    <group>
      {/* Ambient — debug bright */}
      <ambientLight color="#ffffff" intensity={1.5} />

      {/* Gas lamp lights (east + west walls) */}
      {/* West side lamps already emit from GasLamp components */}
      {/* Extra fill light from steam vents area */}
      <pointLight color="#ff7710" intensity={5} distance={8} position={[0, 2.2, -5]} />
      <pointLight color="#ff6600" intensity={4} distance={6} position={[-5, 2.0, -2]} />
      <pointLight color="#ff6600" intensity={4} distance={6} position={[5, 2.0, -2]} />

      {/* ── Floor (iron grating) ── */}
      <mesh position={[0, -0.05, -1]} receiveShadow>
        <boxGeometry args={[16, 0.1, 16]} />
        <meshStandardMaterial color="#1c1a14" roughness={0.55} metalness={0.5} />
      </mesh>
      {/* Grating grid — X bars */}
      {Array.from({ length: 17 }).map((_, i) => (
        <mesh key={`gx-${i}`} position={[-8 + i, 0.01, -1]}>
          <boxGeometry args={[0.05, 0.05, 16]} />
          <meshStandardMaterial color="#282520" roughness={0.4} metalness={0.65} />
        </mesh>
      ))}
      {/* Grating grid — Z bars */}
      {Array.from({ length: 17 }).map((_, i) => (
        <mesh key={`gz-${i}`} position={[0, 0.01, -9 + i]}>
          <boxGeometry args={[16, 0.05, 0.05]} />
          <meshStandardMaterial color="#282520" roughness={0.4} metalness={0.65} />
        </mesh>
      ))}

      {/* ── Ceiling ── */}
      <mesh position={[0, 3.5, -1]}>
        <boxGeometry args={[16.6, 0.2, 16.6]} />
        <meshStandardMaterial color="#0a0807" roughness={1} />
      </mesh>
      {/* Ceiling pipe runners */}
      <HPipeX pos={[-1, 3.35, -3]} len={14} r={0.05} />
      <HPipeX pos={[1, 3.35, 1]} len={14} r={0.05} />

      {/* ── Walls (dark rust) ── */}
      <mesh position={[0, 1.75, -9]}>
        <boxGeometry args={[16.3, 3.5, 0.3]} />
        <meshStandardMaterial color="#1a100a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.75, 7]}>
        <boxGeometry args={[16.3, 3.5, 0.3]} />
        <meshStandardMaterial color="#1a100a" roughness={0.9} />
      </mesh>
      <mesh position={[8, 1.75, -1]}>
        <boxGeometry args={[0.3, 3.5, 16.3]} />
        <meshStandardMaterial color="#1a100a" roughness={0.9} />
      </mesh>
      <mesh position={[-8, 1.75, -1]}>
        <boxGeometry args={[0.3, 3.5, 16.3]} />
        <meshStandardMaterial color="#1a100a" roughness={0.9} />
      </mesh>

      {/* ── Copper pipes ── */}
      {/* North wall — 2 horizontal runs */}
      <HPipeX pos={[0, 2.6, -8.6]} len={15} />
      <HPipeX pos={[0, 0.82, -8.6]} len={15} />
      {/* Vertical pipes at north corners */}
      <VPipe pos={[-6.5, 1.71, -8.6]} len={1.78} />
      <VPipe pos={[6.5, 1.71, -8.6]} len={1.78} />
      {/* Joints */}
      <Joint pos={[-6.5, 2.6, -8.6]} />
      <Joint pos={[6.5, 2.6, -8.6]} />
      <Joint pos={[-6.5, 0.82, -8.6]} />
      <Joint pos={[6.5, 0.82, -8.6]} />
      {/* East wall — horizontal run */}
      <HPipeZ pos={[7.6, 1.6, -1]} len={14} />
      <Joint pos={[7.6, 1.6, -8.5]} />
      <Joint pos={[7.6, 1.6, 6.5]} />
      {/* West wall — horizontal run */}
      <HPipeZ pos={[-7.6, 1.6, -1]} len={14} />
      <Joint pos={[-7.6, 1.6, -8.5]} />
      <Joint pos={[-7.6, 1.6, 6.5]} />
      {/* Branch pipe near cooking station */}
      <VPipe pos={[0, 1.35, -6.5]} len={0.5} r={0.05} />
      <Joint pos={[0, 1.1, -6.5]} r={0.08} />
      <HPipeZ pos={[0, 1.1, -7.0]} len={1.0} r={0.05} />

      {/* ── Gas lamps ── */}
      <GasLamp position={[7.78, 2.25, -5.5]} armDir={-1} />
      <GasLamp position={[7.78, 2.25, 0.5]} armDir={-1} />
      <GasLamp position={[-7.78, 2.25, -5.5]} armDir={1} />
      <GasLamp position={[-7.78, 2.25, 0.5]} armDir={1} />

      {/* ── Porthole window (replaces rectangular window) ── */}
      <Porthole />
      <WindowShadow />

      {/* ── Counter (brass/copper) ── */}
      <mesh position={[0, 0.55, -7.5]}>
        <boxGeometry args={[14, 1.1, 1.0]} />
        <meshStandardMaterial color="#3a2810" roughness={0.7} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.11, -7.5]}>
        <boxGeometry args={[14, 0.06, 1.0]} />
        <meshStandardMaterial color="#5a4220" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Back shelves */}
      <mesh position={[0, 2.0, -8.65]}>
        <boxGeometry args={[14, 0.08, 0.45]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh position={[0, 2.6, -8.65]}>
        <boxGeometry args={[14, 0.08, 0.45]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* ── Woks ── */}
      <Wok position={[-4, 1.13, -7.5]} />
      <Wok position={[0, 1.13, -7.5]} />
      <Wok position={[4, 1.13, -7.5]} />

      {/* ── Steam vents above woks ── */}
      <SteamVent position={[-4, 1.4, -8.1]} />
      <SteamVent position={[0, 1.4, -8.1]} />
      <SteamVent position={[4, 1.4, -8.1]} />
      {/* Pressure vent on east pipe */}
      <SteamVent position={[7.4, 1.8, -2.5]} />

      {/* ── East shelf (brass brackets) ── */}
      {([1.15, 1.75, 2.35] as number[]).map((y, i) => (
        <group key={i}>
          <mesh position={[7.62, y, -4.5]}>
            <boxGeometry args={[0.3, 0.06, 5.0]} />
            <meshStandardMaterial color="#3a2810" roughness={0.7} metalness={0.3} />
          </mesh>
          {/* Bracket supports */}
          <mesh position={[7.68, y - 0.18, -2.5]}>
            <boxGeometry args={[0.08, 0.3, 0.08]} />
            <meshStandardMaterial color={BRASS} roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[7.68, y - 0.18, -6.5]}>
            <boxGeometry args={[0.08, 0.3, 0.08]} />
            <meshStandardMaterial color={BRASS} roughness={0.3} metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* ── West wall hook rack ── */}
      <mesh position={[-7.62, 1.6, -4.5]}>
        <boxGeometry args={[0.15, 2.2, 4.5]} />
        <meshStandardMaterial color="#2a1808" roughness={0.9} />
      </mesh>
      {/* Hooks (brass pegs) */}
      {([-6, -5, -4, -3] as number[]).map((z, i) => (
        <group key={i}>
          <mesh position={[-7.44, 1.85, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.03, 0.22, 8]} />
            <meshStandardMaterial color={LBRASS} roughness={0.2} metalness={0.9} />
          </mesh>
          {/* Hook tip ball */}
          <mesh position={[-7.33, 1.75, z]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color={LBRASS} roughness={0.2} metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* ── Steam-pipe order receiver (east wall) ── */}
      <group position={[7.8, 2.2, 2.5]}>
        {/* Main tube */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.14, 0.14, 0.5, 10]} />
          <meshStandardMaterial color={BRASS} roughness={0.3} metalness={0.8} />
        </mesh>
        {/* End cap */}
        <mesh position={[-0.28, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.05, 10]} />
          <meshStandardMaterial color={LBRASS} roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Output slot tray */}
        <mesh position={[0, -0.18, 0]}>
          <boxGeometry args={[0.38, 0.06, 0.22]} />
          <meshStandardMaterial color="#2a1a08" roughness={0.8} metalness={0.3} />
        </mesh>
        <Joint pos={[0, 0, 0]} r={0.08} />
      </group>

      {/* ── Exit door ── */}
      <ExitDoor />
    </group>
  )
}
