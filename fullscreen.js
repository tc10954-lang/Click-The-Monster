// --- Compact Menu Layout & Full-Screen Toggle ---
window.addEventListener('DOMContentLoaded', () => {
  // 1. Tighten Start & Victory card spacing and arrange extra menu buttons into a clean 2-column grid
  const style = document.createElement('style');
  style.textContent = `
    #start-screen .card, #victory-screen .card {
      padding: 20px 26px !important;
      max-width: 560px !important;
      max-height: 94vh;
      overflow-y: auto;
    }
    #start-screen h2, #victory-screen h2 {
      font-size: 1.85rem !important;
      margin-bottom: 4px !important;
    }
    #start-screen .subtitle {
      font-size: 0.88rem !important;
      margin-bottom: 12px !important;
    }
    #start-screen .difficulty-group {
      margin-bottom: 10px !important;
      gap: 6px !important;
    }
    #start-screen .diff-btn {
      padding: 8px 6px !important;
      font-size: 0.85rem !important;
    }
    #start-screen .legend {
      padding: 8px 12px !important;
      margin-bottom: 12px !important;
      font-size: 0.8rem !important;
    }
    #start-screen .action-btn, #victory-screen .action-btn {
      padding: 11px 12px !important;
      font-size: 0.98rem !important;
    }
    #menu-extras-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 10px;
    }
    #menu-extras-grid .action-btn {
      margin-top: 0 !important;
      font-size: 0.88rem !important;
      padding: 10px 8px !important;
    }
    #fullscreen-banner-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: rgba(0, 210, 211, 0.14);
      border: 1px solid rgba(0, 210, 211, 0.45);
      color: #00d2d3;
      font-size: 0.8rem;
      font-weight: 800;
      padding: 5px 14px;
      border-radius: 50px;
      cursor: pointer;
      margin-bottom: 10px;
      transition: all 0.2s ease;
    }
    #fullscreen-banner-btn:hover {
      background: rgba(0, 210, 211, 0.28);
      transform: scale(1.03);
    }
  `;
  document.head.appendChild(style);

  // 2. Add the "⛶ Go On Full-Screen!" pill button at the top of the Start Menu
  const startCard = document.querySelector('#start-screen .card');
  if (startCard) {
    const fsBtn = document.createElement('button');
    fsBtn.id = 'fullscreen-banner-btn';
    fsBtn.innerHTML = '⛶ Go On Full-Screen!';

    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    document.addEventListener('fullscreenchange', () => {
      if (document.fullscreenElement) {
        fsBtn.innerHTML = '🗗 Exit Full-Screen';
        fsBtn.style.borderColor = '#2ed573';
        fsBtn.style.color = '#2ed573';
      } else {
        fsBtn.innerHTML = '⛶ Go On Full-Screen!';
        fsBtn.style.borderColor = 'rgba(0, 210, 211, 0.45)';
        fsBtn.style.color = '#00d2d3';
      }
    });

    startCard.insertBefore(fsBtn, startCard.firstChild);

    // 3. Group the extra menu buttons (Shop, Trophies, Crosshairs, Career) into a neat 2x2 grid
    setTimeout(() => {
      const extraBtns = Array.from(startCard.querySelectorAll('.action-btn'))
        .filter(b => b.id !== 'start-btn' && b.id !== 'endless-start-btn');

      if (extraBtns.length > 0) {
        const grid = document.createElement('div');
        grid.id = 'menu-extras-grid';
        extraBtns.forEach(btn => grid.appendChild(btn));
        startCard.appendChild(grid);
      }
    }, 50);
  }
});
