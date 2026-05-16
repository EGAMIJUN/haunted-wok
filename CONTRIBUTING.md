# Contributing to HAUNTED WOK

## 建物を追加する / Adding a Building

Edit `src/data/buildings.json`:

```json
{
  "id": "unique_id",
  "name": "日本語名",
  "nameEn": "English Name",
  "type": "restaurant | factory | alley | plaza | custom",
  "bounds": { "minX": -5, "maxX": 5, "minZ": -5, "maxZ": 5 },
  "entrance": { "x": 0, "z": -5 },
  "hackables": [
    {
      "id": "unique_hackable_id",
      "type": "valve | gear | door | item",
      "position": [x, y, z],
      "label": "表示テキスト",
      "mysteryId": "M1-M5 or null"
    }
  ]
}
```

Then add the corresponding collision bounds to `WALL_BOUNDS` in `src/game/Player.tsx`.

To make the building visible, add geometry to `src/game/World.tsx`.

## NPCを追加する / Adding an NPC

Edit `src/data/npcs.json`:

```json
{
  "id": "unique_id",
  "name": "名前",
  "nameEn": "Name",
  "color": "#hexcolor",
  "startPos": [x, y, z],
  "patrolRadius": 5,
  "speed": 1.0
}
```

NPCs are automatically loaded from the JSON by `NPCSystem.tsx`. No code changes needed.

## 謎を追加する / Adding a Mystery

Edit `src/game/gameStore.ts` and add an entry to `MYSTERIES`:

```typescript
{ id: 'M6', hint: 'ヒントテキスト', hackTargetId: 'your_hackable_id', reward: '報酬アイテム名' }
```

Then add the hackable position to `HACKABLE_POSITIONS` in `HackingSystem.tsx`.

## Pull Requests

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/my-building`
3. Commit your changes
4. Push and open a PR

All contributions welcome!
