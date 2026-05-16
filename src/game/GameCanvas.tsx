'use client'
import { useEffect, useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { AudioEngine } from './audioEngine'
import { state, subscribe, startGame, triggerKick } from './gameStore'
import Player from './Player'
import World from './World'
import buildingsData from '../data/buildings.json'
import npcsData from '../data/npcs.json'
import NPCSystem from './NPCSystem'
import CookEnemy from './CookEnemy'
import HackingSystem from './HackingSystem'
import SteamParticles from './SteamParticles'
import PostFX from './PostFX'
import HUD from './HUD'

const audioEngine = new AudioEngine()

export default function GameCanvas() {
  const [phase, setPhaseState] = useState(state.phase)

  useEffect(() => {
    const unsub = subscribe(() => {
      setPhaseState(state.phase)
    })
    audioEngine.onKick = () => triggerKick()
    return () => {
      unsub()
      audioEngine.stop()
    }
  }, [])

  const handleStart = () => {
    startGame()
    audioEngine.start()

    // Map layout output
    console.group('%c怨喰鬼厨冥満腹 -HAUNTED WOK- Map Layout', 'color:#cd7f32;font-weight:bold')
    console.log('%cBuildings:', 'color:#8a6422')
    buildingsData.buildings.forEach(b => {
      const bnd = b.bounds
      console.log(
        `  ${b.name} (${b.nameEn})\n` +
        `    bounds: X[${bnd.minX}, ${bnd.maxX}]  Z[${bnd.minZ}, ${bnd.maxZ}]\n` +
        `    entrance: ${b.entrance ? `(${b.entrance.x}, ${b.entrance.z})` : 'none'}\n` +
        `    hackables: ${b.hackables.map(h => `${h.label}[${h.position}]`).join(', ')}`
      )
    })
    console.log('%cNPCs:', 'color:#8a6422')
    npcsData.npcs.forEach(n => {
      console.log(`  ${n.name} — start:${n.startPos}  radius:${n.patrolRadius}  speed:${n.speed}`)
    })
    console.groupEnd()
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000' }}>
      <Canvas
        gl={{ antialias: false, toneMapping: THREE.NoToneMapping, toneMappingExposure: 2.0 }}
        camera={{ fov: 75, near: 0.1, far: 200, position: [0, 8, 15] }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#1a1a4a']} />
        <Suspense fallback={null}>
          <World />
          {phase !== 'title' && (
            <>
              <Player />
              <NPCSystem />
              <CookEnemy />
              <HackingSystem />
              <SteamParticles />
            </>
          )}
          <PostFX />
        </Suspense>
      </Canvas>
      <HUD onStart={handleStart} />
    </div>
  )
}
