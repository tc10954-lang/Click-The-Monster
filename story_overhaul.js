// === START CHUNK 1 OF 2: story_overhaul.js ===
// --- Story Mode Visual Overhaul: Procedural Scenery, Live Radar Minimap, Quest Log & Laser Hazards ---

function decorateStoryWorldScenery() {
  const cam = document.getElementById('story-camera');
  if (!cam || cam.dataset.sceneryDecorated) return;
  cam.dataset.sceneryDecorated = '1';

  // 1. Cobblestone Village Plaza & Roads connecting regions
  const roads = [
    { x: 260, y: 240, w: 480, h: 420, bg: 'rgba(255, 255, 255, 0.04)', radius: '24px' }, // Haven Square
    { x: 740, y: 380, w: 1550, h: 65, bg: 'rgba(210, 180, 140, 0.12)', radius: '12px' }, // East Highway to Woods/Ash
    { x: 460, y: 660, w: 65, h: 950, bg: 'rgba(116, 185, 255, 0.12)', radius: '12px' },  // South Road to Tundra
    { x: 1100, y: 1550, w: 1450, h: 70, bg: 'rgba(255, 71, 87, 0.14)', radius: '12px' }  // Crimson Path to Core
  ];

  roads.forEach(r => {
    const roadEl = document.createElement('div');
    roadEl.style.cssText = `
      position: absolute; left: ${r.x}px; top: ${r.y}px; width: ${r.w}px; height: ${r.h}px;
      background: ${r.bg}; border-radius: ${r.radius}; pointer-events: none; z-index: 1;
    `;
    cam.prepend(roadEl);
  });

  // 2. Scatter Atmospheric Props across all 5 Biomes
  const biomeProps = [
    { xMin: 40,   xMax: 940,  yMin: 40,   yMax: 840,  icons: ['🏡', '🏮', '🌲', '🪨'], count: 22 },
    { xMin: 1040, xMax: 1940, yMin: 40,   yMax: 1040, icons: ['🌲', '🌳', '🍄', '🕸️'], count: 42 },
    { xMin: 2040, xMax: 2940, yMin: 40,   yMax: 1040, icons: ['🌵', '🦴', '🪨', '🏛️'], count: 34 },
    { xMin: 40,   xMax: 1440, yMin: 940,  yMax: 2140, icons: ['❄️', '🧊', '🏔️', '⛄'], count: 38 },
    { xMin: 1540, xMax: 2940, yMin: 1140, yMax: 2140, icons: ['🌋', '🔥', '⛓️', '💀'], count: 40 }
  ];

  biomeProps.forEach(b => {
    for (let i = 0; i < b.count; i++) {
      const px = b.xMin + Math.random() * (b.xMax - b.xMin);
      const py = b.yMin + Math.random() * (b.yMax - b.yMin);
      const icon = b.icons.at(Math.floor(Math.random() * b.icons.length));
      const prop = document.createElement('div');
      prop.textContent = icon;
      prop.style.cssText = `
        position: absolute; left: ${px}px; top: ${py}px; font-size: 1.75rem;
        opacity: 0.42; pointer-events: none; z-index: 1; user-select: none;
      `;
      cam.prepend(prop);
    }
  });
}

// Inject Live Radar Minimap + Quest Tracker HUD into Story Mode Overlay
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const overlay = document.getElementById('story-mode-overlay');
    if (!overlay || document.getElementById('story-minimap-box')) return;

    const hudCorner = document.createElement('div');
    hudCorner.id = 'story-minimap-box';
    hudCorner.style.cssText = `
      position: fixed; top: 76px; left: 14px; z-index: 176;
      background: rgba(8, 10, 18, 0.9); border: 1.5px solid rgba(255, 255, 255, 0.22);
      border-radius: 12px; padding: 8px; width: 185px; pointer-events: none;
      box-shadow: 0 6px 20px rgba(0,0,0,0.6);
    `;
    hudCorner.innerHTML = `
      <div style="font-size: 0.68rem; font-weight: 900; color: #00d2d3; margin-bottom: 4px; letter-spacing: 0.5px;">📡 WORLD RADAR</div>
      <canvas id="story-minimap-canvas" width="168" height="122" style="background: #05060a; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; display: block;"></canvas>
      <div id="story-quest-tracker" style="margin-top: 6px; font-size: 0.68rem; color: #ffd32a; font-weight: 800; line-height: 1.3;">
        📜 Quest: Talk to Elder Bob in Haven Village
      </div>
    `;
    overlay.appendChild(hudCorner);
  }, 400);
});
// === END CHUNK 1 OF 2 ===

// === START CHUNK 2 OF 2: story_overhaul.js ===
function renderStoryMinimapAndQuest() {
  const overlay = document.getElementById('story-mode-overlay');
  if (!overlay || overlay.style.display === 'none') return;

  decorateStoryWorldScenery();

  const canvas = document.getElementById('story-minimap-canvas');
  if (canvas && typeof STORY_WORLD !== 'undefined' && typeof storyState !== 'undefined') {
    const ctx = canvas.getContext('2d');
    const sx = canvas.width / STORY_WORLD.width;
    const sy = canvas.height / STORY_WORLD.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw 5 Region Zones
    if (typeof STORY_ZONES !== 'undefined') {
      STORY_ZONES.forEach(z => {
        ctx.fillStyle = z.bg;
        ctx.fillRect(z.x * sx, z.y * sy, z.w * sx, z.h * sy);
        ctx.strokeStyle = z.border + '66';
        ctx.strokeRect(z.x * sx, z.y * sy, z.w * sx, z.h * sy);
      });
    }

    // Draw Unopened Chests (Gold dots)
    if (typeof STORY_CHESTS !== 'undefined') {
      STORY_CHESTS.forEach(ch => {
        if (storyState.openedChests.includes(ch.id)) return;
        ctx.fillStyle = '#ffd32a';
        ctx.fillRect(ch.x * sx - 2, ch.y * sy - 2, 4, 4);
      });
    }

    // Draw NPCs (Cyan dots)
    if (typeof STORY_NPCS !== 'undefined') {
      STORY_NPCS.forEach(npc => {
        ctx.fillStyle = npc.horror ? '#ff6b81' : '#00d2d3';
        ctx.beginPath();
        ctx.arc(npc.x * sx, npc.y * sy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw Remaining Enemies & Bosses (Red dots)
    if (typeof STORY_ENEMIES !== 'undefined') {
      STORY_ENEMIES.forEach(en => {
        if (storyState.defeatedEnemies.includes(en.id)) return;
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.arc(en.curX * sx, en.curY * sy, en.isBoss ? 4.2 : 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw Player Blinking Beacon (White/Green)
    ctx.fillStyle = '#2ed573';
    ctx.beginPath();
    ctx.arc(storyState.x * sx, storyState.y * sy, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  // Update Live Quest Objective Tracker
  const qEl = document.getElementById('story-quest-tracker');
  if (qEl && typeof storyState !== 'undefined' && typeof STORY_ENEMIES !== 'undefined') {
    const nextEnemy = STORY_ENEMIES.find(e => !storyState.defeatedEnemies.includes(e.id));
    if (!nextEnemy) {
      qEl.style.color = '#2ed573';
      qEl.textContent = '🏆 ALL CHAPTERS COMPLETE! Free Roam Unlocked.';
    } else {
      qEl.style.color = nextEnemy.horror ? '#ff6b81' : '#ffd32a';
      qEl.textContent = `📜 Objective: Hunt ${nextEnemy.icon} ${nextEnemy.name} (${storyState.defeatedEnemies.length}/${STORY_ENEMIES.length})`;
    }
  }
}

setInterval(renderStoryMinimapAndQuest, 150);

// --- Undertale Bullet-Hell Sweeping Laser Hazards inside Story Battles! ---
if (typeof launchStoryBattleArena === 'function') {
  const _overhaulOrigBattle = launchStoryBattleArena;
  launchStoryBattleArena = function(enemy) {
    _overhaulOrigBattle(enemy);

    const box = document.getElementById('sb-combat-box');
    if (!box) return;

    let mouseInsideBox = false;
    let curMouseX = 0, curMouseY = 0;

    box.addEventListener('mouseenter', () => { mouseInsideBox = true; });
    box.addEventListener('mouseleave', () => { mouseInsideBox = false; });
    box.addEventListener('mousemove', (e) => {
      const rect = box.getBoundingClientRect();
      curMouseX = e.clientX - rect.left;
      curMouseY = e.clientY - rect.top;
    });

    // Periodically sweep a glowing red Undertale laser beam across the battle box!
    const laserSpawner = setInterval(() => {
      if (!document.getElementById('story-battle-arena')) {
        clearInterval(laserSpawner);
        return;
      }

      const isHorizontal = Math.random() < 0.5;
      const pos = isHorizontal
        ? 40 + Math.random() * (box.clientHeight - 80)
        : 40 + Math.random() * (box.clientWidth - 80);

      // 1. Telegraph warning line
      const warn = document.createElement('div');
      warn.style.cssText = isHorizontal
        ? `position:absolute; left:0; right:0; top:${pos}px; height:4px; background:rgba(255,71,87,0.45); pointer-events:none;`
        : `position:absolute; top:0; bottom:0; left:${pos}px; width:4px; background:rgba(255,71,87,0.45); pointer-events:none;`;
      box.appendChild(warn);

      // 2. Fire active laser after 650ms (heals boss if player's cursor gets hit!)
      setTimeout(() => {
        warn.remove();
        if (!document.getElementById('story-battle-arena')) return;

        const beam = document.createElement('div');
        beam.style.cssText = isHorizontal
          ? `position:absolute; left:0; right:0; top:${pos - 8}px; height:18px; background:#ff4757; box-shadow:0 0 18px #ff4757; pointer-events:none;`
          : `position:absolute; top:0; bottom:0; left:${pos - 8}px; width:18px; background:#ff4757; box-shadow:0 0 18px #ff4757; pointer-events:none;`;
        box.appendChild(beam);

        const hitCheck = setInterval(() => {
          if (!mouseInsideBox) return;
          const hit = isHorizontal
            ? Math.abs(curMouseY - pos) < 12
            : Math.abs(curMouseX - pos) < 12;

          if (hit) {
            clearInterval(hitCheck);
            if (typeof sfx !== 'undefined') sfx.armorHit();
            box.style.borderColor = '#ff4757';
            setTimeout(() => { if (box) box.style.borderColor = enemy.horror ? '#ff4757' : '#fff'; }, 200);
          }
        }, 40);

        setTimeout(() => {
          clearInterval(hitCheck);
          beam.remove();
        }, 380);
      }, 650);
    }, enemy.isBoss ? 1900 : 2800);
  };
}
// === END CHUNK 2 OF 2 ===
