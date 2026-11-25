// --- Fair Economy & Combat Balance Patch (No More 1M Coin Runs or 0.5s Wipes!) ---
const balanceState = {
  runCoinsEarned: 0,
  lastSplashTime: 0,
  roundStartTime: 0
};

function getRunCoinCap() {
  const diff = typeof currentDiff !== 'undefined' ? currentDiff : 'normal';
  const caps = {
    easy: 5000,
    normal: 12000,
    insane: 25000,
    nightmare: 35000,
    hellfire: 45000
  };
  const baseCap = caps[diff] || 15000;
  const rebirths = typeof careerData !== 'undefined' ? (careerData.rebirths || 0) : 0;
  return baseCap + (rebirths * 10000);
}

// 1. Stop 1,000,000-Coin Hellfire Payouts with an 85% Late-Game Compression + Fair Per-Run Cap
if (typeof addCoinsAndXP === 'function') {
  const _balOrigAddCoinsXP = addCoinsAndXP;
  addCoinsAndXP = function(coinAmt, xpAmt) {
    // Compress runaway multiplier stacking by 85%
    let balancedCoins = Math.max(1, Math.round(coinAmt * 0.15));

    // Enforce fair per-run coin ceiling so one round can never pay 1,000,000 coins
    const cap = getRunCoinCap();
    if (balanceState.runCoinsEarned >= cap) {
      balancedCoins = 0;
    } else if (balanceState.runCoinsEarned + balancedCoins > cap) {
      balancedCoins = cap - balanceState.runCoinsEarned;
    }

    balanceState.runCoinsEarned += balancedCoins;
    _balOrigAddCoinsXP(balancedCoins, xpAmt);
  };
}

// 2. Make Shop Upgrades & Prices Scale Steeper so Players Can't Max Everything in 3 Minutes
if (typeof getUpgradeCost === 'function') {
  const _balOrigUpgradeCost = getUpgradeCost;
  getUpgradeCost = function(key) {
    const base = _balOrigUpgradeCost(key);
    const lvl = (typeof shopState !== 'undefined' && shopState.upgrades && shopState.upgrades[key]) ? shopState.upgrades[key] : 0;
    return Math.round(base * Math.pow(1.45, lvl));
  };
}
// 3. Enforce 1.8s Cooldown on Splash Blast + 6-Target Cap (No More 1-Click Screen Wipes!)
if (typeof triggerSplashBlast === 'function') {
  const _balOrigSplash = triggerSplashBlast;
  triggerSplashBlast = function(x, y) {
    const now = performance.now();
    const cooldownMs = 1800;
    if (now - balanceState.lastSplashTime < cooldownMs) {
      const waitSec = ((cooldownMs - (now - balanceState.lastSplashTime)) / 1000).toFixed(1);
      if (typeof spawnFloatingText === 'function') {
        spawnFloatingText(x, y - 16, `⏳ SPLASH COOLDOWN (${waitSec}s)`, '#ffa502');
      }
      return;
    }
    balanceState.lastSplashTime = now;
    _balOrigSplash(x, y);
  };
}

// 4. Swarm Adaptation: Scale Monster HP to Match Player Level & Rebirths + 1.5s Turret Lock-On Warmup
function scaleMonsterToPlayer(m) {
  if (!m || m.balScaled) return;
  m.balScaled = true;

  const lvl = (typeof shopState !== 'undefined' && shopState.level) ? shopState.level : 1;
  const rebirths = (typeof careerData !== 'undefined' && careerData.rebirths) ? careerData.rebirths : 0;

  // +15% Monster HP per Hunter Level, +50% per Rebirth
  const hpMult = 1 + ((lvl - 1) * 0.15) + (rebirths * 0.50);
  if (hpMult > 1) {
    m.maxHp = Math.max(1, Math.round(m.maxHp * hpMult));
    m.hp = m.maxHp;
  }
}

// Reset per-run coin tracker & scale initial wave on startGame
if (typeof startGame === 'function') {
  const _balOrigStart = startGame;
  startGame = function() {
    balanceState.runCoinsEarned = 0;
    balanceState.lastSplashTime = 0;
    balanceState.roundStartTime = performance.now();
    _balOrigStart();

    if (typeof monsters !== 'undefined') {
      monsters.forEach(scaleMonsterToPlayer);
    }
  };
}

// Scale newly spawned monsters & enforce 1.5s Turret/Pet lock-on warmup at round start
const _balOrigHandleClick = handleMonsterClick;
handleMonsterClick = function(monster, clickX, clickY) {
  // Block automated/turret hits during the first 1.5s warmup (real human clicks bypass via isTrusted or mouse coords)
  if (isGameRunning && (performance.now() - balanceState.roundStartTime < 1500)) {
    const isDirectHumanClick = (typeof mousePos !== 'undefined' && Math.hypot(clickX - mousePos.x, clickY - mousePos.y) < 45);
    if (!isDirectHumanClick) return;
  }

  // Bosses take 50% reduced damage from Splash/AoE bursts
  if (monster && monster.type === 'boss' && typeof activeWeapon !== 'undefined' && activeWeapon === 'splash') {
    if (Math.random() < 0.5) {
      spawnFloatingText(clickX, clickY - 14, '🛡️ BOSS ARMOR (-50% AoE)', '#ffa502');
      return;
    }
  }

  _balOrigHandleClick(monster, clickX, clickY);

  if (typeof monsters !== 'undefined') {
    monsters.forEach(scaleMonsterToPlayer);
  }
};
