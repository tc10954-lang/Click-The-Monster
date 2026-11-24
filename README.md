# 👾 Click The Monster — Ultimate Arcade Edition

### 🚀 **[▶ Launch & Play Live in Your Browser!](https://tc10954-lang.github.io/Click-The-Monster/)**

A fast-paced, modular arcade action game built entirely with vanilla HTML, CSS, and JavaScript—featuring custom SVG monsters, a procedural Web Audio chiptune soundtrack, boss battles, an upgrade armory, an AI rival leaderboard, and an optional Prestige/Rebirth system.

---

## ✨ Game Features

### ⚔️ Two Game Modes & 5 Difficulty Tiers
* **Standard Hunt:** Clear the swarm and defeat the **Overlord Boss** (who cloaks invisible and summons minions!) across **5 difficulties**:
  * `Easy` • `Normal` • `Insane` • `💀 Nightmare` • `🔥 Hellfire`
* **🌊 Endless Wave Rush:** Survive escalating waves and mini-bosses every 13 seconds before the arena hits 45 monsters.

### 🔫 Weapon Arsenal (`1`, `2`, `3`)
* **`1` Blaster:** Classic precision single-shot clicks.
* **`2` 🔥 Rapid Laser:** Hold click (or drag in Touch Mode) to fire a continuous energy beam.
* **`3` 💥 Splash Blast:** Area-of-effect shockwave explosion that hits groups at once.

### 💰 Loot Goblins & Power-Up Orbs
* **Golden & Diamond Loot Goblins:** Catch sprinting goblins to shave **`-2.0s` to `-4.0s`** off your timer and earn bonus Energy (`⚡`) and Coins (`🪙`).
* **❄️ Freeze & 💣 Bomb Orbs:** Grab dropped power-ups mid-round to freeze the entire swarm or trigger a chain explosion.

### 🛒 Armory Shop, Prestige & Custom Crosshairs
* **Permanent Upgrades:** Spend **Coins (`🪙`)** on **Click Power**, **Battery Core**, **Mega Splash**, and **Auto-Zapping Laser Drones**.
* **🎯 Crosshair Armory:** Unlock and equip custom glowing reticles (`Sniper Dot`, `Plasma Ring`, `Inferno Sight`, and `Royal Gold`).
* **👑 Optional Rebirth System:** Once you reach **Hunter Level 10**, optionally Rebirth for a permanent **`+50%` Coin & XP multiplier** per tier and unlock the animated **🌈 RGB Prestige Crosshair**.

### 🏅 Top 10 Arcade Board, Trophies & Career Stats
* **AI Rival Leaderboard:** Climb past 8 AI Rivals on every difficulty and stamp your **3-letter initials** onto the Top 10 board with live Rank-Up banners.
* **🏆 Trophy Room:** 8 unlockable achievements with non-blocking mid-round toast notifications and coin rewards.
* **📊 Career Stats:** Tracks lifetime kills, bosses defeated, career accuracy, highest Endless wave, and personal best clear times.

### 🎨 Themes, Mobile Mode & Chiptune Synth
* **Visual Themes:** Switch between **🕹️ Arcade Neon**, **🪦 Graveyard**, and **🚀 Deep Space**.
* **📱 Mobile Touch Mode:** Toggle zero-delay multi-touch controls and enlarged hitboxes directly from the top-right HUD.
* **🎵 Built-In Web Audio Synth:** Procedural sound effects and a multi-track chiptune soundtrack that shifts into a fast Boss Battle theme—zero external audio files needed.

---

## 🕹️ Controls

| Action | Control |
| :--- | :--- |
| **Shoot / Collect** | `Left Click` (or `Tap` in Mobile Touch Mode) |
| **Switch Weapons** | `1` (Blaster) • `2` (Rapid Laser) • `3` (Splash Blast) |
| **Pause / Resume** | `ESC` Key or `⏸️` HUD Button |

---

## 📂 Project Structure

```text
├── index.html         # Main layout, HUD, and overlays
├── style.css          # Core arcade styling and animations
├── audio.js           # Procedural Web Audio synthesizer & chiptune music
├── game.js            # Core physics loop, monster SVGs, and boss logic
├── abilities.js       # Weapon arsenal (Laser & Splash) and boss abilities
├── goblins.js         # Golden and Diamond Loot Goblin spawner
├── mobile.js          # Multi-touch toggle mode for phones and tablets
├── themes.js          # Neon, Graveyard, and Deep Space theme switcher
├── difficulties.js    # Nightmare and Hellfire extreme difficulty tiers
├── shop.js            # Coins, XP leveling, Armory Shop, and Laser Drones
├── achievements.js    # Trophy Room and mid-round achievement banners
├── modes.js           # Pause menu, Endless Wave Rush, and Crosshair Armory
├── career.js          # Lifetime stats dashboard and optional Rebirth system
├── fullscreen.js      # Compact menu layout, full-screen toggle, and scroll hint
└── leaderboard.js     # Top 10 arcade leaderboard with AI Rivals & rank banners
```

---
