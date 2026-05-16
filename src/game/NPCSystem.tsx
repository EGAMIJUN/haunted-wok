'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import npcsData from '../data/npcs.json'
import { WALL_BOUNDS } from './Player'
import { state } from './gameStore'

const NPC_RADIUS = 0.35

const NEON_PALETTE = ['#ff00ff', '#00ffff', '#ffff00', '#ff0044', '#00ff44', '#ff8800', '#8800ff']

function isInsideAnyBound(pos: THREE.Vector3): boolean {
  for (const b of WALL_BOUNDS) {
    if (
      pos.x > b.minX - NPC_RADIUS &&
      pos.x < b.maxX + NPC_RADIUS &&
      pos.z > b.minZ - NPC_RADIUS &&
      pos.z < b.maxZ + NPC_RADIUS
    ) {
      return true
    }
  }
  return false
}

function randomPatrolTarget(
  startPos: THREE.Vector3,
  radius: number
): THREE.Vector3 {
  const angle = Math.random() * Math.PI * 2
  const dist = Math.random() * radius
  const target = new THREE.Vector3(
    startPos.x + Math.cos(angle) * dist,
    startPos.y,
    startPos.z + Math.sin(angle) * dist
  )
  target.x = Math.max(-18, Math.min(18, target.x))
  target.z = Math.max(-18, Math.min(18, target.z))
  return target
}

function NPCMesh({ color }: { color: string }) {
  return (
    <group>
      {/* Legs — tiny, dark */}
      <mesh position={[-0.06, 0.09, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.18, 5]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
      <mesh position={[0.06, 0.09, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.18, 5]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
      {/* Body — tiny box */}
      <mesh position={[0, 0.26, 0]} castShadow>
        <boxGeometry args={[0.22, 0.28, 0.18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} roughness={0.4} />
      </mesh>
      {/* Head — huge sphere, floats above body */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <sphereGeometry args={[0.52, 8, 7]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} roughness={0.2} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.18, 1.06, 0.48]}>
        <sphereGeometry args={[0.06, 5, 4]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={6} roughness={0} />
      </mesh>
      <mesh position={[0.18, 1.06, 0.48]}>
        <sphereGeometry args={[0.06, 5, 4]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={6} roughness={0} />
      </mesh>
      {/* Glow light */}
      <pointLight color={color} intensity={30} distance={5} decay={2} position={[0, 1.0, 0]} />
    </group>
  )
}

interface NPCState {
  groupRef: THREE.Group | null
  pos: THREE.Vector3
  target: THREE.Vector3
  rotY: number
  jitter: number
}

export default function NPCSystem() {
  const npcStates = useRef<NPCState[]>(
    npcsData.npcs.slice(0, 1).map((npc) => ({
      groupRef: null,
      pos: new THREE.Vector3(
        (npc.startPos as [number, number, number])[0],
        (npc.startPos as [number, number, number])[1],
        (npc.startPos as [number, number, number])[2]
      ),
      target: new THREE.Vector3(
        (npc.startPos as [number, number, number])[0],
        (npc.startPos as [number, number, number])[1],
        (npc.startPos as [number, number, number])[2]
      ),
      rotY: 0,
      jitter: 0,
    }))
  )

  const groupRefs = useRef<(THREE.Group | null)[]>(npcsData.npcs.slice(0, 1).map(() => null))

  useFrame((_, delta) => {
    npcsData.npcs.slice(0, 1).forEach((npc, i) => {
      const s = npcStates.current[i]
      const group = groupRefs.current[i]
      if (!group) return

      const dir = new THREE.Vector3(
        s.target.x - s.pos.x,
        0,
        s.target.z - s.pos.z
      )
      const dist = dir.length()

      if (dist < 0.5) {
        // pick new random target
        const startPos = new THREE.Vector3(
          (npc.startPos as [number, number, number])[0],
          (npc.startPos as [number, number, number])[1],
          (npc.startPos as [number, number, number])[2]
        )
        let newTarget = randomPatrolTarget(startPos, npc.patrolRadius)
        let attempts = 0
        while (isInsideAnyBound(newTarget) && attempts < 10) {
          newTarget = randomPatrolTarget(startPos, npc.patrolRadius)
          attempts++
        }
        s.target.copy(newTarget)
      } else {
        dir.normalize()
        s.pos.addScaledVector(dir, npc.speed * delta)

        // smooth rotation
        const targetAngle = Math.atan2(dir.x, dir.z)
        s.rotY += (targetAngle - s.rotY) * Math.min(delta * 8, 1)
      }

      s.pos.x = Math.max(-19, Math.min(19, s.pos.x))
      s.pos.z = Math.max(-19, Math.min(19, s.pos.z))

      // Crazy jitter on beat kick
      if (state.beatKick) {
        s.jitter = (Math.random() - 0.5) * 0.3
        group.rotation.y += (Math.random() - 0.5) * 0.8
      } else {
        s.jitter *= 0.85
      }

      const bounceY = state.beatKick ? Math.abs(Math.sin(performance.now() / 50)) * 0.2 : 0

      group.position.set(s.pos.x + s.jitter, s.pos.y + bounceY, s.pos.z)
      group.rotation.y = s.rotY
    })
  })

  return (
    <>
      {npcsData.npcs.slice(0, 1).map((npc, i) => {
        const neonColor = NEON_PALETTE[i % NEON_PALETTE.length]
        return (
          <group
            key={npc.id}
            ref={(el) => {
              groupRefs.current[i] = el
            }}
            position={[
              (npc.startPos as [number, number, number])[0],
              (npc.startPos as [number, number, number])[1],
              (npc.startPos as [number, number, number])[2],
            ]}
          >
            <NPCMesh color={neonColor} />
          </group>
        )
      })}
    </>
  )
}
