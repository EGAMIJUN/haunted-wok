'use client'

function NeonSign({
  position,
  rotation,
  color,
  width,
  height,
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  color: string
  width: number
  height: number
}) {
  return (
    <mesh position={position} rotation={rotation ?? [0, 0, 0]}>
      <boxGeometry args={[width, height, 0.05]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} roughness={1} />
    </mesh>
  )
}

function Wok({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.25, 0.12, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.02, 16]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={3} roughness={1} />
      </mesh>
      <pointLight color="#ff2200" intensity={2} distance={2.5} position={[0, 0.3, 0]} />
    </group>
  )
}

function Table({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.8, 0.08, 1.0]} />
        <meshStandardMaterial color="#3a1008" roughness={0.8} />
      </mesh>
      {(
        [[-0.8, 0, -0.4], [0.8, 0, -0.4], [-0.8, 0, 0.4], [0.8, 0, 0.4]] as [number, number, number][]
      ).map((lp, i) => (
        <mesh key={i} position={lp}>
          <boxGeometry args={[0.08, 0.8, 0.08]} />
          <meshStandardMaterial color="#2a0a05" roughness={0.9} />
        </mesh>
      ))}
      {(
        [[-1.2, 0, 0], [1.2, 0, 0], [0, 0, -0.8], [0, 0, 0.8]] as [number, number, number][]
      ).map((cp, i) => (
        <group key={i} position={[cp[0], cp[1], cp[2]]}>
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[0.4, 0.05, 0.4]} />
            <meshStandardMaterial color="#2a0a05" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.55, -0.17]}>
            <boxGeometry args={[0.4, 0.6, 0.05]} />
            <meshStandardMaterial color="#2a0a05" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// 部屋サイズ: X/Z ±30 (60x60), 天井 y=8
export default function Restaurant() {
  return (
    <group>
      {/* Ambient light — debug bright */}
      <ambientLight color="#ffffff" intensity={1.5} />

      {/* Point lights scattered across the 60x60 room */}
      <pointLight color="#ff00cc" intensity={10} distance={22} position={[-20, 7, 15]} />
      <pointLight color="#00ffaa" intensity={10} distance={22} position={[20, 7, -9]} />
      <pointLight color="#cc00ff" intensity={10} distance={22} position={[0, 7, 6]} />
      <pointLight color="#ff2200" intensity={8} distance={18} position={[0, 4, -21]} />
      <pointLight color="#ff00aa" intensity={8} distance={22} position={[-20, 7, -12]} />
      <pointLight color="#00ffaa" intensity={8} distance={22} position={[18, 7, 21]} />
      <pointLight color="#cc00ff" intensity={8} distance={22} position={[12, 7, 24]} />
      <pointLight color="#ff2200" intensity={6} distance={18} position={[-15, 6, 6]} />

      {/* Floor */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[60, 0.2, 60]} />
        <meshStandardMaterial color="#060202" roughness={0.9} />
      </mesh>

      {/* Floor grid lines */}
      {Array.from({ length: 29 }).map((_, i) => (
        <mesh key={`fg-x-${i}`} position={[-28 + i * 2, 0.01, 0]}>
          <boxGeometry args={[0.02, 0.01, 60]} />
          <meshStandardMaterial color="#2a0a08" emissive="#3a0010" emissiveIntensity={0.5} roughness={1} />
        </mesh>
      ))}
      {Array.from({ length: 29 }).map((_, i) => (
        <mesh key={`fg-z-${i}`} position={[0, 0.01, -28 + i * 2]}>
          <boxGeometry args={[60, 0.01, 0.02]} />
          <meshStandardMaterial color="#2a0a08" emissive="#3a0010" emissiveIntensity={0.5} roughness={1} />
        </mesh>
      ))}

      {/* Ceiling at y=8 */}
      <mesh position={[0, 8, 0]}>
        <boxGeometry args={[60.6, 0.2, 60.6]} />
        <meshStandardMaterial color="#030002" roughness={1} />
      </mesh>

      {/* Outer walls */}
      <mesh position={[0, 4, -30]}>
        <boxGeometry args={[60.6, 8.2, 0.3]} />
        <meshStandardMaterial color="#0a0406" roughness={0.9} />
      </mesh>
      <mesh position={[0, 4, 30]}>
        <boxGeometry args={[60.6, 8.2, 0.3]} />
        <meshStandardMaterial color="#0a0406" roughness={0.9} />
      </mesh>
      <mesh position={[30, 4, 0]}>
        <boxGeometry args={[0.3, 8.2, 60.6]} />
        <meshStandardMaterial color="#0a0406" roughness={0.9} />
      </mesh>
      <mesh position={[-30, 4, 0]}>
        <boxGeometry args={[0.3, 8.2, 60.6]} />
        <meshStandardMaterial color="#0a0406" roughness={0.9} />
      </mesh>

      {/* Divider wall — left of window (x=-30 to -6, z=0) */}
      <mesh position={[-18, 4, 0]}>
        <boxGeometry args={[24, 8, 0.3]} />
        <meshStandardMaterial color="#0a0406" roughness={0.9} />
      </mesh>
      {/* Divider wall — right of window (x=6 to 30, z=0) */}
      <mesh position={[18, 4, 0]}>
        <boxGeometry args={[24, 8, 0.3]} />
        <meshStandardMaterial color="#0a0406" roughness={0.9} />
      </mesh>
      {/* Serving window frame (top) */}
      <mesh position={[0, 7.5, 0]}>
        <boxGeometry args={[12, 1, 0.3]} />
        <meshStandardMaterial color="#0a0406" roughness={0.9} />
      </mesh>

      {/* Kitchen counter (z=-24, x=-12 to 12) */}
      <mesh position={[0, 0.5, -24]}>
        <boxGeometry args={[24, 1.0, 1.5]} />
        <meshStandardMaterial color="#3a2010" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.01, -24]}>
        <boxGeometry args={[24, 0.05, 1.5]} />
        <meshStandardMaterial color="#4a3020" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Back shelf (z=-29) */}
      <mesh position={[0, 1.25, -29]}>
        <boxGeometry args={[24, 2.5, 0.5]} />
        <meshStandardMaterial color="#3a1a08" roughness={0.9} />
      </mesh>

      {/* Wok stations on counter */}
      <Wok position={[-6, 1.08, -24]} />
      <Wok position={[0, 1.08, -24]} />
      <Wok position={[6, 1.08, -24]} />

      {/* Floor drain in kitchen */}
      <mesh position={[9, 0.01, -18]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.02, 16]} />
        <meshStandardMaterial color="#0a0005" emissive="#ff0000" emissiveIntensity={1} roughness={1} />
      </mesh>
      <pointLight color="#ff0000" intensity={1} distance={2} position={[9, 0.3, -18]} />

      {/* Tables in dining room (3x positions) */}
      <Table position={[-9, 0, 9]} />
      <Table position={[9, 0, 6]} />
      <Table position={[-9, 0, 18]} />
      <Table position={[9, 0, 18]} />
      <Table position={[-9, 0, 24]} />
      <Table position={[9, 0, 26]} />

      {/* Neon signs */}
      <NeonSign position={[29.8, 5, 9]} rotation={[0, -Math.PI / 2, 0]} color="#ff00aa" width={12} height={0.15} />
      <NeonSign position={[29.8, 5.8, -12]} rotation={[0, -Math.PI / 2, 0]} color="#00ff88" width={9} height={0.15} />
      <NeonSign position={[-29.8, 5, 9]} rotation={[0, Math.PI / 2, 0]} color="#cc00ff" width={12} height={0.15} />
      <NeonSign position={[-29.8, 6.2, -15]} rotation={[0, Math.PI / 2, 0]} color="#ff00aa" width={6} height={0.15} />
      <NeonSign position={[0, 6.5, -29.8]} color="#00ff88" width={15} height={0.2} />
      <NeonSign position={[-9, 4.5, -29.8]} color="#ff00aa" width={4.5} height={0.5} />
      <NeonSign position={[9, 4.5, -29.8]} color="#cc00ff" width={4.5} height={0.5} />
      <NeonSign position={[0, 5.8, 29.8]} color="#ff00aa" width={18} height={0.15} />

      {/* Ceiling neon strips */}
      <mesh position={[0, 7.95, 0]}>
        <boxGeometry args={[0.1, 0.02, 54]} />
        <meshStandardMaterial color="#cc00ff" emissive="#cc00ff" emissiveIntensity={0.5} roughness={1} />
      </mesh>
      <mesh position={[-12, 7.95, 0]}>
        <boxGeometry args={[0.1, 0.02, 54]} />
        <meshStandardMaterial color="#ff00aa" emissive="#ff00aa" emissiveIntensity={0.5} roughness={1} />
      </mesh>
      <mesh position={[12, 7.95, 0]}>
        <boxGeometry args={[0.1, 0.02, 54]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.5} roughness={1} />
      </mesh>

      {/* Hanging lanterns */}
      {(
        [[-12, 7.5, 15], [12, 7.5, 6], [0, 7.5, 21], [-9, 7.5, -9]] as [number, number, number][]
      ).map((lp, i) => (
        <group key={i} position={lp}>
          <mesh>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial
              color={(['#ff0000', '#ff6600', '#ff0044', '#cc0066'] as const)[i]}
              emissive={(['#ff0000', '#ff4400', '#ff0044', '#cc0066'] as const)[i]}
              emissiveIntensity={2}
              roughness={1}
            />
          </mesh>
          <pointLight
            color={(['#ff2200', '#ff6600', '#ff0044', '#cc0066'] as const)[i]}
            intensity={3}
            distance={3.5}
          />
        </group>
      ))}

      {/* Decorative chains */}
      {([-15, -6, 6, 15] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 4, -6]}>
          <boxGeometry args={[0.04, 7, 0.04]} />
          <meshStandardMaterial color="#1a0808" roughness={0.9} metalness={0.5} />
        </mesh>
      ))}
    </group>
  )
}
