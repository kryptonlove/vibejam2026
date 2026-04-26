import {
  decorationUiUrl,
  heartUiUrl,
  lineUiUrl,
  logoUiUrl,
  pauseUiUrl
} from '../config/assets.js';

function ensureHeadLink(id, attributes) {
  if (document.getElementById(id)) {
    return;
  }

  const link = document.createElement('link');
  link.id = id;

  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'crossOrigin') {
      link.crossOrigin = value;
    } else {
      link.setAttribute(key, value);
    }
  }

  document.head.append(link);
}

const UI_STYLE_ID = 'three-tps-ui-style';

const UI_STYLE = `
  :root {
    color-scheme: dark;
    font-family: "Tiny5", "Courier New", monospace;
  }

  body {
    user-select: none;
    font-family: inherit;
    cursor: none;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
    cursor: none;
  }

  * {
    cursor: none !important;
  }

  .custom-cursor {
    position: fixed;
    left: 0;
    top: 0;
    width: 18px;
    height: 18px;
    z-index: 9999;
    pointer-events: none;
    background: #ffffff;
    image-rendering: pixelated;
    transform: translate(-50%, -50%);
    transform-origin: center;
    will-change: left, top, transform;
  }

  .custom-cursor.is-hidden {
    opacity: 0;
  }

  .custom-cursor.is-hovering-active {
    animation: customCursorPulse 1.9s ease-in-out infinite;
  }

  @keyframes customCursorPulse {
    0%,
    100% {
      transform: translate(-50%, -50%) scale(1);
    }

    50% {
      transform: translate(-50%, -50%) scale(1.2);
    }
  }

  .hud {
    position: fixed;
    inset: 0;
    pointer-events: none;
    color: #ecf5ff;
  }

  .hud[hidden] {
    display: none;
  }

  .hud__panel {
    position: absolute;
    top: 18px;
    left: 18px;
    display: grid;
    gap: 10px;
    min-width: 250px;
    padding: 14px 16px;
    border: 1px solid rgba(190, 224, 255, 0.18);
    border-radius: 18px;
    background:
      linear-gradient(180deg, rgba(7, 16, 24, 0.8), rgba(9, 23, 31, 0.68)),
      rgba(5, 10, 15, 0.28);
    backdrop-filter: blur(10px);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28);
  }

  .hud__stat {
    display: grid;
    gap: 5px;
  }

  .hud__label-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    font-size: 12px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .hud__value {
    color: #fff7c5;
    font-size: 18px;
    letter-spacing: 0.08em;
  }

  .hud__bar {
    position: relative;
    height: 12px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
  }

  .hud__fill {
    position: absolute;
    inset: 0 auto 0 0;
    width: 100%;
    border-radius: inherit;
    transition: width 0.12s linear;
  }

  .hud__fill--hp {
    background: linear-gradient(90deg, #ff6363, #ffc76f);
    box-shadow: 0 0 18px rgba(255, 123, 123, 0.45);
  }

  .hud__fill--ammo {
    background: linear-gradient(90deg, #55e3ff, #9bf7ff);
    box-shadow: 0 0 22px rgba(120, 250, 255, 0.4);
  }

  .hud__meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 12px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(216, 240, 255, 0.76);
  }

  .hud__meta-value {
    color: #fff7c5;
    font-size: 16px;
    letter-spacing: 0.1em;
  }

  .hud__crosshair {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 30px;
    height: 30px;
    transform: translate(-50%, -50%);
    filter: drop-shadow(0 0 8px rgba(165, 247, 255, 0.7));
  }

  .hud__crosshair::before,
  .hud__crosshair::after,
  .hud__crosshair span::before,
  .hud__crosshair span::after {
    content: "";
    position: absolute;
    background: rgba(220, 248, 255, 0.92);
    border-radius: 999px;
  }

  .hud__crosshair::before,
  .hud__crosshair::after {
    left: 50%;
    width: 2px;
    height: 9px;
    transform: translateX(-50%);
  }

  .hud__crosshair::before {
    top: 0;
  }

  .hud__crosshair::after {
    bottom: 0;
  }

  .hud__crosshair span::before,
  .hud__crosshair span::after {
    top: 50%;
    width: 9px;
    height: 2px;
    transform: translateY(-50%);
  }

  .hud__crosshair span::before {
    left: 0;
  }

  .hud__crosshair span::after {
    right: 0;
  }

  .hud__enemy-panel {
    position: absolute;
    top: 18px;
    left: 50%;
    min-width: 240px;
    transform: translateX(-50%);
  }

  .hud__enemy-panel[hidden] {
    display: none;
  }

  .hud__fill--enemy {
    background: linear-gradient(90deg, #ff8a56, #ffe18b);
    box-shadow: 0 0 22px rgba(255, 175, 103, 0.38);
  }

  .hud__message,
  .hud__loading {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    padding: 14px 18px;
    border-radius: 18px;
    background: rgba(7, 14, 20, 0.74);
    border: 1px solid rgba(181, 233, 255, 0.16);
    backdrop-filter: blur(10px);
    text-align: center;
    letter-spacing: 0.06em;
  }

  .hud__message {
    bottom: 24px;
    max-width: min(92vw, 620px);
    font-size: 13px;
    line-height: 1.5;
  }

  .hud__loading {
    top: 24px;
    font-size: 12px;
    text-transform: uppercase;
  }

  .hud__hint {
    opacity: 0.68;
  }

  .status-overlay {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    min-width: min(84vw, 380px);
    padding: 24px 22px;
    border: 3px solid #000;
    border-radius: 0;
    background: rgba(0, 0, 0, 0.82);
    color: #eef8ff;
    text-align: center;
    line-height: 1.45;
    letter-spacing: 0.06em;
    backdrop-filter: none;
    box-shadow: 0 18px 0 rgba(0, 0, 0, 0.3);
    pointer-events: none;
    z-index: 24;
  }

  .status-overlay[hidden] {
    display: none;
  }

  .status-overlay--interactive {
    pointer-events: auto;
  }

  .status-overlay__title {
    display: block;
    margin-bottom: 6px;
    font-size: 30px;
    text-transform: uppercase;
    color: #ffa900;
  }

  .status-overlay__hint {
    opacity: 0.78;
    font-size: 18px;
  }

  .status-overlay__actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 14px;
  }

  .status-overlay__button {
    min-width: 180px;
  }

  .pause-menu {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 24px;
    background:
      radial-gradient(circle at top, rgba(63, 92, 128, 0.18), transparent 42%),
      rgba(4, 8, 13, 0.76);
    backdrop-filter: blur(10px);
    z-index: 10;
  }

  .pause-menu[hidden] {
    display: none;
  }

  .pause-menu__card {
    width: min(92vw, 420px);
    max-height: min(86vh, 760px);
    overflow: auto;
    padding: 24px 22px 22px;
    border: 1px solid rgba(185, 232, 255, 0.18);
    border-radius: 24px;
    background: rgba(8, 15, 22, 0.92);
    color: #eef8ff;
    box-shadow: 0 28px 80px rgba(0, 0, 0, 0.38);
  }

  .pause-menu__eyebrow {
    display: inline-block;
    margin-bottom: 10px;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(200, 235, 255, 0.62);
  }

  .pause-menu__title {
    margin: 0 0 10px;
    font-size: 28px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .pause-menu__hint {
    margin: 0 0 18px;
    color: rgba(220, 243, 255, 0.68);
    font-size: 13px;
    line-height: 1.55;
  }

  .pause-menu__actions {
    display: grid;
    gap: 10px;
    margin-bottom: 18px;
  }

  .pause-menu__button {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid rgba(186, 231, 255, 0.16);
    border-radius: 16px;
    background: rgba(18, 30, 42, 0.84);
    color: inherit;
    font: inherit;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
  }

  .pause-menu__section-title {
    margin: 0 0 10px;
    font-size: 12px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(200, 235, 255, 0.74);
  }

  .pause-menu__scenes {
    display: grid;
    gap: 10px;
  }

  .loader-screen {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background:
      radial-gradient(circle at top, rgba(35, 62, 92, 0.22), transparent 48%),
      linear-gradient(180deg, rgba(2, 6, 10, 0.96), rgba(5, 9, 14, 0.98));
    color: #edf8ff;
    z-index: 42;
  }

  .loader-screen[hidden] {
    display: none;
  }

  .loader-screen__card {
    width: min(90vw, 420px);
    padding: 28px 26px 24px;
    border: 1px solid rgba(179, 226, 255, 0.16);
    border-radius: 24px;
    background: rgba(8, 15, 23, 0.86);
    box-shadow: 0 22px 80px rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(16px);
  }

  .loader-screen__eyebrow {
    display: inline-block;
    margin-bottom: 14px;
    font-size: 11px;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: rgba(191, 231, 255, 0.72);
  }

  .loader-screen__title {
    margin: 0 0 10px;
    font-size: 28px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .loader-screen__hint {
    margin: 0 0 18px;
    color: rgba(223, 243, 255, 0.72);
    font-size: 14px;
    line-height: 1.5;
  }

  .loader-screen__bar {
    height: 12px;
    border-radius: 999px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.08);
  }

  .loader-screen__fill {
    width: 0%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #5fd7ff, #c0f4ff);
    box-shadow: 0 0 28px rgba(130, 236, 255, 0.36);
    transition: width 0.2s ease;
  }

  .loader-screen__progress {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(207, 240, 255, 0.68);
  }

  .scene-button {
    position: fixed;
    top: 18px;
    right: 18px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border: 1px solid rgba(186, 231, 255, 0.18);
    border-radius: 999px;
    background: rgba(8, 16, 24, 0.82);
    color: #edf8ff;
    backdrop-filter: blur(12px);
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.24);
    cursor: pointer;
    z-index: 7;
  }

  .scene-button[hidden] {
    display: none;
  }

  .scene-button__key {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 999px;
    background: rgba(132, 229, 255, 0.14);
    border: 1px solid rgba(161, 233, 255, 0.14);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .scene-button__label {
    font-size: 12px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .scene-selector {
    position: fixed;
    top: 74px;
    right: 18px;
    width: min(90vw, 260px);
    padding: 16px;
    border: 1px solid rgba(186, 231, 255, 0.16);
    border-radius: 22px;
    background: rgba(7, 14, 21, 0.92);
    color: #edf8ff;
    backdrop-filter: blur(16px);
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.3);
    z-index: 8;
  }

  .scene-selector[hidden] {
    display: none;
  }

  .scene-selector__title {
    margin: 0 0 6px;
    font-size: 13px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .scene-selector__hint {
    margin: 0 0 14px;
    font-size: 12px;
    line-height: 1.45;
    color: rgba(220, 243, 255, 0.68);
  }

  .scene-selector__option {
    width: 100%;
    margin-top: 10px;
    padding: 12px 14px;
    border: 1px solid rgba(186, 231, 255, 0.14);
    border-radius: 16px;
    background: rgba(13, 22, 32, 0.8);
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .scene-selector__option:first-of-type {
    margin-top: 0;
  }

  .scene-selector__option.is-active {
    border-color: rgba(138, 226, 255, 0.42);
    background: rgba(20, 38, 54, 0.92);
    box-shadow: inset 0 0 0 1px rgba(122, 215, 255, 0.18);
  }

  .scene-selector__name {
    display: block;
    font-size: 14px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .scene-selector__meta {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(205, 238, 255, 0.58);
  }

  .start-screen {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 24px;
    background:
      radial-gradient(circle at top, rgba(75, 110, 150, 0.22), transparent 34%),
      linear-gradient(180deg, rgba(3, 7, 12, 0.82), rgba(4, 8, 12, 0.92));
    backdrop-filter: blur(14px);
    z-index: 11;
  }

  .start-screen[hidden] {
    display: none;
  }

  .start-screen__card {
    width: min(96vw, 1240px);
    max-height: min(90vh, 900px);
    overflow: auto;
    padding: 26px;
    border: 1px solid rgba(186, 231, 255, 0.18);
    border-radius: 28px;
    background:
      linear-gradient(180deg, rgba(8, 15, 22, 0.96), rgba(7, 13, 18, 0.92)),
      rgba(7, 12, 18, 0.8);
    color: #eef8ff;
    box-shadow: 0 32px 100px rgba(0, 0, 0, 0.44);
  }

  .start-screen__tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 18px;
  }

  .start-screen__tab {
    padding: 10px 14px;
    border: 1px solid rgba(186, 231, 255, 0.14);
    border-radius: 999px;
    background: rgba(12, 22, 32, 0.74);
    color: rgba(232, 245, 255, 0.78);
    cursor: pointer;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .start-screen__tab.is-active {
    border-color: rgba(122, 220, 255, 0.44);
    background: linear-gradient(90deg, rgba(24, 44, 58, 0.96), rgba(14, 29, 40, 0.92));
    color: #f5fbff;
    box-shadow: inset 0 0 0 1px rgba(122, 220, 255, 0.14);
  }

  .start-screen__eyebrow {
    display: inline-block;
    margin-bottom: 10px;
    font-size: 12px;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: rgba(199, 236, 255, 0.62);
  }

  .start-screen__title {
    margin: 0;
    font-size: clamp(36px, 5vw, 64px);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .start-screen__subtitle {
    max-width: 820px;
    margin: 10px 0 0;
    color: rgba(218, 241, 255, 0.72);
    font-size: 15px;
    line-height: 1.6;
  }

  .start-screen__summary {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 20px;
  }

  .start-screen__summary-chip {
    padding: 10px 14px;
    border: 1px solid rgba(186, 231, 255, 0.14);
    border-radius: 999px;
    background: rgba(19, 31, 43, 0.82);
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(228, 245, 255, 0.78);
  }

  .start-screen__layout {
    display: grid;
    gap: 26px;
    margin-top: 28px;
  }

  .start-screen__section-title {
    margin: 0 0 12px;
    font-size: 13px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(203, 237, 255, 0.72);
  }

  .start-screen__scene-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
  }

  .start-screen__scene-button {
    padding: 14px 16px;
    border: 1px solid rgba(186, 231, 255, 0.14);
    border-radius: 18px;
    background: rgba(13, 22, 32, 0.8);
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .start-screen__scene-button.is-active {
    border-color: rgba(122, 220, 255, 0.44);
    background: linear-gradient(180deg, rgba(18, 35, 48, 0.96), rgba(13, 24, 33, 0.92));
    box-shadow: inset 0 0 0 1px rgba(122, 220, 255, 0.16);
  }

  .start-screen__scene-name,
  .start-screen__level-name {
    display: block;
    font-size: 15px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .start-screen__scene-meta,
  .start-screen__level-meta {
    display: block;
    margin-top: 5px;
    color: rgba(211, 238, 255, 0.6);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .start-screen__level-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
  }

  .start-screen__level-card {
    display: grid;
    gap: 12px;
    padding: 14px;
    border: 1px solid rgba(186, 231, 255, 0.14);
    border-radius: 22px;
    background: rgba(11, 18, 27, 0.88);
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .start-screen__level-card.is-active {
    border-color: rgba(122, 220, 255, 0.46);
    background:
      linear-gradient(180deg, rgba(16, 30, 43, 0.98), rgba(11, 20, 28, 0.92)),
      rgba(11, 18, 27, 0.88);
    box-shadow:
      inset 0 0 0 1px rgba(122, 220, 255, 0.16),
      0 20px 34px rgba(0, 0, 0, 0.18);
  }

  .start-screen__preview {
    position: relative;
    display: grid;
    place-items: center;
    min-height: 128px;
    border-radius: 18px;
    background:
      radial-gradient(circle at 50% 24%, rgba(167, 236, 255, 0.16), transparent 54%),
      linear-gradient(180deg, rgba(18, 31, 43, 0.82), rgba(9, 16, 24, 0.96));
    overflow: hidden;
  }

  .start-screen__preview::after {
    content: "";
    position: absolute;
    left: 14px;
    right: 14px;
    bottom: 10px;
    height: 18px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(0, 0, 0, 0.32), transparent 68%);
    filter: blur(6px);
  }

  .start-screen__preview canvas {
    width: 100%;
    height: 128px;
    display: block;
  }

  .start-screen__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-top: 26px;
  }

  .start-screen__action-copy {
    color: rgba(214, 239, 255, 0.64);
    font-size: 13px;
    line-height: 1.5;
  }

  .start-screen__action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .start-screen__secondary-button,
  .start-screen__start-button {
    padding: 14px 22px;
    border: 1px solid rgba(186, 231, 255, 0.18);
    border-radius: 999px;
    color: #f3fbff;
    font: inherit;
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    cursor: pointer;
  }

  .start-screen__start-button {
    background: linear-gradient(90deg, rgba(94, 215, 255, 0.22), rgba(116, 255, 219, 0.22));
    box-shadow: 0 18px 42px rgba(0, 0, 0, 0.24);
  }

  .start-screen__secondary-button {
    background: rgba(16, 28, 38, 0.9);
    box-shadow: inset 0 0 0 1px rgba(122, 220, 255, 0.12);
  }

  .menu-scene-view-button {
    position: fixed;
    top: 18px;
    left: 18px;
    z-index: 12;
    padding: 12px 16px;
    border: 1px solid rgba(186, 231, 255, 0.18);
    border-radius: 999px;
    background: rgba(8, 16, 24, 0.84);
    color: #edf8ff;
    font: inherit;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow: 0 18px 42px rgba(0, 0, 0, 0.26);
  }

  .menu-scene-view-button[hidden] {
    display: none;
  }

  .menu-scene-hero {
    position: fixed;
    inset: 0;
    z-index: 12;
    display: grid;
    place-items: center;
    pointer-events: none;
  }

  .menu-scene-hero[hidden] {
    display: none;
  }

  .menu-scene-hero__content {
    display: grid;
    justify-items: center;
    gap: 22px;
    width: min(90vw, 520px);
    padding: 28px 24px;
    pointer-events: auto;
  }

  .menu-scene-hero__logo {
    display: block;
    width: min(78vw, 460px);
    max-width: 100%;
    height: auto;
    filter:
      drop-shadow(0 18px 36px rgba(0, 0, 0, 0.45))
      drop-shadow(0 0 24px rgba(255, 211, 111, 0.18));
  }

  .menu-scene-hero__play.ui-pixel-button {
    min-width: min(82vw, 420px);
    min-height: 64px;
    padding: 14px 34px;
    background: #ffb000;
    border: 4px solid #000;
    -webkit-clip-path: polygon(
      10px 0,
      calc(100% - 10px) 0,
      calc(100% - 10px) 10px,
      100% 10px,
      100% calc(100% - 10px),
      calc(100% - 10px) calc(100% - 10px),
      calc(100% - 10px) 100%,
      10px 100%,
      10px calc(100% - 10px),
      0 calc(100% - 10px),
      0 10px,
      10px 10px
    );
    clip-path: polygon(
      10px 0,
      calc(100% - 10px) 0,
      calc(100% - 10px) 10px,
      100% 10px,
      100% calc(100% - 10px),
      calc(100% - 10px) calc(100% - 10px),
      calc(100% - 10px) 100%,
      10px 100%,
      10px calc(100% - 10px),
      0 calc(100% - 10px),
      0 10px,
      10px 10px
    );
    font-size: 30px;
    letter-spacing: 0.1em;
    box-shadow:
      0 12px 0 rgba(0, 0, 0, 0.28),
      0 0 30px rgba(255, 186, 64, 0.18);
  }

  .menu-scene-hero__play:hover {
    filter: brightness(1.02);
  }

  .menu-scene-hero__secondary-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    width: min(82vw, 420px);
  }

  .menu-scene-hero__secondary-actions .ui-pixel-button {
    min-height: 48px;
    font-size: 19px;
  }

  .menu-scene-camera-panel {
    position: fixed;
    top: 18px;
    right: 18px;
    z-index: 12;
    display: grid;
    gap: 12px;
    min-width: min(92vw, 320px);
    padding: 14px 16px;
    border: 1px solid rgba(186, 231, 255, 0.18);
    border-radius: 18px;
    background: rgba(8, 16, 24, 0.9);
    color: #edf8ff;
    box-shadow: 0 18px 42px rgba(0, 0, 0, 0.26);
    backdrop-filter: blur(10px);
  }

  .menu-scene-camera-panel[hidden] {
    display: none;
  }

  .menu-scene-camera-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .menu-scene-camera-panel__title {
    font-size: 12px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .menu-scene-camera-panel__reset {
    padding: 8px 10px;
    border: 1px solid rgba(186, 231, 255, 0.18);
    border-radius: 999px;
    background: rgba(16, 28, 38, 0.9);
    color: inherit;
    font: inherit;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
  }

  .menu-scene-camera-panel__sections {
    display: grid;
    gap: 10px;
  }

  .menu-scene-camera-panel__section {
    display: grid;
    gap: 8px;
  }

  .menu-scene-camera-panel__label {
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(228, 242, 255, 0.7);
  }

  .menu-scene-camera-panel__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .menu-scene-camera-panel__grid--two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .menu-scene-camera-panel__field {
    display: grid;
    gap: 5px;
  }

  .menu-scene-camera-panel__field span {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(228, 242, 255, 0.66);
  }

  .menu-scene-camera-panel__field input {
    width: 100%;
    min-width: 0;
    padding: 8px 10px;
    border: 1px solid rgba(186, 231, 255, 0.16);
    border-radius: 10px;
    background: rgba(5, 10, 16, 0.9);
    color: inherit;
    box-sizing: border-box;
  }

  .menu-scene-camera-panel__hint {
    font-size: 11px;
    line-height: 1.4;
    letter-spacing: 0.08em;
    color: rgba(228, 242, 255, 0.62);
  }

  .menu-scene-camera-panel__slider-group {
    display: grid;
    gap: 8px;
  }

  .menu-scene-camera-panel__slider-row {
    display: grid;
    gap: 6px;
  }

  .menu-scene-camera-panel__slider-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(228, 242, 255, 0.66);
  }

  .menu-scene-camera-panel__slider-value {
    color: #fff0b2;
  }

  .menu-scene-camera-panel__slider {
    width: 100%;
    margin: 0;
    accent-color: #ffd26f;
  }

  .menu-storm-overlay {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 6;
    opacity: 0;
    background:
      radial-gradient(circle at 50% 18%, rgba(176, 202, 255, 0.18), transparent 34%),
      radial-gradient(circle at 24% 24%, rgba(128, 170, 255, 0.12), transparent 28%),
      linear-gradient(180deg, rgba(44, 54, 78, 0.12), rgba(10, 12, 20, 0.04));
    transition: opacity 80ms linear;
  }

  .menu-storm-overlay[hidden] {
    display: none;
  }

  .ui-pixel-button {
    --button-fill: #c7c7c7;
    position: relative;
    min-height: 42px;
    padding: 10px 18px;
    border: 3px solid #000;
    border-radius: 0;
    background: var(--button-fill);
    color: #000;
    font: inherit;
    font-size: 18px;
    line-height: 1;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    -webkit-clip-path: polygon(
      10px 0,
      calc(100% - 10px) 0,
      calc(100% - 10px) 10px,
      100% 10px,
      100% calc(100% - 10px),
      calc(100% - 10px) calc(100% - 10px),
      calc(100% - 10px) 100%,
      10px 100%,
      10px calc(100% - 10px),
      0 calc(100% - 10px),
      0 10px,
      10px 10px
    );
    clip-path: polygon(
      10px 0,
      calc(100% - 10px) 0,
      calc(100% - 10px) 10px,
      100% 10px,
      100% calc(100% - 10px),
      calc(100% - 10px) calc(100% - 10px),
      calc(100% - 10px) 100%,
      10px 100%,
      10px calc(100% - 10px),
      0 calc(100% - 10px),
      0 10px,
      10px 10px
    );
    image-rendering: pixelated;
  }

  .ui-pixel-button--orange {
    --button-fill: #ff5c00;
  }

  .ui-pixel-button--blue {
    --button-fill: #07d4ff;
  }

  .ui-pixel-button--gray {
    --button-fill: #c4c4c4;
  }

  .ui-pixel-button--yellow {
    --button-fill: #ffb000;
  }

  .screen-fade {
    position: fixed;
    inset: 0;
    z-index: 40;
    pointer-events: none;
    background: #000;
    opacity: 0;
    transition: opacity 850ms linear;
  }

  .screen-fade.is-visible {
    opacity: 1;
  }

  .cutscene-screen,
  .upgrade-screen,
  .controls-popup {
    position: fixed;
    inset: 0;
    z-index: 31;
    display: grid;
    place-items: center;
    padding: 24px;
    background: rgba(0, 0, 0, 0.86);
    color: #fff;
  }

  .cutscene-screen[hidden],
  .upgrade-screen[hidden],
  .controls-popup[hidden] {
    display: none;
  }

  .cutscene-screen {
    cursor: pointer;
  }

  .cutscene-screen__content {
    display: grid;
    grid-template-rows: auto auto minmax(180px, auto);
    justify-items: center;
    align-content: start;
    gap: 18px;
    width: min(88vw, 860px);
    min-height: min(60vh, 520px);
    padding-top: min(18vh, 160px);
    text-align: center;
  }

  .cutscene-screen__header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 12px;
    width: min(100%, 520px);
  }

  .cutscene-screen__decor {
    width: 56px;
    height: auto;
    justify-self: center;
    image-rendering: pixelated;
  }

  .cutscene-screen__decor--mirrored {
    transform: scaleX(-1);
  }

  .cutscene-screen__title {
    margin: 0;
    color: #ffa900;
    font-size: clamp(24px, 3vw, 36px);
    line-height: 1;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .cutscene-screen__line {
    display: block;
    width: min(100%, 520px);
    height: auto;
    image-rendering: pixelated;
  }

  .cutscene-screen__text {
    margin: 0;
    color: #fff;
    font-size: clamp(15px, 3vw, 35px);
    line-height: 1.15;
    min-height: calc(4 * 1.15em);
    text-transform: uppercase;
  }

  .cutscene-screen__text strong {
    font-weight: 700;
  }

  .cutscene-screen__text .cutscene-screen__text--yellow {
    color: #ffa900;
  }

  .cutscene-screen__text .cutscene-screen__text--pink {
    color: #ff5799;
  }

  .cutscene-screen__hint {
    position: fixed;
    left: 50%;
    bottom: 38px;
    transform: translateX(-50%);
    color: rgba(190, 190, 190, 0.88);
    font-size: 15px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    animation: cutsceneHintBlink 1.35s ease-in-out infinite;
  }

  @keyframes cutsceneHintBlink {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0.32;
    }
  }

  .upgrade-screen__card,
  .controls-popup__card {
    width: min(92vw, 760px);
    max-height: calc(100vh - 48px);
    overflow: auto;
    padding: 26px;
    border: 3px solid #000;
    border-radius: 0;
    background: rgba(9, 9, 9, 0.94);
    box-shadow: 0 18px 0 rgba(0, 0, 0, 0.32);
  }

  .upgrade-screen__card {
    box-sizing: border-box;
    width: min(94vw, 900px);
    padding: 28px clamp(52px, 11vw, 104px) 30px;
  }

  .upgrade-screen__header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }

  .upgrade-screen__decor {
    width: 56px;
    height: auto;
    justify-self: center;
    image-rendering: pixelated;
  }

  .upgrade-screen__decor--mirrored {
    transform: scaleX(-1);
  }

  .upgrade-screen__line {
    width: 100%;
    height: auto;
    margin: 0 0 22px;
    display: block;
    image-rendering: pixelated;
  }

  .upgrade-screen__title,
  .controls-popup__title {
    margin: 0 0 14px;
    color: #ffa900;
    font-size: 42px;
    line-height: 1;
    text-align: center;
    text-transform: uppercase;
  }

  .upgrade-screen__title {
    margin: 0;
    color: #ffa900;
    font-size: 28px;
    line-height: 1;
    letter-spacing: 0.06em;
  }

  .upgrade-screen__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22px;
    margin: 0 0 22px;
  }

  .upgrade-card {
    display: grid;
    place-items: center;
    align-content: center;
    gap: 10px;
    aspect-ratio: 1 / 1;
    min-height: 0;
    padding: 22px;
    border: 5px solid #ffffff;
    border-radius: 0;
    background: transparent;
    color: #ffffff;
    text-align: center;
    cursor: pointer;
  }

  .upgrade-card.is-selected {
    border-color: #07d4ff;
    background: transparent;
    color: #ffffff;
  }

  .upgrade-card__title {
    font-size: 28px;
    line-height: 1;
    text-transform: uppercase;
  }

  .upgrade-card__description {
    font-size: 19px;
    line-height: 1.15;
    text-transform: uppercase;
  }

  .upgrade-screen__actions {
    display: flex;
    justify-content: center;
  }

  .upgrade-screen__actions .ui-pixel-button {
    min-width: 180px;
  }

  .controls-popup__body {
    display: grid;
    gap: 14px;
    color: rgba(255, 255, 255, 0.82);
    font-size: 21px;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .controls-popup__options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .controls-popup__option {
    padding: 12px;
    border: 3px solid #000;
    background: #c4c4c4;
    color: #000;
    text-align: left;
    cursor: pointer;
    font: inherit;
    text-transform: uppercase;
  }

  .controls-popup__option.is-active {
    background: #ffa900;
  }

  .controls-popup__actions {
    display: flex;
    justify-content: center;
    margin-top: 18px;
  }

  .hud__corner {
    position: absolute;
    top: 18px;
    left: 18px;
    display: grid;
    gap: 10px;
  }

  .hud__hearts,
  .hud__ammo {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .hud__heart {
    position: relative;
    width: 22px;
    height: 22px;
  }

  .hud__heart-base,
  .hud__heart-fill {
    position: absolute;
    inset: 0;
    background-image: var(--ui-heart-image);
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    image-rendering: pixelated;
  }

  .hud__heart-base {
    opacity: 0.18;
    filter: grayscale(1) brightness(0.7);
  }

  .hud__heart-fill {
    clip-path: inset(0 0 0 0);
  }

  .hud__ammo-cell {
    position: relative;
    width: 23px;
    height: 19px;
    border: 3px solid #07d4ff;
    border-radius: 0;
    background: rgba(0, 0, 0, 0.86);
    box-sizing: border-box;
  }

  .hud__ammo-fill-segment {
    position: absolute;
    inset: 2px;
    transform-origin: left center;
    background: #07d4ff;
  }

  .hud__level {
    display: none;
  }

  .hud__enemy-panel {
    top: 22px;
    min-width: 220px;
    padding: 0;
    background: transparent;
    border: 0;
    transform: translateX(-50%);
    box-shadow: none;
  }

  .hud__enemy-card {
    padding: 10px 14px 12px;
    border: 3px solid #000;
    border-radius: 0;
    background: rgba(0, 0, 0, 0.82);
  }

  .hud__enemy-bar {
    position: relative;
    height: 14px;
    margin-top: 6px;
    border: 3px solid #000;
    background: rgba(255, 255, 255, 0.12);
  }

  .hud__fill--enemy {
    background: #ffa900;
    box-shadow: none;
  }

  .hud__pause-wrap {
    position: absolute;
    top: 16px;
    right: 18px;
    display: flex;
    align-items: center;
    gap: 10px;
    pointer-events: auto;
  }

  .hud__pause-hint {
    color: rgba(255, 255, 255, 0.72);
    font-size: 15px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .hud__fps {
    position: fixed;
    right: 18px;
    bottom: 18px;
    z-index: 9;
    pointer-events: none;
    color: rgba(255, 255, 255, 0.82);
    font-size: 18px;
    line-height: 1.2;
    letter-spacing: 0.06em;
    text-align: right;
    text-transform: uppercase;
    text-shadow: 0 2px 0 rgba(0, 0, 0, 0.5);
    white-space: pre-line;
  }

  .pause-button {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    padding: 0;
    border: 3px solid #000;
    border-radius: 0;
    background: rgba(255, 255, 255, 0.12);
    cursor: pointer;
    image-rendering: pixelated;
  }

  .pause-button__icon {
    width: 18px;
    height: 18px;
    display: block;
    image-rendering: pixelated;
  }

  .pause-menu {
    background: rgba(0, 0, 0, 0.82);
    backdrop-filter: none;
  }

  .pause-menu__card {
    width: min(92vw, 420px);
    padding: 24px 22px 18px;
    border: 0;
    border-radius: 0;
    background: rgba(0, 0, 0, 0.74);
    color: #ffffff;
    box-shadow: none;
  }

  .pause-menu__header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }

  .pause-menu__decor {
    width: 56px;
    height: auto;
    justify-self: center;
    image-rendering: pixelated;
  }

  .pause-menu__decor--mirrored {
    transform: scaleX(-1);
  }

  .pause-menu__title {
    margin: 0;
    color: #ffa900;
    font-size: 28px;
    line-height: 1;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-align: center;
  }

  .pause-menu__line {
    width: 100%;
    height: auto;
    margin: 0 0 18px;
    display: block;
    image-rendering: pixelated;
  }

  .pause-menu__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin: 0;
  }

  .pause-menu__button {
    width: 100%;
  }

  .pause-menu__button--wide {
    grid-column: 1 / -1;
  }

  .scene-button {
    top: 66px;
    right: 18px;
    border-radius: 0;
    border: 3px solid #000;
    background: rgba(0, 0, 0, 0.82);
    color: #ffffff;
    box-shadow: none;
  }

  .scene-button__key {
    border-radius: 0;
    border: 2px solid #000;
    background: #ffa900;
    color: #000;
    font-size: 14px;
  }

  .scene-selector {
    top: 118px;
    border-radius: 0;
    border: 3px solid #000;
    background: rgba(0, 0, 0, 0.92);
    box-shadow: none;
  }

  .scene-selector__option {
    border-radius: 0;
    border: 3px solid #000;
    background: #c4c4c4;
    color: #000;
    clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 8px), calc(100% - 12px) 100%, 8px 100%, 0 calc(100% - 8px), 0 10px);
  }

  .scene-selector__option.is-active {
    border-color: #000;
    background: #ffa900;
    box-shadow: none;
  }

  .scene-selector__name,
  .scene-selector__meta {
    color: inherit;
  }

  .status-overlay__button {
    border-radius: 0;
  }

  :where(
    .ui-pixel-button,
    .pause-button,
    .scene-button,
    .scene-selector__option,
    .start-screen__tab,
    .start-screen__scene-button,
    .start-screen__level-card,
    .start-screen__secondary-button,
    .start-screen__start-button,
    .menu-scene-view-button,
    .menu-scene-camera-panel__reset,
    .upgrade-card,
    .controls-popup__option
  ) {
    box-sizing: border-box;
    transition:
      width 180ms ease,
      min-width 180ms ease,
      margin-inline 180ms ease,
      padding-inline 180ms ease,
      transform 180ms ease,
      filter 180ms ease,
      background-color 180ms ease;
  }

  :where(
    .pause-menu__button,
    .scene-selector__option,
    .start-screen__scene-button,
    .start-screen__level-card,
    .menu-scene-hero__secondary-actions .ui-pixel-button,
    .upgrade-card,
    .controls-popup__option
  ) {
    width: 100%;
    justify-self: center;
  }

  .menu-scene-hero__play.ui-pixel-button {
    width: min(82vw, 420px);
  }

  :where(
    .scene-selector,
    .pause-menu__actions,
    .start-screen__scene-grid,
    .start-screen__level-grid,
    .menu-scene-hero__secondary-actions,
    .upgrade-screen__grid,
    .controls-popup__options
  ) {
    overflow: visible;
  }

  @media (hover: hover) and (pointer: fine) {
    :where(
      .pause-menu__button,
      .scene-selector__option,
      .start-screen__scene-button,
      .start-screen__level-card,
      .menu-scene-hero__secondary-actions .ui-pixel-button,
      .controls-popup__option
    ):is(:hover, :focus-visible) {
      position: relative;
      z-index: 2;
      width: 115%;
      margin-inline: -7.5%;
    }

    .upgrade-card:is(:hover, :focus-visible) {
      position: relative;
      z-index: 2;
      transform: scaleX(1.05);
    }

    .menu-scene-hero__play.ui-pixel-button:is(:hover, :focus-visible) {
      width: min(94.3vw, 483px);
    }

    :where(
      .status-overlay__button,
      .upgrade-screen__actions .ui-pixel-button,
      .controls-popup__actions .ui-pixel-button
    ):is(:hover, :focus-visible) {
      min-width: 207px;
    }

    .pause-button:is(:hover, :focus-visible) {
      width: 39px;
    }

    .scene-button:is(:hover, :focus-visible) {
      padding-inline: 21px;
    }

    .start-screen__tab:is(:hover, :focus-visible) {
      padding-inline: 21px;
    }

    .start-screen__secondary-button:is(:hover, :focus-visible),
    .start-screen__start-button:is(:hover, :focus-visible) {
      padding-inline: 33px;
    }

    .menu-scene-view-button:is(:hover, :focus-visible) {
      padding-inline: 24px;
    }

    .menu-scene-camera-panel__reset:is(:hover, :focus-visible) {
      padding-inline: 15px;
    }

  }

  @media (max-width: 720px) {
    .hud__pause-wrap {
      gap: 8px;
    }

    .hud__pause-hint {
      display: none;
    }

    .pause-menu__card {
      padding: 20px 16px 16px;
    }

    .pause-menu__decor {
      width: 44px;
    }

    .start-screen {
      padding: 16px;
    }

    .start-screen__card {
      padding: 20px 18px 18px;
    }

    .start-screen__actions {
      justify-content: stretch;
    }

    .start-screen__action-buttons {
      width: 100%;
    }

    .start-screen__secondary-button,
    .start-screen__start-button {
      width: 100%;
    }

    .menu-scene-hero__secondary-actions,
    .upgrade-screen__grid,
    .controls-popup__options {
      grid-template-columns: 1fr;
    }
  }
`;

function renderSceneOptions(playableWorldSceneEntries, defaultSceneKey, className = 'scene-selector__option') {
  return playableWorldSceneEntries
    .map(
      ([sceneKey, sceneConfig]) => `
        <button class="${className}${sceneKey === defaultSceneKey ? ' is-active' : ''}" type="button" data-scene="${sceneKey}">
          <span class="scene-selector__name">${sceneConfig.label}</span>
          <span class="scene-selector__meta">${sceneConfig.meta}</span>
        </button>
      `
    )
    .join('');
}

function renderStartScreenSceneOptions(playableWorldSceneEntries, defaultSceneKey) {
  return playableWorldSceneEntries
    .map(
      ([sceneKey, sceneConfig]) => `
        <button class="start-screen__scene-button${sceneKey === defaultSceneKey ? ' is-active' : ''}" type="button" data-start-scene="${sceneKey}">
          <span class="start-screen__scene-name">${sceneConfig.label}</span>
          <span class="start-screen__scene-meta">${sceneConfig.meta}</span>
        </button>
      `
    )
    .join('');
}

function renderStartLevelCards(enemyLevels, defaultLevelIndex) {
  return enemyLevels
    .map(
      (levelConfig, index) => `
        <button class="start-screen__level-card${index === defaultLevelIndex ? ' is-active' : ''}" type="button" data-start-level="${index}">
          <div>
            <span class="start-screen__level-name">${levelConfig.label}</span>
            <span class="start-screen__level-meta">${levelConfig.enemies?.length ?? 3} ${levelConfig.enemyPluralLabel}</span>
          </div>
          <div class="start-screen__preview" data-level-preview="${index}"></div>
        </button>
      `
    )
    .join('');
}

function renderHeartSlots(count) {
  return Array.from({ length: count }, () => `
    <span class="hud__heart" aria-hidden="true">
      <span class="hud__heart-base"></span>
      <span class="hud__heart-fill" data-heart-fill></span>
    </span>
  `).join('');
}

function renderAmmoSlots(count) {
  return Array.from({ length: count }, () => `
    <span class="hud__ammo-cell" aria-hidden="true">
      <span class="hud__ammo-fill-segment" data-ammo-segment></span>
    </span>
  `).join('');
}

function ensureUiStyle() {
  if (document.getElementById(UI_STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = UI_STYLE_ID;
  style.textContent = UI_STYLE;
  document.head.append(style);
}

export function createUi({
  worldScenes,
  playableWorldSceneEntries,
  enemyLevels,
  defaultSceneKey,
  defaultLevelIndex
}) {
  document.body.style.margin = '0';
  document.body.style.overflow = 'hidden';
  document.body.style.background = '#0a1014';

  ensureHeadLink('font-preconnect-googleapis', {
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com'
  });

  ensureHeadLink('font-preconnect-gstatic', {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous'
  });

  ensureHeadLink('font-tiny5', {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Tiny5&display=swap'
  });

  ensureUiStyle();
  document.documentElement.style.setProperty('--ui-heart-image', `url("${heartUiUrl}")`);

  const hud = document.createElement('div');
  hud.className = 'hud';
  hud.innerHTML = `
    <div class="hud__corner">
      <div class="hud__hearts">
        ${renderHeartSlots(10)}
      </div>
      <div class="hud__ammo">
        ${renderAmmoSlots(10)}
      </div>
      <strong class="hud__level" data-level-value>1 / 6</strong>
    </div>
    <div class="hud__enemy-panel" data-enemy-hud hidden>
      <div class="hud__enemy-card">
        <div class="hud__label-row">
          <span data-enemy-label>Spiked Ball</span>
          <strong class="hud__value" data-enemy-value>100%</strong>
        </div>
        <div class="hud__enemy-bar">
          <div class="hud__fill hud__fill--enemy" data-enemy-fill></div>
        </div>
      </div>
    </div>
    <div class="hud__pause-wrap" data-pause-control>
      <span class="hud__pause-hint">PRESS 'P' TO PAUSE GAME</span>
      <button class="pause-button" type="button" data-pause-button>
        <img class="pause-button__icon" src="${pauseUiUrl}" alt="Pause" />
      </button>
    </div>
    <div class="hud__crosshair"><span></span></div>
    <div class="hud__loading" data-loading>Loading collision world, player rig, and weapon...</div>
    <div class="hud__message" data-message>
      Click to lock the cursor.<br />
      <span class="hud__hint">WASD move, Shift sprint, Space jump, hold Alt to orbit, hold left click to fire energy rounds, press P for pause.</span>
    </div>
  `;
  document.body.append(hud);

  const fpsEl = document.createElement('div');
  fpsEl.className = 'hud__fps';
  fpsEl.dataset.fps = '';
  fpsEl.textContent = 'FPS 60\nCAM X 0.00 Y 0.00 Z 0.00';
  document.body.append(fpsEl);

  const statusOverlay = document.createElement('div');
  statusOverlay.className = 'status-overlay';
  statusOverlay.hidden = true;
  document.body.append(statusOverlay);

  const sceneToggleButton = document.createElement('button');
  sceneToggleButton.className = 'scene-button';
  sceneToggleButton.type = 'button';
  sceneToggleButton.hidden = true;
  sceneToggleButton.innerHTML = `
    <span class="scene-button__key">S</span>
    <span class="scene-button__label">Scene: ${worldScenes[defaultSceneKey].label}</span>
  `;
  document.body.append(sceneToggleButton);

  const sceneSelector = document.createElement('div');
  sceneSelector.className = 'scene-selector';
  sceneSelector.hidden = true;
  sceneSelector.innerHTML = `
    <h2 class="scene-selector__title">Scene Selector</h2>
    <p class="scene-selector__hint">Switch between the available maps.</p>
    ${renderSceneOptions(playableWorldSceneEntries, defaultSceneKey)}
  `;
  document.body.append(sceneSelector);

  const pauseMenu = document.createElement('div');
  pauseMenu.className = 'pause-menu';
  pauseMenu.hidden = true;
  pauseMenu.innerHTML = `
    <div class="pause-menu__card">
      <div class="pause-menu__header">
        <img class="pause-menu__decor" src="${decorationUiUrl}" alt="" />
        <h2 class="pause-menu__title">Pause</h2>
        <img class="pause-menu__decor pause-menu__decor--mirrored" src="${decorationUiUrl}" alt="" />
      </div>
      <img class="pause-menu__line" src="${lineUiUrl}" alt="" />
      <div class="pause-menu__actions">
        <button class="ui-pixel-button ui-pixel-button--orange pause-menu__button" type="button" data-pause-action="restart">Restart Level</button>
        <button class="ui-pixel-button ui-pixel-button--blue pause-menu__button" type="button" data-pause-action="home">Home</button>
        <button class="ui-pixel-button ui-pixel-button--gray pause-menu__button pause-menu__button--wide" type="button" data-pause-action="resume">Resume</button>
      </div>
    </div>
  `;
  document.body.append(pauseMenu);

  const loaderScreen = document.createElement('div');
  loaderScreen.className = 'loader-screen';
  loaderScreen.innerHTML = `
    <div class="loader-screen__card">
      <span class="loader-screen__eyebrow">Browser Demo</span>
      <h1 class="loader-screen__title" data-loader-title>Loading Assets</h1>
      <p class="loader-screen__hint" data-loader-hint>Preparing scenes, character, weapon, and textures.</p>
      <div class="loader-screen__bar">
        <div class="loader-screen__fill" data-loader-fill></div>
      </div>
      <div class="loader-screen__progress">
        <span data-loader-progress>0 / 0</span>
        <span data-loader-percent>0%</span>
      </div>
    </div>
  `;
  document.body.append(loaderScreen);

  const startScreen = document.createElement('div');
  startScreen.className = 'start-screen';
  startScreen.hidden = true;
  startScreen.innerHTML = `
    <div class="start-screen__card">
      <div class="start-screen__tabs">
        <button class="start-screen__tab is-active" type="button" data-start-tab="campaign">Run Setup</button>
        <button class="start-screen__tab" type="button" data-start-tab="menu">Menu Scene 2</button>
      </div>
      <span class="start-screen__eyebrow">Campaign</span>
      <h1 class="start-screen__title">Enemy Rush</h1>
      <p class="start-screen__subtitle">
        Choose the arena, pick the starting level, and preview every enemy wave before the run begins.
      </p>
      <div class="start-screen__summary">
        <span class="start-screen__summary-chip" data-start-summary-level>Level 1</span>
        <span class="start-screen__summary-chip" data-start-summary-scene>${worldScenes[defaultSceneKey].label}</span>
        <span class="start-screen__summary-chip" data-start-summary-preview>Preview · ${worldScenes[defaultSceneKey].label}</span>
      </div>
      <div class="start-screen__layout">
        <section>
          <h2 class="start-screen__section-title">Scene Select</h2>
          <div class="start-screen__scene-grid">
            ${renderStartScreenSceneOptions(playableWorldSceneEntries, defaultSceneKey)}
          </div>
        </section>
        <section>
          <h2 class="start-screen__section-title">Level Select</h2>
          <div class="start-screen__level-grid">
            ${renderStartLevelCards(enemyLevels, defaultLevelIndex)}
          </div>
        </section>
      </div>
      <div class="start-screen__actions">
        <p class="start-screen__action-copy">
          Start directly on the selected wave. The next button advances through the remaining enemy types in the same arena.
        </p>
        <div class="start-screen__action-buttons">
          <button class="start-screen__secondary-button" type="button" data-start-action="show-menu-scene-two">View Menu Scene 2</button>
          <button class="start-screen__start-button" type="button" data-start-action="start">Start Run</button>
        </div>
      </div>
    </div>
  `;
  document.body.append(startScreen);

  const menuSceneViewButton = document.createElement('button');
  menuSceneViewButton.className = 'menu-scene-view-button';
  menuSceneViewButton.type = 'button';
  menuSceneViewButton.hidden = true;
  menuSceneViewButton.textContent = 'Back to Start';
  document.body.append(menuSceneViewButton);

  const menuSceneHero = document.createElement('div');
  menuSceneHero.className = 'menu-scene-hero';
  menuSceneHero.hidden = true;
  menuSceneHero.innerHTML = `
    <div class="menu-scene-hero__content">
      <img class="menu-scene-hero__logo" src="${logoUiUrl}" alt="Enemy Rush" />
      <button class="menu-scene-hero__play ui-pixel-button ui-pixel-button--yellow" type="button" data-menu-scene-play>Play</button>
      <div class="menu-scene-hero__secondary-actions">
        <button class="ui-pixel-button ui-pixel-button--blue" type="button" data-menu-scene-controls>Controls</button>
        <button class="ui-pixel-button ui-pixel-button--gray" type="button" data-audio-toggle>Music/SFX Off</button>
      </div>
    </div>
  `;
  document.body.append(menuSceneHero);

  const screenFade = document.createElement('div');
  screenFade.className = 'screen-fade';
  document.body.append(screenFade);

  const customCursor = document.createElement('div');
  customCursor.className = 'custom-cursor is-hidden';
  document.body.append(customCursor);

  const cutsceneScreen = document.createElement('div');
  cutsceneScreen.className = 'cutscene-screen';
  cutsceneScreen.hidden = true;
  cutsceneScreen.innerHTML = `
    <div class="cutscene-screen__content">
      <div class="cutscene-screen__header">
        <img class="cutscene-screen__decor" src="${decorationUiUrl}" alt="" />
        <h2 class="cutscene-screen__title" data-cutscene-title>Chapter 1</h2>
        <img class="cutscene-screen__decor cutscene-screen__decor--mirrored" src="${decorationUiUrl}" alt="" />
      </div>
      <img class="cutscene-screen__line" src="${lineUiUrl}" alt="" />
      <p class="cutscene-screen__text" data-cutscene-text></p>
      <span class="cutscene-screen__hint">Click to continue</span>
    </div>
  `;
  document.body.append(cutsceneScreen);

  const upgradeScreen = document.createElement('div');
  upgradeScreen.className = 'upgrade-screen';
  upgradeScreen.hidden = true;
  upgradeScreen.innerHTML = `
    <div class="upgrade-screen__card">
      <div class="upgrade-screen__header">
        <img class="upgrade-screen__decor" src="${decorationUiUrl}" alt="" />
        <h2 class="upgrade-screen__title">Choose Upgrade</h2>
        <img class="upgrade-screen__decor upgrade-screen__decor--mirrored" src="${decorationUiUrl}" alt="" />
      </div>
      <img class="upgrade-screen__line" src="${lineUiUrl}" alt="" />
      <div class="upgrade-screen__grid" data-upgrade-grid></div>
      <div class="upgrade-screen__actions">
        <button class="ui-pixel-button ui-pixel-button--yellow" type="button" data-upgrade-continue>Continue</button>
      </div>
    </div>
  `;
  document.body.append(upgradeScreen);

  const controlsPopup = document.createElement('div');
  controlsPopup.className = 'controls-popup';
  controlsPopup.hidden = true;
  controlsPopup.innerHTML = `
    <div class="controls-popup__card">
      <h2 class="controls-popup__title">Controls</h2>
      <div class="controls-popup__body">
        <div data-controls-summary></div>
        <div class="controls-popup__options" data-controls-levels></div>
        <div class="controls-popup__options" data-controls-scenes></div>
        <div>
          WASD move · Shift run · Space jump · Mouse aim · Left click shoot · E shockwave · P pause
        </div>
      </div>
      <div class="controls-popup__actions">
        <button class="ui-pixel-button ui-pixel-button--yellow" type="button" data-controls-close>Close</button>
      </div>
    </div>
  `;
  document.body.append(controlsPopup);

  const menuSceneCameraPanel = document.createElement('div');
  menuSceneCameraPanel.className = 'menu-scene-camera-panel';
  menuSceneCameraPanel.hidden = true;
  menuSceneCameraPanel.innerHTML = `
    <div class="menu-scene-camera-panel__header">
      <strong class="menu-scene-camera-panel__title">Scene Controls</strong>
      <button class="menu-scene-camera-panel__reset" type="button" data-camera-reset>Reset</button>
    </div>
    <div class="menu-scene-camera-panel__sections">
      <section class="menu-scene-camera-panel__section">
        <span class="menu-scene-camera-panel__label">Position</span>
        <div class="menu-scene-camera-panel__grid">
          <label class="menu-scene-camera-panel__field">
            <span>X</span>
            <input type="number" step="0.1" data-camera-position="x" />
          </label>
          <label class="menu-scene-camera-panel__field">
            <span>Y</span>
            <input type="number" step="0.1" data-camera-position="y" />
          </label>
          <label class="menu-scene-camera-panel__field">
            <span>Z</span>
            <input type="number" step="0.1" data-camera-position="z" />
          </label>
        </div>
      </section>
      <section class="menu-scene-camera-panel__section" data-player-controls hidden>
        <span class="menu-scene-camera-panel__label">Player Position</span>
        <div class="menu-scene-camera-panel__grid">
          <label class="menu-scene-camera-panel__field">
            <span>X</span>
            <input type="number" step="0.1" data-player-position="x" />
          </label>
          <label class="menu-scene-camera-panel__field">
            <span>Y</span>
            <input type="number" step="0.1" data-player-position="y" />
          </label>
          <label class="menu-scene-camera-panel__field">
            <span>Z</span>
            <input type="number" step="0.1" data-player-position="z" />
          </label>
        </div>
      </section>
      <section class="menu-scene-camera-panel__section" data-player-controls hidden>
        <span class="menu-scene-camera-panel__label">Player Rotation / Scale</span>
        <div class="menu-scene-camera-panel__grid menu-scene-camera-panel__grid--two">
          <label class="menu-scene-camera-panel__field">
            <span>Yaw (deg)</span>
            <input type="number" step="1" data-player-rotation="y" />
          </label>
          <label class="menu-scene-camera-panel__field">
            <span>Scale</span>
            <input type="number" min="0.1" step="0.05" data-player-scale />
          </label>
        </div>
      </section>
      <section class="menu-scene-camera-panel__section" data-light-controls hidden>
        <span class="menu-scene-camera-panel__label">Top Light Position</span>
        <div class="menu-scene-camera-panel__slider-group">
          <label class="menu-scene-camera-panel__slider-row">
            <span class="menu-scene-camera-panel__slider-label">
              <span>X</span>
              <strong class="menu-scene-camera-panel__slider-value" data-light-output="position-x">0</strong>
            </span>
            <input class="menu-scene-camera-panel__slider" type="range" min="-30" max="30" step="0.1" data-light-position="x" />
          </label>
          <label class="menu-scene-camera-panel__slider-row">
            <span class="menu-scene-camera-panel__slider-label">
              <span>Y</span>
              <strong class="menu-scene-camera-panel__slider-value" data-light-output="position-y">0</strong>
            </span>
            <input class="menu-scene-camera-panel__slider" type="range" min="-10" max="30" step="0.1" data-light-position="y" />
          </label>
          <label class="menu-scene-camera-panel__slider-row">
            <span class="menu-scene-camera-panel__slider-label">
              <span>Z</span>
              <strong class="menu-scene-camera-panel__slider-value" data-light-output="position-z">0</strong>
            </span>
            <input class="menu-scene-camera-panel__slider" type="range" min="-30" max="30" step="0.1" data-light-position="z" />
          </label>
        </div>
      </section>
      <section class="menu-scene-camera-panel__section" data-light-controls hidden>
        <span class="menu-scene-camera-panel__label">Light Target</span>
        <div class="menu-scene-camera-panel__slider-group">
          <label class="menu-scene-camera-panel__slider-row">
            <span class="menu-scene-camera-panel__slider-label">
              <span>X</span>
              <strong class="menu-scene-camera-panel__slider-value" data-light-output="target-x">0</strong>
            </span>
            <input class="menu-scene-camera-panel__slider" type="range" min="-20" max="20" step="0.1" data-light-target="x" />
          </label>
          <label class="menu-scene-camera-panel__slider-row">
            <span class="menu-scene-camera-panel__slider-label">
              <span>Y</span>
              <strong class="menu-scene-camera-panel__slider-value" data-light-output="target-y">0</strong>
            </span>
            <input class="menu-scene-camera-panel__slider" type="range" min="-10" max="20" step="0.1" data-light-target="y" />
          </label>
          <label class="menu-scene-camera-panel__slider-row">
            <span class="menu-scene-camera-panel__slider-label">
              <span>Z</span>
              <strong class="menu-scene-camera-panel__slider-value" data-light-output="target-z">0</strong>
            </span>
            <input class="menu-scene-camera-panel__slider" type="range" min="-20" max="20" step="0.1" data-light-target="z" />
          </label>
        </div>
      </section>
      <section class="menu-scene-camera-panel__section" data-light-controls hidden>
        <span class="menu-scene-camera-panel__label">Light Intensity</span>
        <div class="menu-scene-camera-panel__slider-group">
          <label class="menu-scene-camera-panel__slider-row">
            <span class="menu-scene-camera-panel__slider-label">
              <span>Power</span>
              <strong class="menu-scene-camera-panel__slider-value" data-light-output="intensity">0</strong>
            </span>
            <input class="menu-scene-camera-panel__slider" type="range" min="0" max="6" step="0.05" data-light-intensity />
          </label>
        </div>
      </section>
    </div>
    <div class="menu-scene-camera-panel__hint">Edit the live menu-view camera, player, and warm top light. Reset restores the saved scene view.</div>
  `;
  document.body.append(menuSceneCameraPanel);

  const menuStormOverlay = document.createElement('div');
  menuStormOverlay.className = 'menu-storm-overlay';
  menuStormOverlay.hidden = true;
  document.body.append(menuStormOverlay);

  const refs = {
    hud,
    statusOverlay,
    sceneToggleButton,
    sceneSelector,
    pauseMenu,
    pauseControlEl: hud.querySelector('[data-pause-control]'),
    pauseButton: hud.querySelector('[data-pause-button]'),
    fpsEl,
    loaderScreen,
    startScreen,
    menuSceneViewButton,
    menuSceneHero,
    menuSceneHeroPlayButton: menuSceneHero.querySelector('[data-menu-scene-play]'),
    menuSceneControlsButton: menuSceneHero.querySelector('[data-menu-scene-controls]'),
    audioToggleButton: menuSceneHero.querySelector('[data-audio-toggle]'),
    screenFade,
    customCursor,
    cutsceneScreen,
    cutsceneTitleEl: cutsceneScreen.querySelector('[data-cutscene-title]'),
    cutsceneTextEl: cutsceneScreen.querySelector('[data-cutscene-text]'),
    upgradeScreen,
    upgradeGridEl: upgradeScreen.querySelector('[data-upgrade-grid]'),
    upgradeContinueButton: upgradeScreen.querySelector('[data-upgrade-continue]'),
    controlsPopup,
    controlsSummaryEl: controlsPopup.querySelector('[data-controls-summary]'),
    controlsLevelsEl: controlsPopup.querySelector('[data-controls-levels]'),
    controlsScenesEl: controlsPopup.querySelector('[data-controls-scenes]'),
    controlsCloseButton: controlsPopup.querySelector('[data-controls-close]'),
    menuSceneCameraPanel,
    menuSceneCameraResetButton: menuSceneCameraPanel.querySelector('[data-camera-reset]'),
    menuSceneCameraPositionInputs: {
      x: menuSceneCameraPanel.querySelector('[data-camera-position="x"]'),
      y: menuSceneCameraPanel.querySelector('[data-camera-position="y"]'),
      z: menuSceneCameraPanel.querySelector('[data-camera-position="z"]')
    },
    menuScenePlayerControlSections: Array.from(menuSceneCameraPanel.querySelectorAll('[data-player-controls]')),
    menuScenePlayerPositionInputs: {
      x: menuSceneCameraPanel.querySelector('[data-player-position="x"]'),
      y: menuSceneCameraPanel.querySelector('[data-player-position="y"]'),
      z: menuSceneCameraPanel.querySelector('[data-player-position="z"]')
    },
    menuScenePlayerRotationInput: menuSceneCameraPanel.querySelector('[data-player-rotation="y"]'),
    menuScenePlayerScaleInput: menuSceneCameraPanel.querySelector('[data-player-scale]'),
    menuSceneLightControlSections: Array.from(menuSceneCameraPanel.querySelectorAll('[data-light-controls]')),
    menuSceneLightPositionInputs: {
      x: menuSceneCameraPanel.querySelector('[data-light-position="x"]'),
      y: menuSceneCameraPanel.querySelector('[data-light-position="y"]'),
      z: menuSceneCameraPanel.querySelector('[data-light-position="z"]')
    },
    menuSceneLightTargetInputs: {
      x: menuSceneCameraPanel.querySelector('[data-light-target="x"]'),
      y: menuSceneCameraPanel.querySelector('[data-light-target="y"]'),
      z: menuSceneCameraPanel.querySelector('[data-light-target="z"]')
    },
    menuSceneLightIntensityInput: menuSceneCameraPanel.querySelector('[data-light-intensity]'),
    menuSceneLightOutputs: {
      position: {
        x: menuSceneCameraPanel.querySelector('[data-light-output="position-x"]'),
        y: menuSceneCameraPanel.querySelector('[data-light-output="position-y"]'),
        z: menuSceneCameraPanel.querySelector('[data-light-output="position-z"]')
      },
      target: {
        x: menuSceneCameraPanel.querySelector('[data-light-output="target-x"]'),
        y: menuSceneCameraPanel.querySelector('[data-light-output="target-y"]'),
        z: menuSceneCameraPanel.querySelector('[data-light-output="target-z"]')
      },
      intensity: menuSceneCameraPanel.querySelector('[data-light-output="intensity"]')
    },
    menuStormOverlay,
    heartFillEls: Array.from(hud.querySelectorAll('[data-heart-fill]')),
    ammoSegmentEls: Array.from(hud.querySelectorAll('[data-ammo-segment]')),
    levelValueEl: hud.querySelector('[data-level-value]'),
    enemyHudEl: hud.querySelector('[data-enemy-hud]'),
    enemyLabelEl: hud.querySelector('[data-enemy-label]'),
    enemyValueEl: hud.querySelector('[data-enemy-value]'),
    enemyFillEl: hud.querySelector('[data-enemy-fill]'),
    loadingEl: hud.querySelector('[data-loading]'),
    messageEl: hud.querySelector('[data-message]'),
    loaderTitleEl: loaderScreen.querySelector('[data-loader-title]'),
    loaderHintEl: loaderScreen.querySelector('[data-loader-hint]'),
    loaderFillEl: loaderScreen.querySelector('[data-loader-fill]'),
    loaderProgressEl: loaderScreen.querySelector('[data-loader-progress]'),
    loaderPercentEl: loaderScreen.querySelector('[data-loader-percent]'),
    startSummaryLevelEl: startScreen.querySelector('[data-start-summary-level]'),
    startSummarySceneEl: startScreen.querySelector('[data-start-summary-scene]'),
    startSummaryPreviewEl: startScreen.querySelector('[data-start-summary-preview]'),
    startTabButtons: Array.from(startScreen.querySelectorAll('[data-start-tab]')),
    startSceneButtons: Array.from(startScreen.querySelectorAll('[data-start-scene]')),
    startLevelButtons: Array.from(startScreen.querySelectorAll('[data-start-level]')),
    startPreviewHosts: Array.from(startScreen.querySelectorAll('[data-level-preview]')),
    startMenuSceneButton: startScreen.querySelector('[data-start-action="show-menu-scene-two"]'),
    startRunButton: startScreen.querySelector('[data-start-action="start"]')
  };

  refs.messageEl.hidden = true;
  return refs;
}
