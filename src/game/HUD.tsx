'use client'
import { useState, useEffect, useRef, CSSProperties } from 'react'
import { state, subscribe, MYSTERIES, clearRewardPopup, dismissTutorial } from './gameStore'

interface HUDProps {
  onStart: () => void
}

const EXIT_PORTAL_XZ = { x: 0, z: 12 }

// ─────────────────────────────────────────
// Tutorial overlay
// ─────────────────────────────────────────
function TutorialOverlay() {
  const handleClose = () => {
    dismissTutorial()
    document.querySelector('canvas')?.requestPointerLock()
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        pointerEvents: 'auto',
        cursor: 'pointer',
        zIndex: 50,
        fontFamily: 'monospace',
      }}
      onClick={handleClose}
    >
      {/* Title */}
      <div style={{ fontSize: 22, color: '#cd7f32', letterSpacing: '0.25em', fontWeight: 'bold',
        textShadow: '0 0 12px rgba(200,120,50,0.5)' }}>
        ── 操作説明 ──
      </div>

      {/* Controls grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {([
          ['WASD', '移動する'],
          ['マウスドラッグ', '視点を回転させる'],
          ['E', '光るオブジェクトをハックする'],
          ['Q', 'ハックをキャンセルする'],
        ] as [string, string][]).map(([key, desc]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              background: '#1a1208', border: '1px solid #8a6020',
              padding: '5px 14px', color: '#ffcc44',
              minWidth: 120, textAlign: 'center', fontSize: 14,
            }}>
              {key}
            </div>
            <div style={{ color: '#c8a060', fontSize: 14 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Goal */}
      <div style={{
        background: '#1a1208', border: '2px solid #8a6020',
        padding: '14px 28px', textAlign: 'center',
        maxWidth: 360,
      }}>
        <div style={{ fontSize: 13, color: '#8a6020', marginBottom: 8, letterSpacing: '0.15em' }}>
          ── 目標 ──
        </div>
        <div style={{ fontSize: 15, color: '#e8c060', lineHeight: 1.9, letterSpacing: '0.06em' }}>
          街を探索して光るオブジェクトを見つけ<br />
          <span style={{ color: '#ffaa00' }}>Eキー</span> でハッキングして謎を解明せよ<br />
          <span style={{ color: '#00ff88' }}>5つの謎</span> を全て解いて脱出しろ！
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'rgba(180,140,60,0.55)', letterSpacing: '0.15em',
        animation: 'blink 1s step-start infinite' }}>
        クリックして開始
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Objective banner — top center with direction arrow
// ─────────────────────────────────────────
function ObjectiveBanner({ mysteriesSolved, currentMysteryIndex }: {
  mysteriesSolved: number
  currentMysteryIndex: number
}) {
  const arrowRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let rafId: number
    const update = () => {
      if (arrowRef.current) {
        const target = mysteriesSolved >= 5
          ? EXIT_PORTAL_XZ
          : HACKABLE_DOTS[currentMysteryIndex]
        if (target) {
          const dx = target.x - state.playerPos[0]
          const dz = target.z - state.playerPos[2]
          const worldAngle = Math.atan2(dx, -dz)
          const relAngle = worldAngle - state.playerRot
          const deg = relAngle * (180 / Math.PI)
          arrowRef.current.style.transform = `rotate(${deg}deg)`
        }
      }
      rafId = requestAnimationFrame(update)
    }
    rafId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafId)
  }, [mysteriesSolved, currentMysteryIndex])

  const isComplete = mysteriesSolved >= 5
  const hint = MYSTERIES[currentMysteryIndex]?.hint ?? ''

  return (
    <div style={{
      position: 'absolute',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(10,6,2,0.88)',
      border: `1px solid ${isComplete ? '#00cc66' : '#8a6020'}`,
      padding: '9px 22px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      whiteSpace: 'nowrap',
      boxShadow: isComplete ? '0 0 18px rgba(0,200,100,0.35)' : '0 0 8px rgba(0,0,0,0.5)',
      pointerEvents: 'none',
    }}>
      {/* Direction arrow / star */}
      <span
        ref={arrowRef}
        style={{
          display: 'inline-block',
          fontSize: 20,
          lineHeight: 1,
          color: isComplete ? '#00ff88' : '#ffaa00',
          userSelect: 'none',
          textShadow: isComplete
            ? '0 0 8px rgba(0,255,136,0.8)'
            : '0 0 6px rgba(255,170,0,0.7)',
        }}
      >
        {isComplete ? '★' : '↑'}
      </span>
      {/* Text */}
      <span style={{
        fontSize: 14,
        color: isComplete ? '#00ff88' : '#e8c060',
        letterSpacing: '0.1em',
        textShadow: isComplete ? '0 0 8px rgba(0,255,136,0.5)' : 'none',
      }}>
        {isComplete ? '脱出口へ向かえ！' : `次の目標：${hint}`}
      </span>
    </div>
  )
}

// ── World-space hackable positions (x, z) for minimap ──
const HACKABLE_DOTS: { id: string; x: number; z: number; label: string }[] = [
  { id: 'valve_kitchen',      x: -6.5, z: -3.5,  label: 'バルブ' },
  { id: 'gear_factory',       x:  2.2, z: -8,    label: '歯車'   },
  { id: 'door_alley',         x:  0,   z:  9.5,  label: '扉'     },
  { id: 'valve_plaza',        x:  2.5, z:  1,    label: 'バルブ' },
  { id: 'door_kitchen_secret',x: -5,   z: -8.5,  label: '秘扉'   },
]

const BUILDING_RECTS = [
  { x1: -9, z1: -9, x2: -1, z2: -3,  color: '#5a1a0a', name: '食堂' },
  { x1:  2, z1: -12, x2: 10, z2: -4, color: '#2a1e0a', name: '工廠' },
  { x1: -4, z1:  2,  x2:  4, z2: 10, color: '#161616', name: '路地' },
  { x1: -8, z1: -4,  x2:  8, z2:  4, color: '#1e1808', name: '広場' },
]

const MAP_PX = 160
const WORLD = 40  // -20 to 20

function worldToMini(wx: number, wz: number) {
  return {
    cx: ((wx + 20) / WORLD) * MAP_PX,
    cy: ((wz + 20) / WORLD) * MAP_PX,
  }
}

function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let rafId: number
    const draw = () => {
      const canvas = canvasRef.current
      if (!canvas) { rafId = requestAnimationFrame(draw); return }
      const ctx = canvas.getContext('2d')
      if (!ctx) { rafId = requestAnimationFrame(draw); return }

      // Background
      ctx.clearRect(0, 0, MAP_PX, MAP_PX)
      ctx.fillStyle = 'rgba(6,4,2,0.88)'
      ctx.fillRect(0, 0, MAP_PX, MAP_PX)

      // Building rects
      for (const b of BUILDING_RECTS) {
        const p1 = worldToMini(b.x1, b.z1)
        const p2 = worldToMini(b.x2, b.z2)
        ctx.fillStyle = b.color
        ctx.fillRect(p1.cx, p1.cy, p2.cx - p1.cx, p2.cy - p1.cy)
        ctx.strokeStyle = '#5a3c10'
        ctx.lineWidth = 0.8
        ctx.strokeRect(p1.cx, p1.cy, p2.cx - p1.cx, p2.cy - p1.cy)
        // Label
        ctx.fillStyle = 'rgba(200,160,80,0.5)'
        ctx.font = '7px monospace'
        ctx.fillText(b.name, p1.cx + 2, p1.cy + 8)
      }

      // Hackable dots
      for (let i = 0; i < HACKABLE_DOTS.length; i++) {
        const h = HACKABLE_DOTS[i]
        const solved = i < state.mysteriesSolved
        const p = worldToMini(h.x, h.z)
        ctx.beginPath()
        ctx.arc(p.cx, p.cy, 3.5, 0, Math.PI * 2)
        ctx.fillStyle = solved ? '#4a3c18' : '#ffaa00'
        ctx.fill()
        if (!solved) {
          ctx.strokeStyle = 'rgba(255,180,0,0.4)'
          ctx.lineWidth = 1.5
          ctx.stroke()
        }
      }

      // Player dot (pulsing)
      const pp = worldToMini(state.playerPos[0], state.playerPos[2])
      const pulse = 0.7 + Math.sin(performance.now() / 300) * 0.3
      // Direction line
      const dx = Math.sin(state.playerRot) * 9
      const dz = -Math.cos(state.playerRot) * 9
      ctx.beginPath()
      ctx.moveTo(pp.cx, pp.cy)
      ctx.lineTo(pp.cx + dx, pp.cy + dz)
      ctx.strokeStyle = `rgba(80,210,255,${pulse * 0.8})`
      ctx.lineWidth = 1.5
      ctx.stroke()
      // Dot
      ctx.beginPath()
      ctx.arc(pp.cx, pp.cy, 4, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(80,210,255,${pulse})`
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'
      ctx.lineWidth = 0.8
      ctx.stroke()

      // Border
      ctx.strokeStyle = '#8a6020'
      ctx.lineWidth = 1
      ctx.strokeRect(0.5, 0.5, MAP_PX - 1, MAP_PX - 1)
      // Corner label
      ctx.fillStyle = '#6a4c18'
      ctx.font = '8px monospace'
      ctx.fillText('MAP', 4, 11)

      rafId = requestAnimationFrame(draw)
    }
    rafId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={MAP_PX}
      height={MAP_PX}
      style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        opacity: 0.88,
        imageRendering: 'pixelated',
      }}
    />
  )
}

function HackingOverlay() {
  const progressRef = useRef<SVGCircleElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const labelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let rafId: number
    const update = () => {
      if (containerRef.current) {
        containerRef.current.style.display =
          state.phase === 'hacking' ? 'flex' : 'none'
      }
      if (progressRef.current && state.phase === 'hacking') {
        const circumference = 2 * Math.PI * 50
        const offset = circumference * (1 - state.hackingProgress)
        progressRef.current.style.strokeDashoffset = String(offset)
      }
      if (labelRef.current && state.currentHackId) {
        const mystery = MYSTERIES.find(
          (m) => m.hackTargetId === state.currentHackId
        )
        labelRef.current.textContent = mystery
          ? mystery.hint
          : state.currentHackId
      }
      rafId = requestAnimationFrame(update)
    }
    rafId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        display: 'none',
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        pointerEvents: 'auto',
        zIndex: 20,
      }}
    >
      {/* Spinner ring */}
      <div
        style={{
          width: 80,
          height: 80,
          border: '8px solid #8a6422',
          borderRadius: '50%',
          borderTop: '8px solid #ff8833',
          animation: 'spin 1s linear infinite',
          marginBottom: 4,
        }}
      />
      {/* SVG circular progress */}
      <svg
        width="120"
        height="120"
        style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}
      >
        <circle cx="60" cy="60" r="50" stroke="#8a6422" strokeWidth="4" fill="none" opacity="0.3" />
        <circle
          ref={progressRef}
          cx="60"
          cy="60"
          r="50"
          stroke="#ff8833"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 50}`}
          strokeDashoffset={`${2 * Math.PI * 50}`}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div
        ref={labelRef}
        style={{
          marginTop: 80,
          color: '#ffbb44',
          fontFamily: 'monospace',
          fontSize: '16px',
          letterSpacing: '0.15em',
          textAlign: 'center',
        }}
      />
      <div style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', fontSize: '13px' }}>
        [Q] キャンセル
      </div>
    </div>
  )
}

export default function HUD({ onStart }: HUDProps) {
  const [phase, setPhaseState] = useState(state.phase)
  const [horrorLevel, setHorrorLevel] = useState(state.horrorLevel)
  const [mysteriesSolved, setMysteriesSolved] = useState(state.mysteriesSolved)
  const [currentMysteryIndex, setCurrentMysteryIndex] = useState(state.currentMysteryIndex)
  const [nearHackable, setNearHackableState] = useState(state.nearHackable)
  const [cookProximity, setCookProx] = useState(state.cookProximity)
  const [solvedReward, setSolvedReward] = useState(state.solvedMysteryReward)
  const [inventory, setInventory] = useState<string[]>(state.inventory)
  const [showTutorial, setShowTutorial] = useState(state.showTutorial)
  const [blink, setBlink] = useState(true)

  useEffect(() => {
    const unsub = subscribe(() => {
      setPhaseState(state.phase)
      setHorrorLevel(state.horrorLevel)
      setMysteriesSolved(state.mysteriesSolved)
      setCurrentMysteryIndex(state.currentMysteryIndex)
      setNearHackableState(state.nearHackable)
      setCookProx(state.cookProximity)
      setSolvedReward(state.solvedMysteryReward)
      setInventory([...state.inventory])
      setShowTutorial(state.showTutorial)
    })
    const blinkTimer = setInterval(() => setBlink((b) => !b), 600)
    return () => {
      unsub()
      clearInterval(blinkTimer)
    }
  }, [])

  // Auto-clear reward popup after 2s
  useEffect(() => {
    if (!solvedReward) return
    const t = setTimeout(() => clearRewardPopup(), 2000)
    return () => clearTimeout(t)
  }, [solvedReward])

  const currentMystery = MYSTERIES[currentMysteryIndex] ?? MYSTERIES[0]
  const glitchStyle: CSSProperties =
    horrorLevel >= 3 ? { animation: 'glitch 0.4s infinite' } : {}

  const progressDots = Array.from({ length: 5 }, (_, i) =>
    i < mysteriesSolved ? '■' : '□'
  ).join('')

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        fontFamily: 'monospace',
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes glitch {
          0%   { transform: translate(0,0); }
          20%  { transform: translate(-2px, 1px); filter: hue-rotate(90deg); }
          40%  { transform: translate(2px, -1px); }
          60%  { transform: translate(-1px, 2px); filter: hue-rotate(180deg); }
          80%  { transform: translate(1px, -2px); }
          100% { transform: translate(0,0); filter: none; }
        }
        @keyframes scanline {
          0%   { top: -4px; }
          100% { top: 100%; }
        }
        @keyframes vhsFlicker {
          0%   { opacity: 1; }
          10%  { opacity: 0.8; }
          20%  { opacity: 1; }
          55%  { opacity: 1; }
          60%  { opacity: 0.6; }
          65%  { opacity: 1; }
          90%  { opacity: 1; }
          95%  { opacity: 0.7; }
          100% { opacity: 1; }
        }
        @keyframes invertFlash {
          0%   { filter: invert(0); }
          50%  { filter: invert(0.9); }
          100% { filter: invert(0); }
        }
        @keyframes flicker {
          0%   { opacity: 1; }
          50%  { opacity: 0.6; }
          100% { opacity: 0.9; }
        }
        @keyframes rewardFade {
          0%   { opacity: 0; transform: translateY(10px); }
          15%  { opacity: 1; transform: translateY(0); }
          80%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes weakGlitch {
          0%, 92%, 100% { transform: translate(0,0); opacity: 1; }
          93% { transform: translate(-3px, 2px); filter: hue-rotate(90deg); opacity: 0.97; }
          95% { transform: translate(2px, -1px); filter: hue-rotate(180deg); opacity: 0.98; }
          97% { transform: translate(-1px, 3px); filter: hue-rotate(270deg); opacity: 0.96; }
        }
        @keyframes periodicInvert {
          0%, 88%, 100% { opacity: 0; }
          89%, 96% { opacity: 0.85; }
          92% { opacity: 1; }
        }
        @keyframes handLeft {
          0%, 60%, 100% { transform: translateX(-120px) rotate(30deg); opacity: 0; }
          20%, 45% { transform: translateX(10px) rotate(5deg); opacity: 0.22; }
        }
        @keyframes handRight {
          0%, 60%, 100% { transform: translateX(120px) scaleX(-1) rotate(-30deg); opacity: 0; }
          25%, 50% { transform: translateX(-10px) scaleX(-1) rotate(-5deg); opacity: 0.18; }
        }
        @keyframes handTop {
          0%, 65%, 100% { transform: translateY(-120px) rotate(180deg); opacity: 0; }
          30%, 55% { transform: translateY(10px) rotate(180deg); opacity: 0.15; }
        }
        @keyframes handBottom {
          0%, 70%, 100% { transform: translateY(120px); opacity: 0; }
          35%, 55% { transform: translateY(-10px); opacity: 0.2; }
        }
      `}</style>

      {/* ── TITLE SCREEN ── */}
      {phase === 'title' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.75)',
            pointerEvents: 'auto',
            cursor: 'pointer',
            gap: '24px',
          }}
          onClick={onStart}
        >
          <div
            style={{
              fontSize: '14px',
              color: '#8a6422',
              letterSpacing: '0.3em',
            }}
          >
            ── 明治スチームパンク探偵譚 ──
          </div>
          <div
            style={{
              fontSize: 'clamp(32px, 6vw, 64px)',
              color: '#cd7f32',
              letterSpacing: '0.2em',
              fontWeight: 'bold',
              textShadow: '0 0 20px rgba(200,120,50,0.6)',
            }}
          >
            怨喰鬼厨冥満腹
          </div>
          <div
            style={{
              fontSize: 'clamp(20px, 4vw, 40px)',
              color: '#b87333',
              letterSpacing: '0.4em',
            }}
          >
            -HAUNTED WOK-
          </div>
          <div
            style={{
              fontSize: 'clamp(14px, 2vw, 20px)',
              letterSpacing: '0.3em',
              color: '#ffcc44',
              opacity: blink ? 1 : 0,
              transition: 'opacity 0.1s',
            }}
          >
            CLICK TO START
          </div>
          <div
            style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.4)',
              textAlign: 'center',
              lineHeight: 2,
            }}
          >
            WASD: 移動 ｜ マウス: 視点回転 ｜ E: ハッキング ｜ Q: キャンセル
          </div>
        </div>
      )}

      {/* ── TUTORIAL OVERLAY ── */}
      {phase === 'playing' && showTutorial && <TutorialOverlay />}

      {/* ── PLAYING OVERLAY ── */}
      {(phase === 'playing' || phase === 'hacking') && !showTutorial && (
        <>
          {/* Horror level 1+: static noise */}
          {horrorLevel >= 1 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
                backgroundSize: '150px 150px',
                opacity: 0.02,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Horror level 2+: vignette */}
          {horrorLevel >= 2 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Horror level 3+: scanline */}
          {horrorLevel >= 3 && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '4px',
                background: 'rgba(255,255,255,0.06)',
                animation: 'scanline 4s linear infinite',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Horror level 4+: red vignette + VHS flicker */}
          {horrorLevel >= 4 && (
            <>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(ellipse at center, transparent 30%, rgba(180,0,0,0.25) 100%)',
                  animation: 'vhsFlicker 1.8s ease-in-out infinite',
                  pointerEvents: 'none',
                }}
              />
            </>
          )}

          {/* Horror level 5: invert flash */}
          {horrorLevel >= 5 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                animation: 'invertFlash 3s ease-in-out infinite',
                pointerEvents: 'none',
                mixBlendMode: 'difference',
              }}
            />
          )}

          {/* Cook proximity vignette */}
          {cookProximity > 0.4 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(ellipse at center, transparent 20%, rgba(255,0,0,${(cookProximity - 0.4) * 1.8}) 100%)`,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Objective banner — top center with direction arrow */}
          <ObjectiveBanner mysteriesSolved={mysteriesSolved} currentMysteryIndex={currentMysteryIndex} />

          {/* Mystery card — top left */}
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              background: '#2a1e0e',
              border: '2px solid #8a6020',
              padding: '12px 16px',
              minWidth: '200px',
              maxWidth: '260px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#8a6020',
                letterSpacing: '0.1em',
                marginBottom: '6px',
              }}
            >
              現在の謎 [{currentMysteryIndex + 1}/5]
            </div>
            <div
              style={{
                fontSize: '14px',
                color: '#e8c060',
                letterSpacing: '0.05em',
                lineHeight: 1.5,
                ...(horrorLevel >= 3 ? glitchStyle : {}),
              }}
            >
              {currentMystery.hint}
            </div>
          </div>

          {/* Progress — top right */}
          <div
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              fontSize: '22px',
              letterSpacing: '0.3em',
              color: '#cd7f32',
              textShadow: '0 0 8px rgba(200,120,50,0.5)',
            }}
          >
            {progressDots}
          </div>

          {/* Crosshair */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '14px',
              lineHeight: 1,
              pointerEvents: 'none',
            }}
          >
            ·
          </div>

          {/* Interaction prompt */}
          {nearHackable && phase === 'playing' && (
            <div
              style={{
                position: 'absolute',
                bottom: 60,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.75)',
                padding: '8px 20px',
                border: '1px solid #8a6020',
                color: '#ffcc44',
                fontSize: '15px',
                letterSpacing: '0.1em',
                whiteSpace: 'nowrap',
              }}
            >
              [E] {nearHackable.label} をハック
            </div>
          )}

          {/* Minimap — bottom right */}
          <Minimap />

          {/* Hacking overlay */}
          <HackingOverlay />
        </>
      )}

      {/* ── REWARD POPUP ── */}
      {solvedReward && (
        <div
          style={{
            position: 'absolute',
            top: '35%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10,6,0,0.88)',
            border: '2px solid #cd7f32',
            padding: '20px 32px',
            textAlign: 'center',
            animation: 'rewardFade 2s forwards',
            pointerEvents: 'none',
            zIndex: 30,
          }}
        >
          <div style={{ fontSize: '13px', color: '#8a6020', marginBottom: 8, letterSpacing: '0.2em' }}>
            謎が解けた...
          </div>
          <div style={{ fontSize: '18px', color: '#cd7f32', letterSpacing: '0.1em' }}>
            {solvedReward} を手に入れた
          </div>
        </div>
      )}

      {/* ── WON SCREEN ── */}
      {phase === 'won' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,10,5,0.88)',
            pointerEvents: 'auto',
            cursor: 'pointer',
            gap: '24px',
          }}
          onClick={() => window.location.reload()}
        >
          <div
            style={{
              fontSize: 'clamp(28px, 5vw, 56px)',
              fontWeight: 'bold',
              letterSpacing: '0.2em',
              color: '#00ff88',
              textShadow: '0 0 20px rgba(0,255,136,0.6)',
            }}
          >
            真実を解明した
          </div>
          <div
            style={{
              fontSize: 'clamp(14px, 2vw, 20px)',
              color: '#88ffaa',
              letterSpacing: '0.1em',
              textAlign: 'center',
              lineHeight: 2,
            }}
          >
            全ての怪異は厨房の主から生まれていた<br />
            <span style={{ fontSize: '0.8em', color: '#5a8a6a' }}>
              [入手したもの]: {inventory.join('、')}
            </span>
          </div>
          <div
            style={{
              fontSize: 'clamp(14px, 2vw, 20px)',
              letterSpacing: '0.15em',
              opacity: blink ? 0.9 : 0.4,
              color: '#88ffaa',
            }}
          >
            CLICK TO PLAY AGAIN
          </div>
        </div>
      )}

      {/* ── CAUGHT SCREEN ── */}
      {phase === 'caught' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(80,0,0,0.88)',
            pointerEvents: 'auto',
            cursor: 'pointer',
            gap: '28px',
          }}
          onClick={() => window.location.reload()}
        >
          <div
            style={{
              fontSize: 'clamp(36px, 6vw, 72px)',
              fontWeight: 'bold',
              letterSpacing: '0.2em',
              color: '#ff0000',
              textShadow: '0 0 20px rgba(255,0,0,0.8)',
              animation: 'flicker 0.15s infinite alternate',
            }}
          >
            捕まった...
          </div>
          <div
            style={{
              fontSize: 'clamp(14px, 2vw, 22px)',
              letterSpacing: '0.15em',
              opacity: blink ? 0.9 : 0.4,
              color: '#ff6666',
            }}
          >
            CLICK TO TRY AGAIN
          </div>
        </div>
      )}
    </div>
  )
}
