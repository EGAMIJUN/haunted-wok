export type Phase = 'title' | 'playing' | 'hacking' | 'caught' | 'won'

export interface HackableTarget {
  type: 'valve' | 'gear' | 'door' | 'item'
  id: string
  label: string
}

export interface Mystery {
  id: string
  hint: string
  hackTargetId: string
  reward: string
}

export const MYSTERIES: Mystery[] = [
  { id: 'M1', hint: '厨房の蒸気バルブを開け', hackTargetId: 'valve_kitchen', reward: '古い日記のページ' },
  { id: 'M2', hint: '工場の巨大歯車を止めよ', hackTargetId: 'gear_factory', reward: '暗号化された設計図' },
  { id: 'M3', hint: '路地裏の扉を解錠せよ', hackTargetId: 'door_alley', reward: '赤い薬瓶' },
  { id: 'M4', hint: '広場の噴水を起動せよ', hackTargetId: 'valve_plaza', reward: '錆びた鍵' },
  { id: 'M5', hint: '全ての謎は厨房に通ず', hackTargetId: 'door_kitchen_secret', reward: '真実' },
]

interface GameState {
  phase: Phase
  horrorLevel: number
  mysteriesSolved: number
  currentMysteryIndex: number
  inventory: string[]
  nearHackable: HackableTarget | null
  playerPos: [number, number, number]
  playerRot: number
  cookPos: [number, number, number]
  cookProximity: number
  beatKick: boolean
  hackingProgress: number
  isHacking: boolean
  currentHackId: string | null
  unlockedDoors: string[]
  steamBlasting: string[]
  solvedMysteryReward: string | null
  showTutorial: boolean
}

export const state: GameState = {
  phase: 'title',
  horrorLevel: 0,
  mysteriesSolved: 0,
  currentMysteryIndex: 0,
  inventory: [],
  nearHackable: null,
  playerPos: [0, 0.9, 3],
  playerRot: 0,
  cookPos: [-5, 0, -3],
  cookProximity: 0,
  beatKick: false,
  hackingProgress: 0,
  isHacking: false,
  currentHackId: null,
  unlockedDoors: [],
  steamBlasting: [],
  solvedMysteryReward: null,
  showTutorial: false,
}

const listeners = new Set<() => void>()
export function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}
export function notify() { listeners.forEach(cb => cb()) }

export function startGame() {
  state.phase = 'playing'
  state.horrorLevel = 0
  state.mysteriesSolved = 0
  state.currentMysteryIndex = 0
  state.inventory = []
  state.nearHackable = null
  state.playerPos = [0, 0.9, 3]
  state.playerRot = 0
  state.cookPos = [-5, 0, -3]
  state.cookProximity = 0
  state.beatKick = false
  state.hackingProgress = 0
  state.isHacking = false
  state.currentHackId = null
  state.unlockedDoors = []
  state.steamBlasting = []
  state.solvedMysteryReward = null
  state.showTutorial = true
  notify()
}

export function dismissTutorial() {
  state.showTutorial = false
  notify()
}

export function setNearHackable(target: HackableTarget | null) {
  const prev = state.nearHackable
  if (prev?.id !== target?.id) {
    state.nearHackable = target
    notify()
  }
}

export function beginHack(id: string) {
  state.isHacking = true
  state.phase = 'hacking'
  state.currentHackId = id
  state.hackingProgress = 0
  notify()
}

export function advanceHack(delta: number): boolean {
  state.hackingProgress += delta / 2.5
  if (state.hackingProgress >= 1) {
    state.hackingProgress = 1
    return true
  }
  return false
}

export function cancelHack() {
  state.isHacking = false
  state.phase = 'playing'
  state.currentHackId = null
  state.hackingProgress = 0
  notify()
}

export function completeHack(id: string) {
  const mystery = MYSTERIES.find(m => m.hackTargetId === id)

  state.isHacking = false
  state.phase = 'playing'
  state.currentHackId = null
  state.hackingProgress = 0

  if (mystery) {
    state.mysteriesSolved += 1
    state.horrorLevel = state.mysteriesSolved
    state.inventory = [...state.inventory, mystery.reward]
    state.solvedMysteryReward = mystery.reward

    if (id.startsWith('valve')) {
      if (!state.steamBlasting.includes(id)) {
        state.steamBlasting = [...state.steamBlasting, id]
      }
    } else if (id.startsWith('door') || id.startsWith('gear')) {
      if (!state.unlockedDoors.includes(id)) {
        state.unlockedDoors = [...state.unlockedDoors, id]
      }
    }

    // Find next unsolved mystery
    const nextIndex = MYSTERIES.findIndex(m => !state.inventory.some(inv => inv === m.reward))
    state.currentMysteryIndex = nextIndex >= 0 ? nextIndex : MYSTERIES.length - 1

    // win is triggered by walking into ExitPortal (HackingSystem.tsx)
  } else {
    // hackable not tied to a mystery — still unlock
    if (!state.unlockedDoors.includes(id)) {
      state.unlockedDoors = [...state.unlockedDoors, id]
    }
  }

  notify()
}

export function clearRewardPopup() {
  state.solvedMysteryReward = null
  notify()
}

export function setPhase(p: Phase) {
  state.phase = p
  notify()
}

export function setCookProximity(p: number) {
  state.cookProximity = Math.max(0, Math.min(1, p))
  notify()
}

export function triggerKick() {
  state.beatKick = true
  notify()
  requestAnimationFrame(() => {
    state.beatKick = false
    notify()
  })
}
