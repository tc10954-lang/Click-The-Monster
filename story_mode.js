// --- Undertale-Style Open-World Story Mode (Funny, Meta, Terrifying & Brutal!) ---
const storyState = Object.assign({
  x: 420,
  y: 420,
  chapter: 1,
  karma: 0, // +1 for Spare, -1 for Slay
  defeatedEnemies: [],
  openedChests: [],
  wellInspects: 0,
  endingReached: null
}, JSON.parse(localStorage.getItem('monster_story_save_v1') || '{}'));

function saveStoryMode() {
  localStorage.setItem('monster_story_save_v1', JSON.stringify(storyState));
}

const STORY_WORLD = { width: 3000, height: 2200 };

const STORY_ZONES = [
  { name: '🏘️ Haven Village (Safe)', x: 0, y: 0, w: 1000, h: 900, bg: '#13221a', border: '#2ed573' },
  { name: '🌲 Glitchwood Forest', x: 1000, y: 0, w: 1000, h: 1100, bg: '#0f1c18', border: '#1dd1a1' },
  { name: '🏜️ Ash Wastes', x: 2000, y: 0, w: 1000, h: 1100, bg: '#261a12', border: '#ff9f43' },
  { name: '❄️ Abyssal Tundra', x: 0, y: 900, w: 1500, h: 1300, bg: '#101829', border: '#54a0ff' },
  { name: '🌋 THE REDACTED CORE', x: 1500, y: 1100, w: 1500, h: 1100, bg: '#1f080c', border: '#ff4757' }
];

const STORY_NPCS = [
  {
    id: 'npc_bob', x: 360, y: 310, icon: '🧙‍♂️', name: 'Elder Bob',
    getLines: () => [
      "Welcome to Haven Village! Please don't click my face. I am an NPC, not a Coin piñata.",
      "Listen carefully: the North-East woods are full of monsters that actually have HP bars now.",
      "If you get one down to low HP, a yellow [SPARE] button appears. Or just obliterate them. I'm not your dad."
    ]
  },
  {
    id: 'npc_dev_ghost', x: 640, y: 260, icon: '👾', name: 'Tired Grunt #402',
    getLines: () => [
      "Man... I just clocked out of Normal Mode. My back hurts from getting Splash Blasted 400 times today.",
      "Tell your friends to stop farming us in 0.4 seconds. We have families."
    ]
  },
  {
    id: 'npc_well', x: 520, y: 580, icon: '🕳️', name: 'The Bottomless Well', horror: true,
    getLines: () => {
      storyState.wellInspects++;
      saveStoryMode();
      const coins = typeof shopState !== 'undefined' ? shopState.coins : 0;
      if (storyState.wellInspects === 1) return ["You peer into the dark water. Nothing stares back. Probably."];
      if (storyState.wellInspects === 2) return ["...A cold whisper rises from the stone: 'I can see your cursor moving.'"];
      return [
        `IT KNOWS YOU ARE HERE. ${coins.toLocaleString()} COINS WILL NOT SAVE YOU IN THE CORE.`,
        "STOP LOOKING INTO THE WELL. IT IS CLIMBING UP THE WALLS."
      ];
    }
  },
  {
    id: 'npc_tax', x: 2250, y: 420, icon: '🤵', name: 'Swarm IRS Agent',
    getLines: () => [
      "HOLD IT! You have been hoarding coins without filing a Monster-Slaying Tax Form!",
      "In the Ash Wastes, the monsters hit twice as fast. Good luck out there, taxpayer."
    ]
  },
  {
    id: 'npc_monolith', x: 650, y: 1550, icon: '🗿', name: 'THE OBSERVER', horror: true,
    getLines: () => {
      const rb = typeof careerData !== 'undefined' ? (careerData.rebirths || 0) : 0;
      return [
        `YOU HAVE REBORN ${rb} TIMES. YET YOU STILL CLICK SHAPES ON A GLOWING SCREEN.`,
        "SOUTH-EAST LIES THE REDACTED CORE. DO NOT ENTER UNLESS YOU ARE READY TO BLEED."
      ];
    }
  }
];
const STORY_CHESTS = [
  { id: 'chest_haven', x: 180, y: 180, coins: 2500, scrap: 25, text: 'You pried open Elder Bob\'s emergency stash! (+2,500 🪙 & +25 🔩)' },
  { id: 'chest_woods', x: 1820, y: 240, coins: 8000, scrap: 60, text: 'Hidden beneath a corrupted oak! (+8,000 🪙 & +60 🔩)' },
  { id: 'chest_ash', x: 2780, y: 880, coins: 20000, scrap: 120, text: 'Smuggler\'s War Chest unlocked! (+20,000 🪙 & +120 🔩)' },
  { id: 'chest_tundra', x: 220, y: 1980, coins: 45000, scrap: 250, text: 'Frozen Relic Vault cracked open! (+45,000 🪙 & +250 🔩)' }
];

const STORY_ENEMIES = [
  // Glitchwood Forest
  { id: 'en_w1', x: 1250, y: 350, icon: '🟢', name: 'Forest Brute', hp: 90, count: 6, speed: 3.2, reward: 3500,
    intro: ["A massive Forest Brute blocks the path!", "'OI! MY SHIFT JUST STARTED! BACK OFF!'"] },
  { id: 'en_w2', x: 1680, y: 740, icon: '🟣', name: 'Glitch Stalker', hp: 130, count: 8, speed: 4.5, reward: 6000,
    intro: ["Static fills the air. A Glitch Stalker twitches violently...", "'k-k-kill... or... b-be... c-clicked...'"] },

  // Ash Wastes
  { id: 'en_a1', x: 2350, y: 260, icon: '🦂', name: 'Dune Executioner', hp: 220, count: 8, speed: 4.8, reward: 12000,
    intro: ["The sand erupts! Dune Executioners surround your cursor!", "'NO AUTO-TURRETS CAN SAVE YOU IN THE WASTES!'"] },
  { id: 'en_a2', x: 2680, y: 690, icon: '🔥', name: 'Ashlands Warlord', isBoss: true, hp: 650, count: 1, speed: 4.2, reward: 28000,
    intro: ["MINI-BOSS: THE ASHLANDS WARLORD!", "'I HAVE EATEN THOUSANDS OF LEVEL 50 HUNTERS FOR BREAKFAST!'"] },

  // Abyssal Tundra
  { id: 'en_t1', x: 480, y: 1220, icon: '❄️', name: 'Frostbite Wraith', hp: 380, count: 9, speed: 5.0, reward: 22000,
    intro: ["Your screen freezes over. Hollow eye sockets glow in the blizzard...", "'do you feel your fingers getting cold?'"] },
  { id: 'en_t2', x: 1120, y: 1780, icon: '👁️', name: 'THE PALE HARVESTER', isBoss: true, horror: true, hp: 1200, count: 1, speed: 5.2, reward: 55000,
    intro: ["IT HAS NO FACE. ONLY A THOUSAND BLINKING CURSORS.", "'WE REMEMBER EVERY MONSTER YOU CLICKED IN NORMAL MODE.'"] },

  // Final Citadel: The Redacted Core
  { id: 'en_c1', x: 1950, y: 1450, icon: '💀', name: 'Citadel Deathguard', hp: 600, count: 10, speed: 5.5, reward: 40000,
    intro: ["Obsidian gates slam shut behind you!", "'TURN BACK NOW OR BE ERASED FROM LOCALSTORAGE!'"] },
  { id: 'en_final_boss', x: 2550, y: 1820, icon: '👹', name: 'ENTITY 00: THE ARCHITECT', isBoss: true, isFinal: true, horror: true, hp: 2800, count: 1, speed: 5.8, reward: 150000,
    intro: [
      "THE SKY TEARS OPEN. CODE BLEEDS DOWN THE EDGES OF YOUR MONITOR.",
      "'SO... YOU FINALLY REACHED THE CORE. YOU THINK YOU CONTROL THIS GAME?'",
      "'LET SEE HOW FAST YOU CLICK WHEN YOUR OWN REALITY COLLAPSES!'"
    ]
  }
];

let storyLoopId = null;
let storyBattleActive = false;
const keysPressed = {};

window.addEventListener('keydown', (e) => {
  keysPressed[e.key.toLowerCase()] = true;
  if ((e.key === ' ' || e.key.toLowerCase() === 'e') && !document.getElementById('story-mode-overlay')?.classList.contains('hidden')) {
    if (!storyBattleActive) handleStoryInteract();
  }
});
window.addEventListener('keyup', (e) => {
  keysPressed[e.key.toLowerCase()] = false;
});
let activeDialogueQueue = [];
let activeDialogueCallback = null;
let activeDialogueHorror = false;
let typewriterTimer = null;
let isTypingLine = false;
let currentFullLine = '';

window.addEventListener('DOMContentLoaded', () => {
  // 1. Replace the old World Map button with "🗺️ Story Mode (Open World)"
  setTimeout(() => {
    const mapBtn = [...document.querySelectorAll('button')].find(b => /world map|campaign/i.test(b.textContent));
    if (mapBtn) {
      mapBtn.innerHTML = '🗺️ Story Mode (Open World)';
      mapBtn.style.background = 'linear-gradient(135deg, #a55eea, #8854d0)';
      const newBtn = mapBtn.cloneNode(true);
      mapBtn.parentNode.replaceChild(newBtn, mapBtn);
      newBtn.addEventListener('click', openStoryWorld);
    }
  }, 350);

  // 2. Build Fullscreen Open-World Story Mode Overlay
  const overlay = document.createElement('div');
  overlay.id = 'story-mode-overlay';
  overlay.className = 'hidden';
  overlay.style.cssText = `
    position: fixed; inset: 0; background: #07080c; z-index: 170;
    overflow: hidden; user-select: none; font-family: inherit;
  `;
  overlay.innerHTML = `
    <!-- Top Story HUD -->
    <div style="position:fixed; top:12px; left:14px; right:14px; z-index:175; display:flex; justify-content:space-between; align-items:center; pointer-events:none;">
      <div style="background:rgba(10,12,20,0.88); border:1.5px solid rgba(255,255,255,0.2); border-radius:12px; padding:7px 14px; pointer-events:auto;">
        <div id="story-zone-label" style="font-weight:900; font-size:0.95rem; color:#2ed573;">🏘️ Haven Village</div>
        <div id="story-stats-label" style="font-size:0.72rem; color:#a4b0be; font-weight:800;">
          Move: WASD / Arrows • Interact: [E] or [SPACE] • Karma: 0
        </div>
      </div>
      <div style="display:flex; gap:8px; pointer-events:auto;">
        <button id="story-save-btn" style="padding:8px 12px; border:1.5px solid #00d2d3; border-radius:10px; background:rgba(0,210,211,0.18); color:#00d2d3; font-weight:900; cursor:pointer;">
          💎 Save Progress
        </button>
        <button id="story-exit-btn" style="padding:8px 14px; border:none; border-radius:10px; background:#ff4757; color:#fff; font-weight:900; cursor:pointer;">
          ✖ Exit to Menu
        </button>
      </div>
    </div>

    <!-- Scrolling 2D World Camera Container -->
    <div id="story-camera" style="position:absolute; width:${STORY_WORLD.width}px; height:${STORY_WORLD.height}px; will-change:transform;"></div>

    <!-- Undertale Typewriter Dialogue Box -->
    <div id="story-dialogue-box" class="hidden" style="
      position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%);
      width: 90vw; max-width: 680px; min-height: 118px; z-index: 185;
      background: #05060a; border: 3px solid #fff; border-radius: 6px;
      padding: 14px 18px; display: flex; gap: 14px; align-items: flex-start;
      box-shadow: 0 12px 40px rgba(0,0,0,0.85); cursor: pointer;
    ">
      <div id="story-dlg-portrait" style="font-size: 2.6rem; line-height: 1;">🧙‍♂️</div>
      <div style="flex: 1;">
        <div id="story-dlg-speaker" style="font-weight: 900; font-size: 0.85rem; color: #ffd32a; margin-bottom: 4px;">Elder Bob</div>
        <div id="story-dlg-text" style="font-size: 0.96rem; line-height: 1.45; color: #fff; font-weight: 700;"></div>
        <div style="font-size: 0.68rem; color: #747d8c; margin-top: 8px; text-align: right;">[Click or Press E / Space] ▼</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('story-exit-btn').addEventListener('click', closeStoryWorld);
  document.getElementById('story-save-btn').addEventListener('click', () => {
    saveStoryMode();
    const btn = document.getElementById('story-save-btn');
    btn.textContent = '✅ Saved!';
    setTimeout(() => { btn.textContent = '💎 Save Progress'; }, 1200);
  });
  document.getElementById('story-dialogue-box').addEventListener('click', advanceStoryDialogue);
});

function startStoryDialogue(speaker, portrait, lines, horror = false, onComplete = null) {
  activeDialogueQueue = [...lines];
  activeDialogueCallback = onComplete;
  activeDialogueHorror = horror;

  const box = document.getElementById('story-dialogue-box');
  box.classList.remove('hidden');
  box.style.borderColor = horror ? '#ff4757' : '#fff';
  box.style.background = horror ? '#120205' : '#05060a';
  document.getElementById('story-dlg-portrait').textContent = portrait;
  document.getElementById('story-dlg-speaker').textContent = speaker;
  document.getElementById('story-dlg-speaker').style.color = horror ? '#ff4757' : '#ffd32a';

  advanceStoryDialogue();
}

function advanceStoryDialogue() {
  const textEl = document.getElementById('story-dlg-text');
  if (isTypingLine) {
    clearInterval(typewriterTimer);
    textEl.textContent = currentFullLine;
    isTypingLine = false;
    return;
  }

  if (activeDialogueQueue.length === 0) {
    document.getElementById('story-dialogue-box').classList.add('hidden');
    if (activeDialogueCallback) {
      const cb = activeDialogueCallback;
      activeDialogueCallback = null;
      cb();
    }
    return;
  }

  currentFullLine = activeDialogueQueue.shift();
  textEl.textContent = '';
  textEl.style.color = activeDialogueHorror ? '#ff6b81' : '#fff';
  isTypingLine = true;
  let idx = 0;

  typewriterTimer = setInterval(() => {
    if (idx < currentFullLine.length) {
      textEl.textContent += currentFullLine[idx++];
      if (idx % 3 === 0 && typeof sfx !== 'undefined' && !sfx.isMuted) {
        try { sfx.hit(); } catch {}
      }
    } else {
      clearInterval(typewriterTimer);
      isTypingLine = false;
    }
  }, activeDialogueHorror ? 38 : 22);
}
function openStoryWorld() {
  document.getElementById('start-screen')?.classList.add('hidden');
  document.getElementById('story-mode-overlay').classList.remove('hidden');
  buildStoryWorldEntities();
  if (!storyLoopId) {
    storyLoopId = requestAnimationFrame(updateStoryWorldLoop);
  }
}

function closeStoryWorld() {
  if (storyLoopId) {
    cancelAnimationFrame(storyLoopId);
    storyLoopId = null;
  }
  storyBattleActive = false;
  document.getElementById('story-mode-overlay').classList.add('hidden');
  document.getElementById('start-screen')?.classList.remove('hidden');
}

function buildStoryWorldEntities() {
  const cam = document.getElementById('story-camera');
  cam.innerHTML = '';

  // 1. Render 5 Open-World Regions
  STORY_ZONES.forEach(z => {
    const div = document.createElement('div');
    div.style.cssText = `
      position: absolute; left: ${z.x}px; top: ${z.y}px; width: ${z.w}px; height: ${z.h}px;
      background: ${z.bg}; border: 2px dashed ${z.border}44; box-sizing: border-box;
      background-image: radial-gradient(${z.border}22 1px, transparent 1px);
      background-size: 40px 40px;
    `;
    div.innerHTML = `<div style="padding:14px; font-weight:900; font-size:1.1rem; color:${z.border}; opacity:0.55;">${z.name}</div>`;
    cam.appendChild(div);
  });

  // 2. Render Treasure Chests
  STORY_CHESTS.forEach(ch => {
    const opened = storyState.openedChests.includes(ch.id);
    const el = document.createElement('div');
    el.id = `story-obj-${ch.id}`;
    el.textContent = opened ? '📭' : '🎁';
    el.style.cssText = `position:absolute; left:${ch.x - 18}px; top:${ch.y - 18}px; font-size:2rem; cursor:pointer;`;
    cam.appendChild(el);
  });

  // 3. Render NPCs
  STORY_NPCS.forEach(npc => {
    const el = document.createElement('div');
    el.id = `story-obj-${npc.id}`;
    el.style.cssText = `position:absolute; left:${npc.x - 20}px; top:${npc.y - 20}px; text-align:center; cursor:pointer;`;
    el.innerHTML = `
      <div style="font-size:2.1rem; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.7));">${npc.icon}</div>
      <div style="font-size:0.65rem; font-weight:900; color:${npc.horror ? '#ff4757' : '#ffd32a'}; background:rgba(0,0,0,0.7); padding:1px 6px; border-radius:4px;">${npc.name}</div>
    `;
    cam.appendChild(el);
  });

  // 4. Render Active Overworld Monsters & Bosses
  STORY_ENEMIES.forEach(en => {
    if (storyState.defeatedEnemies.includes(en.id)) return;
    en.curX = en.x;
    en.curY = en.y;
    const el = document.createElement('div');
    el.id = `story-en-${en.id}`;
    el.style.cssText = `position:absolute; left:${en.curX - 24}px; top:${en.curY - 24}px; text-align:center;`;
    el.innerHTML = `
      <div style="font-size:${en.isBoss ? '3rem' : '2.2rem'}; filter:drop-shadow(0 0 12px ${en.horror ? '#ff4757' : '#ffa502'});">${en.icon}</div>
      <div style="font-size:0.65rem; font-weight:900; color:#fff; background:rgba(255,71,87,0.85); padding:1px 6px; border-radius:4px;">${en.name}</div>
    `;
    cam.appendChild(el);
  });

  // 5. Render Player Avatar
  const player = document.createElement('div');
  player.id = 'story-player';
  player.style.cssText = `
    position: absolute; width: 42px; height: 42px; font-size: 2.1rem;
    display: flex; align-items: center; justify-content: center; z-index: 10;
    filter: drop-shadow(0 0 10px #00d2d3);
  `;
  player.textContent = '🧑‍🚀';
  cam.appendChild(player);
}

function handleStoryInteract() {
  const dlgBox = document.getElementById('story-dialogue-box');
  if (!dlgBox.classList.contains('hidden')) {
    advanceStoryDialogue();
    return;
  }

  // Check nearby NPCs
  for (const npc of STORY_NPCS) {
    if (Math.hypot(storyState.x - npc.x, storyState.y - npc.y) < 75) {
      startStoryDialogue(npc.name, npc.icon, npc.getLines(), !!npc.horror);
      return;
    }
  }

  // Check nearby Chests
  for (const ch of STORY_CHESTS) {
    if (!storyState.openedChests.includes(ch.id) && Math.hypot(storyState.x - ch.x, storyState.y - ch.y) < 70) {
      storyState.openedChests.push(ch.id);
      saveStoryMode();
      if (typeof shopState !== 'undefined') {
        shopState.coins += ch.coins;
        if (typeof saveShopData === 'function') saveShopData();
      }
      if (typeof gearState !== 'undefined') {
        gearState.scrap += ch.scrap;
        if (typeof saveGearData === 'function') saveGearData();
      }
      const el = document.getElementById(`story-obj-${ch.id}`);
      if (el) el.textContent = '📭';
      if (typeof sfx !== 'undefined') sfx.powerup();
      startStoryDialogue('Treasure Chest', '🎁', [ch.text]);
      return;
    }
  }
}

function updateStoryWorldLoop() {
  const dlgOpen = !document.getElementById('story-dialogue-box').classList.contains('hidden');

  if (!dlgOpen && !storyBattleActive) {
    const speed = 5.2;
    let dx = 0, dy = 0;
    if (keysPressed['w'] || keysPressed['arrowup']) dy -= 1;
    if (keysPressed['s'] || keysPressed['arrowdown']) dy += 1;
    if (keysPressed['a'] || keysPressed['arrowleft']) dx -= 1;
    if (keysPressed['d'] || keysPressed['arrowright']) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      storyState.x = Math.max(30, Math.min(STORY_WORLD.width - 30, storyState.x + (dx / len) * speed));
      storyState.y = Math.max(30, Math.min(STORY_WORLD.height - 30, storyState.y + (dy / len) * speed));
    }

    // Update current Region HUD label
    const zone = STORY_ZONES.find(z =>
      storyState.x >= z.x && storyState.x <= z.x + z.w &&
      storyState.y >= z.y && storyState.y <= z.y + z.h
    ) || STORY_ZONES.at(0);

    const zLabel = document.getElementById('story-zone-label');
    if (zLabel) {
      zLabel.textContent = zone.name;
      zLabel.style.color = zone.border;
    }
    const sLabel = document.getElementById('story-stats-label');
    if (sLabel) {
      sLabel.textContent = `WASD/Arrows: Walk • [E/Space]: Interact • Cleared: ${storyState.defeatedEnemies.length}/${STORY_ENEMIES.length} • Karma: ${storyState.karma}`;
    }

    // Enemy Patrol & Aggro Chase AI
    for (const en of STORY_ENEMIES) {
      if (storyState.defeatedEnemies.includes(en.id)) continue;
      const dist = Math.hypot(storyState.x - en.curX, storyState.y - en.curY);
      const aggroRange = en.isBoss ? 220 : 185;

      if (dist < aggroRange) {
        const ang = Math.atan2(storyState.y - en.curY, storyState.x - en.curX);
        en.curX += Math.cos(ang) * (en.isBoss ? 2.4 : 3.4);
        en.curY += Math.sin(ang) * (en.isBoss ? 2.4 : 3.4);
        const enEl = document.getElementById(`story-en-${en.id}`);
        if (enEl) {
          enEl.style.left = `${en.curX - 24}px`;
          enEl.style.top = `${en.curY - 24}px`;
        }
      }

      if (dist < 44) {
        triggerStoryEncounter(en);
        break;
      }
    }
  }

  // Center camera on player
  const playerEl = document.getElementById('story-player');
  const camEl = document.getElementById('story-camera');
  if (playerEl && camEl) {
    playerEl.style.left = `${storyState.x - 21}px`;
    playerEl.style.top = `${storyState.y - 21}px`;
    const camX = Math.max(-(STORY_WORLD.width - window.innerWidth), Math.min(0, (window.innerWidth / 2) - storyState.x));
    const camY = Math.max(-(STORY_WORLD.height - window.innerHeight), Math.min(0, (window.innerHeight / 2) - storyState.y));
    camEl.style.transform = `translate3d(${camX}px, ${camY}px, 0)`;
  }

  storyLoopId = requestAnimationFrame(updateStoryWorldLoop);
}
// --- Brutal Undertale-Style Click-The-Monster Battle Box ---
function triggerStoryEncounter(enemy) {
  storyBattleActive = true;
  if (typeof sfx !== 'undefined') sfx.bomb();

  // Classic Undertale '!' flash before dialogue
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: fixed; inset: 0; background: ${enemy.horror ? '#ff4757' : '#fff'};
    z-index: 200; display: flex; align-items: center; justify-content: center;
    font-size: 6rem; font-weight: 900; color: #07080c;
  `;
  flash.textContent = '!';
  document.body.appendChild(flash);

  setTimeout(() => {
    flash.remove();
    startStoryDialogue(enemy.name, enemy.icon, enemy.intro, !!enemy.horror, () => {
      launchStoryBattleArena(enemy);
    });
  }, 320);
}

function launchStoryBattleArena(enemy) {
  const arena = document.createElement('div');
  arena.id = 'story-battle-arena';
  arena.style.cssText = `
    position: fixed; inset: 0; background: rgba(4, 5, 10, 0.96); z-index: 190;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 16px;
  `;

  const totalMaxHp = enemy.hp * enemy.count;
  arena.innerHTML = `
    <div style="text-align:center; margin-bottom:10px;">
      <div style="font-size:0.75rem; font-weight:900; color:${enemy.horror ? '#ff4757' : '#ffd32a'}; letter-spacing:2px;">
        ${enemy.isBoss ? '⚠️ BOSS ENCOUNTER ⚠️' : '⚔️ AMBUSH ENCOUNTER ⚔️'}
      </div>
      <h2 style="margin:2px 0 6px 0; color:#fff; font-size:1.6rem;">${enemy.icon} ${enemy.name}</h2>
      <div style="width:320px; max-width:85vw; height:14px; background:rgba(255,255,255,0.12); border-radius:8px; overflow:hidden; margin:0 auto;">
        <div id="sb-hp-fill" style="width:100%; height:100%; background:${enemy.horror ? '#ff4757' : '#2ed573'}; transition:width 0.1s;"></div>
      </div>
      <div id="sb-hp-text" style="font-size:0.78rem; font-weight:900; color:#ced6e0; margin-top:4px;">HP: ${totalMaxHp} / ${totalMaxHp}</div>
    </div>

    <!-- Undertale White-Bordered Combat Box -->
    <div id="sb-combat-box" style="
      position: relative; width: 640px; max-width: 94vw; height: 340px;
      border: 4px solid ${enemy.horror ? '#ff4757' : '#fff'}; background: #07080c;
      overflow: hidden; box-shadow: 0 0 35px ${enemy.horror ? 'rgba(255,71,87,0.35)' : 'rgba(255,255,255,0.15)'};
    "></div>

    <!-- Undertale Action Footer -->
    <div style="display:flex; gap:12px; margin-top:12px;">
      <button id="sb-spare-btn" disabled style="
        padding: 10px 22px; border: 2px solid #ffd32a; border-radius: 6px;
        background: rgba(255,211,42,0.12); color: #747d8c; font-weight: 900; font-size: 0.9rem; cursor: not-allowed;
      ">💛 SPARE (Weaken to 20% HP)</button>
      <button id="sb-flee-btn" style="
        padding: 10px 18px; border: 2px solid #a4b0be; border-radius: 6px;
        background: transparent; color: #a4b0be; font-weight: 900; font-size: 0.9rem; cursor: pointer;
      ">🏃 FLEE</button>
    </div>
  `;
  document.body.appendChild(arena);

  const box = document.getElementById('sb-combat-box');
  const boxW = box.clientWidth || 600;
  const boxH = box.clientHeight || 340;
  const fighters = [];

  for (let i = 0; i < enemy.count; i++) {
    const size = enemy.isBoss ? 88 : 54;
    const f = {
      hp: enemy.hp,
      maxHp: enemy.hp,
      x: 60 + Math.random() * (boxW - 140),
      y: 50 + Math.random() * (boxH - 120),
      vx: (Math.random() < 0.5 ? -1 : 1) * enemy.speed,
      vy: (Math.random() < 0.5 ? -1 : 1) * enemy.speed,
      size,
      el: document.createElement('div')
    };
    f.el.style.cssText = `
      position: absolute; width: ${size}px; height: ${size}px; font-size: ${enemy.isBoss ? '3.6rem' : '2.2rem'};
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      user-select: none; filter: drop-shadow(0 0 10px ${enemy.horror ? '#ff4757' : '#ffa502'});
    `;
    f.el.textContent = enemy.icon;
    f.el.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      // Scale player click damage from equipped gear & upgrades (still brutal!)
      const gearBonus = typeof getEquippedGearTotals === 'function' ? getEquippedGearTotals().bonusDmg : 0;
      const dmg = Math.max(4, 6 + Math.floor(gearBonus * 0.6));
      f.hp = Math.max(0, f.hp - dmg);

      if (typeof sfx !== 'undefined') sfx.hit();
      if (typeof spawnFloatingText === 'function') {
        spawnFloatingText(e.clientX, e.clientY - 12, `-${dmg}`, enemy.horror ? '#ff4757' : '#ffd32a');
      }

      if (f.hp === 0) {
        f.el.remove();
        const idx = fighters.indexOf(f);
        if (idx > -1) fighters.splice(idx, 1);
      }
      updateBattleStatus();
    });
    box.appendChild(f.el);
    fighters.push(f);
  }

  let battleTimer = setInterval(() => {
    // Enemy regeneration pressure in brutal mode!
    fighters.forEach(f => {
      if (enemy.isBoss && f.hp < f.maxHp) {
        f.hp = Math.min(f.maxHp, f.hp + 2);
      }
      f.x += f.vx;
      f.y += f.vy;
      if (f.x <= 8 || f.x >= boxW - f.size - 8) f.vx *= -1;
      if (f.y <= 8 || f.y >= boxH - f.size - 8) f.vy *= -1;
      f.el.style.left = `${f.x}px`;
      f.el.style.top = `${f.y}px`;
    });
    updateBattleStatus();
  }, 30);

  function cleanupArena() {
    clearInterval(battleTimer);
    arena.remove();
    storyBattleActive = false;
  }

  function updateBattleStatus() {
    const curHp = fighters.reduce((s, f) => s + f.hp, 0);
    const pct = Math.max(0, (curHp / totalMaxHp) * 100);
    const fill = document.getElementById('sb-hp-fill');
    const txt = document.getElementById('sb-hp-text');
    if (fill) fill.style.width = `${pct}%`;
    if (txt) txt.textContent = `HP: ${curHp} / ${totalMaxHp}`;

    // Enable [💛 SPARE] when weakened below 20% HP
    const spareBtn = document.getElementById('sb-spare-btn');
    if (spareBtn && pct > 0 && pct <= 20) {
      spareBtn.disabled = false;
      spareBtn.style.background = '#ffd32a';
      spareBtn.style.color = '#07080c';
      spareBtn.style.cursor = 'pointer';
      spareBtn.textContent = '💛 SPARE NOW!';
    }

    if (curHp <= 0) {
      cleanupArena();
      finishStoryEncounter(enemy, false);
    }
  }

  document.getElementById('sb-spare-btn').addEventListener('click', () => {
    cleanupArena();
    finishStoryEncounter(enemy, true);
  });

  document.getElementById('sb-flee-btn').addEventListener('click', () => {
    cleanupArena();
    storyState.x -= 90;
    startStoryDialogue('Escaped!', '🏃', ['You barely escaped with your cursor intact!']);
  });
}

function finishStoryEncounter(enemy, spared) {
  if (!storyState.defeatedEnemies.includes(enemy.id)) {
    storyState.defeatedEnemies.push(enemy.id);
  }
  storyState.karma += spared ? 1 : -1;
  saveStoryMode();

  const overworldEl = document.getElementById(`story-en-${enemy.id}`);
  if (overworldEl) overworldEl.remove();

  const coinReward = spared ? Math.round(enemy.reward * 0.65) : enemy.reward;
  if (typeof shopState !== 'undefined') {
    shopState.coins += coinReward;
    if (typeof saveShopData === 'function') saveShopData();
  }
  if (typeof sfx !== 'undefined') sfx.powerup();

  if (enemy.isFinal) {
    const endingLines = spared
      ? [
          "ENTITY 00 lowers its claws. The bleeding code around your monitor fades into golden light.",
          "'YOU... SPARED ME? AFTER EVERYTHING I THREW AT YOU?'",
          "🏆 TRUE PACIFIST ENDING UNLOCKED! Haven Village is forever free!"
        ]
      : [
          "ENTITY 00 shatters into a million dead pixels. Silence falls over The Redacted Core.",
          "'THE... GAME... IS... YOURS... NOW...'",
          `👑 CONQUEROR ENDING UNLOCKED! (+${coinReward.toLocaleString()} 🪙)`
        ];
    storyState.endingReached = spared ? 'pacifist' : 'conqueror';
    saveStoryMode();
    startStoryDialogue(enemy.name, enemy.icon, endingLines, !spared);
  } else {
    const msg = spared
      ? `You spared ${enemy.name}! (+1 Karma & +${coinReward.toLocaleString()} 🪙)`
      : `You obliterated ${enemy.name}! (-1 Karma & +${coinReward.toLocaleString()} 🪙)`;
    startStoryDialogue('Victory!', spared ? '💛' : '⚔️', [msg]);
  }
}
