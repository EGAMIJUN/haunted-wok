# 怨喰鬼厨冥満腹 -HAUNTED WOK-

> 明治スチームパンク探偵譚 / Meiji Steampunk Mystery Tale

## 概要 / About

蒸気と歯車が支配する明治の中華街。謎の怪異が街を蝕む。
あなたは夜の街を探索し、5つの謎を解明しなければならない。

*In a Meiji-era Chinatown of steam and gears, mysterious horrors threaten the town.
Explore the streets at night and uncover 5 mysteries before it's too late.*

## 操作方法 / Controls

| キー / Key | アクション / Action |
|-----------|-------------------|
| WASD | 移動 / Move |
| マウス / Mouse | 視点回転 / Rotate camera |
| E | ハッキング / Hack |
| Q | キャンセル / Cancel |

## セットアップ / Setup

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## ゲームの目的 / Objective

1. 街を探索して光るオブジェクトを見つける
2. Eキーでハッキングして謎を解く
3. 5つの謎を全て解明してエンディングへ
4. コックに捕まるな！（恐怖レベル4以上で出現）

*1. Explore the town and find glowing objects*
*2. Press E to hack and solve mysteries*
*3. Solve all 5 mysteries to reach the ending*
*4. Don't get caught by the Cook! (appears at horror level 4+)*

## 謎の場所 / Mystery Locations

| ID | 場所 / Location | ヒント / Hint |
|----|----------------|-------------|
| M1 | 食堂入口 / Restaurant entrance | 厨房の蒸気バルブを開け |
| M2 | 工場西壁 / Factory west wall | 工場の巨大歯車を止めよ |
| M3 | 路地裏奥 / End of alley | 路地裏の扉を解錠せよ |
| M4 | 広場噴水 / Plaza fountain | 広場の噴水を起動せよ |
| M5 | 厨房奥 / Kitchen interior | 全ての謎は厨房に通ず |

## マップ俯瞰図 / Map Overview

```
  X: -20        -10         0         10        20
     |           |          |          |          |
Z-20 ████████████████████████████████████████████
     ║                                            ║
Z-15 ║  ┌──────────────┐     ┌────────────────┐  ║
     ║  │              │     │                │  ║
Z-12 ║  │   怪夜食堂   │     │  大明蒸気工廠  │  ║
     ║  │  RESTAURANT  │     │   FACTORY      │  ║
     ║  │  [V]     [D] │     │  [G]           │  ║
Z- 9 ║  └──────────────┘     │                │  ║
     ║                       │                │  ║
Z- 6 ║                       └────────────────┘  ║
     ║                                            ║
Z- 4 ║  ┌────────────────────────────────────┐   ║
     ║  │                                    │   ║
Z- 2 ║  │          中央広場 PLAZA            │   ║
     ║  │     ○噴水[V]  ♦ ♦ ♦ ♦ ガス灯      │   ║
Z  0 ║  │                                    │   ║  ← 開始地点★
     ║  └────────────────────────────────────┘   ║
     ║                                            ║
Z+ 2 ║          ┌──────┐                          ║
     ║          │ 怪路地│                          ║
Z+ 6 ║          │ ALLEY│                          ║
     ║          │  [D] │                          ║
Z+10 ║          └──────┘                          ║
     ║                                            ║
Z+20 ████████████████████████████████████████████

凡例 / Legend:
  [V] = 蒸気バルブ Valve (hack target)
  [G] = 歯車 Gear (hack target)
  [D] = 扉 Door (hack target)
  ★  = プレイヤー開始地点 Player start
  ○  = 噴水 Fountain
  ♦  = ガス灯 Gas lamp
```

## ゲームフロー / Game Flow

```
  [ゲーム開始]
       │
       ▼
  [街を探索]
  WASD移動 + マウス視点
       │
       ▼
  [ハッキング対象を発見]
  近づくと「[E] XXX をハック」表示
       │
       ▼
  [Eキー押下]
  ├─ ハッキングミニゲーム(円形プログレス 2.5秒)
  ├─ Qキー → キャンセル
  └─ 完了 → 謎解決 + アイテム入手
       │
       ▼
  [怪異レベル上昇]
  Level 1: BGM歪み
  Level 2: ビネット
  Level 3: 文字グリッチ
  Level 4: コック出現!
  Level 5: 全崩壊
       │
       ├─ コックに捕まる → [GAME OVER] → リトライ
       │
       ▼
  [5つの謎を解明]
       │
       ▼
  [脱出成功 → ENDING]
```

## 怪異レベル / Horror Levels

| Level | 現象 / Phenomenon |
|-------|-----------------|
| 0 | 静かな夜 / Quiet night |
| 1 | BGMに雑音が混じる / BGM distortion |
| 2 | 影が揺れる / Flickering shadows |
| 3 | 文字が歪む / Glitching text |
| 4 | コック出現 / Cook appears |
| 5 | 全てが崩壊 / Total breakdown |

## 技術スタック / Tech Stack

- Next.js 14 + TypeScript
- Three.js / @react-three/fiber
- Procedural WebAudio (no external audio files)
