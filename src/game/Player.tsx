'use client'
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { state, setNearHackable, beginHack, cancelHack } from './gameStore'

export interface WallBound {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export const WALL_BOUNDS: WallBound[] = [
  { minX: -21, maxX: 21,  minZ: -21, maxZ: -20 }, // north wall
  { minX: -21, maxX: 21,  minZ: 20,  maxZ: 21  }, // south wall
  { minX: 20,  maxX: 21,  minZ: -21, maxZ: 21  }, // east wall
  { minX: -21, maxX: -20, minZ: -21, maxZ: 21  }, // west wall
  { minX: -9,  maxX: -1,  minZ: -9,  maxZ: -3  }, // restaurant
  { minX: 2,   maxX: 10,  minZ: -12, maxZ: -4  }, // factory
  { minX: -4,  maxX: -4.3, minZ: 2,  maxZ: 10  }, // alley left wall
  { minX: 3.7, maxX: 4,   minZ: 2,   maxZ: 10  }, // alley right wall
]

const PLAYER_RADIUS = 0.4

function pushOutOfBounds(pos: THREE.Vector3): void {
  for (const b of WALL_BOUNDS) {
    if (
      pos.x > b.minX - PLAYER_RADIUS &&
      pos.x < b.maxX + PLAYER_RADIUS &&
      pos.z > b.minZ - PLAYER_RADIUS &&
      pos.z < b.maxZ + PLAYER_RADIUS
    ) {
      const overlapLeft  = pos.x - (b.minX - PLAYER_RADIUS)
      const overlapRight = (b.maxX + PLAYER_RADIUS) - pos.x
      const overlapFront = pos.z - (b.minZ - PLAYER_RADIUS)
      const overlapBack  = (b.maxZ + PLAYER_RADIUS) - pos.z

      const minOverlap = Math.min(overlapLeft, overlapRight, overlapFront, overlapBack)
      if (minOverlap === overlapLeft)  pos.x = b.minX - PLAYER_RADIUS
      else if (minOverlap === overlapRight) pos.x = b.maxX + PLAYER_RADIUS
      else if (minOverlap === overlapFront) pos.z = b.minZ - PLAYER_RADIUS
      else pos.z = b.maxZ + PLAYER_RADIUS
    }
  }
}

function updateCamera(camera: THREE.Camera, pos: THREE.Vector3, yaw: number) {
  const offset = new THREE.Vector3(0, 3.2, 6.5)
  offset.applyEuler(new THREE.Euler(0, yaw, 0, 'YXZ'))
  camera.position.copy(pos).add(offset)
  camera.position.y = Math.max(pos.y + 1.0, camera.position.y)
  const lookAt = pos.clone().add(new THREE.Vector3(0, 0.9, 0))
  camera.lookAt(lookAt)
}

export default function Player() {
  const { camera } = useThree()
  const playerRef = useRef<THREE.Group>(null)
  const posRef = useRef(new THREE.Vector3(0, 0.9, 3))
  const yawRef = useRef(0)
  const keys = useRef<Record<string, boolean>>({})
  const isPointerLocked = useRef(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      keys.current[e.code] = e.type === 'keydown'

      if (e.type === 'keydown' && e.code === 'KeyE') {
        if (state.phase === 'hacking') return
        if (state.nearHackable && state.phase === 'playing') {
          beginHack(state.nearHackable.id)
        }
      }
      if (e.type === 'keydown' && e.code === 'KeyQ') {
        if (state.phase === 'hacking') cancelHack()
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked.current) return
      yawRef.current -= e.movementX * 0.002
    }

    const onPLChange = () => {
      isPointerLocked.current = !!document.pointerLockElement
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('keyup', onKey)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('pointerlockchange', onPLChange)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('keyup', onKey)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('pointerlockchange', onPLChange)
    }
  }, [])

  useFrame((_, delta) => {
    if (state.phase === 'title' || state.phase === 'caught' || state.phase === 'won') {
      camera.position.set(0, 8, 15)
      camera.lookAt(0, 0, 0)
      return
    }

    if (state.phase === 'hacking') {
      updateCamera(camera, posRef.current, yawRef.current)
      return
    }

    const k = keys.current
    const forward = k['KeyW'] ? 1 : k['KeyS'] ? -1 : 0
    const strafe  = k['KeyA'] ? -1 : k['KeyD'] ? 1 : 0

    const moveDir = new THREE.Vector3()
    if (forward !== 0 || strafe !== 0) {
      moveDir.set(strafe, 0, -forward)
      moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current)
      moveDir.normalize()
    }

    const speed = 5
    posRef.current.addScaledVector(moveDir, speed * delta)
    posRef.current.x = Math.max(-19.5, Math.min(19.5, posRef.current.x))
    posRef.current.z = Math.max(-19.5, Math.min(19.5, posRef.current.z))
    pushOutOfBounds(posRef.current)

    if (playerRef.current) {
      playerRef.current.position.copy(posRef.current)
      if (moveDir.length() > 0.01) {
        const targetYaw = Math.atan2(moveDir.x, moveDir.z)
        playerRef.current.rotation.y = targetYaw
      }
    }

    state.playerPos = [posRef.current.x, posRef.current.y, posRef.current.z]
    state.playerRot = yawRef.current

    updateCamera(camera, posRef.current, yawRef.current)
  })

  return (
    <group ref={playerRef} position={[0, 0.9, 3]}>
      {/* HEAD — huge fluorescent yellow low-poly sphere */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <sphereGeometry args={[0.48, 7, 5]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={4} roughness={0} metalness={0} />
      </mesh>
      {/* Left eye — glowing */}
      <mesh position={[-0.16, 0.82, 0.42]}>
        <sphereGeometry args={[0.09, 5, 4]} />
        <meshStandardMaterial color="#ffffff" emissive="#ff8800" emissiveIntensity={8} roughness={0} />
      </mesh>
      {/* Right eye — glowing */}
      <mesh position={[0.16, 0.82, 0.42]}>
        <sphereGeometry args={[0.09, 5, 4]} />
        <meshStandardMaterial color="#ffffff" emissive="#ff8800" emissiveIntensity={8} roughness={0} />
      </mesh>
      {/* BODY — muscular fluorescent orange box */}
      <mesh position={[0, -0.02, 0]} castShadow>
        <boxGeometry args={[0.75, 0.8, 0.58]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={3} roughness={0} metalness={0} />
      </mesh>
      {/* Left arm — thick short fluorescent green */}
      <mesh position={[-0.55, 0.08, 0]} rotation={[0, 0, 0.4]} castShadow>
        <cylinderGeometry args={[0.15, 0.13, 0.48, 5]} />
        <meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={3} roughness={0} />
      </mesh>
      {/* Right arm */}
      <mesh position={[0.55, 0.08, 0]} rotation={[0, 0, -0.4]} castShadow>
        <cylinderGeometry args={[0.15, 0.13, 0.48, 5]} />
        <meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={3} roughness={0} />
      </mesh>
      {/* Left leg — thick short */}
      <mesh position={[-0.22, -0.67, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.13, 0.52, 5]} />
        <meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={3} roughness={0} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.22, -0.67, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.13, 0.52, 5]} />
        <meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={3} roughness={0} />
      </mesh>
      {/* Glow light */}
      <pointLight color="#ffff00" intensity={40} distance={12} decay={2} />
    </group>
  )
}
