'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { state } from './gameStore'

interface Particle {
  pos: THREE.Vector3
  vel: THREE.Vector3
  life: number
  maxLife: number
  active: boolean
}

function createParticlePool(count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    pos: new THREE.Vector3(),
    vel: new THREE.Vector3(),
    life: 0,
    maxLife: 1.2,
    active: false,
  }))
}

interface SteamEmitterProps {
  position: [number, number, number]
  isActive: boolean
  spawnRate?: number
}

function SteamEmitter({ position, isActive, spawnRate = 0.08 }: SteamEmitterProps) {
  const particles = useRef<Particle[]>(createParticlePool(12))
  const meshRefs = useRef<(THREE.Mesh | null)[]>(Array(12).fill(null))
  const spawnAccum = useRef(0)
  const emitterPos = new THREE.Vector3(...position)

  useFrame((_, delta) => {
    if (isActive) {
      spawnAccum.current += delta
      while (spawnAccum.current >= spawnRate) {
        spawnAccum.current -= spawnRate
        const p = particles.current.find((pt) => !pt.active)
        if (p) {
          p.active = true
          p.life = 0
          p.maxLife = 1.0 + Math.random() * 0.4
          p.pos.set(
            emitterPos.x + (Math.random() - 0.5) * 0.2,
            emitterPos.y,
            emitterPos.z + (Math.random() - 0.5) * 0.2
          )
          p.vel.set(
            (Math.random() - 0.5) * 0.3,
            0.8 + Math.random() * 0.5,
            (Math.random() - 0.5) * 0.3
          )
        }
      }
    }

    particles.current.forEach((p, i) => {
      const mesh = meshRefs.current[i]
      if (!mesh) return

      if (!p.active) {
        mesh.visible = false
        return
      }

      p.life += delta
      if (p.life >= p.maxLife) {
        p.active = false
        mesh.visible = false
        return
      }

      p.pos.addScaledVector(p.vel, delta)
      p.vel.y -= delta * 0.1

      const t = p.life / p.maxLife
      const scale = 0.08 + t * 0.12
      mesh.scale.setScalar(scale)
      mesh.position.copy(p.pos)

      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.opacity = (1 - t) * 0.6
      mesh.visible = true
    })
  })

  return (
    <>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el
          }}
          visible={false}
        >
          <sphereGeometry args={[1, 6, 6]} />
          <meshStandardMaterial
            color="#cccccc"
            transparent
            opacity={0.5}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  )
}

function AlleySteam() {
  // Always-on slow passive emitter at alley ceiling pipes
  const particles = useRef<Particle[]>(createParticlePool(12))
  const meshRefs = useRef<(THREE.Mesh | null)[]>(Array(12).fill(null))
  const spawnAccum = useRef(0)
  const spawnRate = 0.3

  useFrame((_, delta) => {
    spawnAccum.current += delta
    while (spawnAccum.current >= spawnRate) {
      spawnAccum.current -= spawnRate
      const p = particles.current.find((pt) => !pt.active)
      if (p) {
        p.active = true
        p.life = 0
        p.maxLife = 1.5 + Math.random() * 0.5
        p.pos.set(
          (Math.random() - 0.5) * 4,
          3.1,
          4 + Math.random() * 4
        )
        p.vel.set(
          (Math.random() - 0.5) * 0.2,
          0.3 + Math.random() * 0.2,
          0
        )
      }
    }

    particles.current.forEach((p, i) => {
      const mesh = meshRefs.current[i]
      if (!mesh) return

      if (!p.active) {
        mesh.visible = false
        return
      }

      p.life += delta
      if (p.life >= p.maxLife) {
        p.active = false
        mesh.visible = false
        return
      }

      p.pos.addScaledVector(p.vel, delta)

      const t = p.life / p.maxLife
      const scale = 0.1 + t * 0.15
      mesh.scale.setScalar(scale)
      mesh.position.copy(p.pos)

      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.opacity = (1 - t) * 0.4
      mesh.visible = true
    })
  })

  return (
    <>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el
          }}
          visible={false}
        >
          <sphereGeometry args={[1, 6, 6]} />
          <meshStandardMaterial
            color="#aaaaaa"
            transparent
            opacity={0.4}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  )
}

export default function SteamParticles() {
  const valveKitchenActive = state.steamBlasting.includes('valve_kitchen')
  const valvePlazaActive = state.steamBlasting.includes('valve_plaza')

  return (
    <>
      <SteamEmitter
        position={[-6.5, 1.5, -3.5]}
        isActive={valveKitchenActive}
      />
      <SteamEmitter
        position={[2.5, 1.2, 1]}
        isActive={valvePlazaActive}
      />
      <AlleySteam />
    </>
  )
}
