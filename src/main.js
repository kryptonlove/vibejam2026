import * as THREE from 'three';
import { Octree } from 'three/addons/math/Octree.js';
import { Capsule } from 'three/addons/math/Capsule.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import {
  blockMossXsUrl,
  bricksSideTextureUrl,
  bricksTopTextureUrl,
  decorationUiUrl,
  enemyExplosionSfxUrl,
  enemyHitSfxUrl,
  gateUrl,
  groundMossMdUrl,
  groundMossXsUrl,
  heartUiUrl,
  lineUiUrl,
  logoUiUrl,
  menuMusicUrl,
  mossXlUrl,
  pauseUiUrl,
  pillarSquareUrl,
  pistolEmptySfxUrl,
  pistolSfxUrl,
  pistolTextureUrl,
  pistolUrl,
  playerDeathSfxUrl,
  playerHitSfxUrl,
  playerTextureUrl as characterTextureUrl,
  playerUrl as characterUrl,
  roundCornersMusicUrl,
  skullCrackedUrl,
  stairsXlUrl,
  teleportOpenSfxUrl,
  teleportationSfxUrl,
  thunderstormOneUrl,
  thunderstormTwoUrl,
  typewriterSfxUrl,
  uiSfxUrl,
  wallLightUrl,
  wallNormalXlUrl,
  vaseUrl,
  winMusicUrl
} from './config/assets.js';
import {
  AMMO_PER_SHOT,
  AMMO_RECHARGE_DELAY,
  AMMO_RECHARGE_RATE,
  BULLET_FORWARD,
  BULLET_LIFETIME,
  BULLET_RADIUS,
  BULLET_SPEED,
  CAMERA_COLLISION_PADDING,
  CAMERA_OFFSET,
  CHARACTER_TARGET_HEIGHT,
  CRYSTAL_BALL_BLOOM_RADIUS,
  CRYSTAL_BALL_BLOOM_STRENGTH,
  CRYSTAL_BALL_BLOOM_THRESHOLD,
  DEFAULT_GAMEPLAY_PITCH,
  DOWN,
  ELECTRIC_BALL_BLOOM_RADIUS,
  ELECTRIC_BALL_BLOOM_STRENGTH,
  ELECTRIC_BALL_BLOOM_THRESHOLD,
  EXAMPLE_SKY,
  EXPLOSION_DURATION,
  EXPLOSION_PARTICLE_COUNT,
  FIRE_SUN_BLOOM_RADIUS,
  FIRE_SUN_BLOOM_STRENGTH,
  FIRE_SUN_BLOOM_THRESHOLD,
  FIRE_SUN_FLOAT_HEIGHT,
  GAMEPLAY_CAMERA_FAR,
  GAMEPLAY_CAMERA_FOV,
  GAMEPLAY_CAMERA_NEAR,
  GLOW_CUBE_COLORS,
  GLOW_CUBE_COUNT,
  GRAVITY,
  JUMP_VELOCITY,
  LAVA_BALL_BLOOM_RADIUS,
  LAVA_BALL_BLOOM_STRENGTH,
  LAVA_BALL_BLOOM_THRESHOLD,
  MAGIC_BALL_BLOOM_RADIUS,
  MAGIC_BALL_BLOOM_STRENGTH,
  MAGIC_BALL_BLOOM_THRESHOLD,
  MAX_AMMO,
  MAX_HP,
  MENU_GLOW_CUBE_COLORS,
  MENU_GLOW_CUBE_COUNT,
  MENU_MUSIC_VOLUME,
  MENU_STORM_FLASH_DURATION,
  MENU_STORM_SEQUENCE_DURATION,
  MENU_THUNDER_ONE_VOLUME,
  MENU_THUNDER_TWO_VOLUME,
  PLAYER_CAPSULE_TOP,
  PLAYER_RADIUS,
  SHOT_INTERVAL,
  SPIKED_ENEMY_ACCELERATION,
  SPIKED_ENEMY_BOUNCE_SPEED,
  SPIKED_ENEMY_CHASE_RADIUS,
  SPIKED_ENEMY_CHASE_SPEED,
  SPIKED_ENEMY_CONTACT_DAMAGE,
  SPIKED_ENEMY_CONTACT_PUSH,
  SPIKED_ENEMY_COUNT,
  SPIKED_ENEMY_GRAVITY,
  SPIKED_ENEMY_HIT_COOLDOWN,
  SPIKED_ENEMY_MAX_HP,
  SPIKED_ENEMY_MIN_SPAWN_DISTANCE,
  SPIKED_ENEMY_PATROL_RADIUS,
  SPIKED_ENEMY_PATROL_SPEED,
  SPIKED_ENEMY_TARGET_DIAMETER,
  SPRINT_ACCELERATION,
  STEPS_PER_FRAME,
  UP,
  WALK_ACCELERATION
} from './config/constants.js';
import { DEFAULT_LEVEL_INDEX, ENEMY_LEVELS, ENEMY_TEMPLATE_URLS } from './config/levels.js';
import { UPGRADES } from './config/upgrades.js';
import {
  DEFAULT_CAMPAIGN_SCENE_KEY,
  DEFAULT_SCENE_KEY,
  DEFAULT_START_SCREEN_TAB,
  INTRO_SCENE_KEY,
  PLAYABLE_WORLD_SCENE_ENTRIES,
  PLAYABLE_WORLD_SCENES,
  WORLD_SCENES
} from './config/scenes.js';
import { createUi } from './ui/dom.js';
import {
  hideLoaderScreen as hideLoaderScreenUi,
  hideStatusOverlay as hideStatusOverlayUi,
  setMenuSceneCameraControlsVisible as setMenuSceneCameraControlsVisibleUi,
  setMenuSceneHeroVisible as setMenuSceneHeroVisibleUi,
  setMenuSceneLightControlsVisible as setMenuSceneLightControlsVisibleUi,
  setMenuScenePlayerControlsVisible as setMenuScenePlayerControlsVisibleUi,
  setHudMessage as setHudMessageUi,
  showLoaderScreen as showLoaderScreenUi,
  showStatusOverlay as showStatusOverlayUi,
  syncScreenVisibility as syncScreenVisibilityUi,
  updateFps as updateFpsUi,
  updateHud as updateHudUi,
  updateLoaderScreen as updateLoaderScreenUi,
  updateMenuSceneCameraControls as updateMenuSceneCameraControlsUi,
  updateMenuSceneLightControls as updateMenuSceneLightControlsUi,
  updateMenuScenePlayerControls as updateMenuScenePlayerControlsUi,
  updateStartScreenSelectionUi as updateStartScreenSelectionUiUi
} from './ui/render.js';
import {
  addWorldScene as addWorldSceneWorld,
  loadFBX as loadFBXWorld,
  loadGLTF as loadGLTFWorld,
  loadTexture as loadTextureWorld,
  prepareVoxelTexture as prepareVoxelTextureWorld
} from './world/loaders.js';
import {
  clearMenuSceneEffects as clearMenuSceneEffectsWorld,
  setupMenuSceneEffects as setupMenuSceneEffectsWorld
} from './world/menu-scene.js';
import { createIntroSceneWorld as createIntroSceneWorldWorld } from './world/intro-scene.js';
import {
  addGlowCubesToWorld as addGlowCubesToWorldWorld,
  addMenuSceneGlowCubes as addMenuSceneGlowCubesWorld,
  clearGlowCubes as clearGlowCubesWorld,
  createGlowCube as createGlowCubeWorld,
  updateGlowCubes as updateGlowCubesWorld
} from './world/glow-cubes.js';
import {
  findGroundPointAt as findGroundPointAtWorld,
  findSpawnPoint as findSpawnPointWorld,
  getSceneSpawnPoint as getSceneSpawnPointWorld
} from './world/spawn-points.js';
import {
  applyWorldScene as applyWorldSceneWorld,
  clearWorldScene as clearWorldSceneWorld,
  createWorldSceneRoot as createWorldSceneRootWorld,
  getPlayableSceneConfig as getPlayableSceneConfigWorld
} from './world/world-manager.js';
import {
  addCharacterModel as addCharacterModelPlayer,
  addGunModel as addGunModelPlayer,
  applyCharacterGunModelTransform as applyCharacterGunModelTransformPlayer,
  applyGunMountConfig as applyGunMountConfigPlayer,
  deriveGunMuzzlePosition as deriveGunMuzzlePositionPlayer,
  getAnchorWorldPosition as getAnchorWorldPositionPlayer,
  setAvatarVisibility as setAvatarVisibilityPlayer,
  setCharacterAction as setCharacterActionPlayer,
  syncCharacterGunTransforms as syncCharacterGunTransformsPlayer,
  updateCharacterAnimation as updateCharacterAnimationPlayer,
  updateCharacterMuzzlePosition as updateCharacterMuzzlePositionPlayer
} from './player/character.js';
import {
  controls as controlsPlayer,
  damagePlayer as damagePlayerPlayer,
  getForwardVector as getForwardVectorPlayer,
  getPlayerFootPosition as getPlayerFootPositionPlayer,
  getSideVector as getSideVectorPlayer,
  playerCollisions as playerCollisionsPlayer,
  respawnPlayer as respawnPlayerPlayer,
  setPlayerFootPosition as setPlayerFootPositionPlayer,
  updateCamera as updateCameraPlayer,
  updatePlayer as updatePlayerPlayer,
  updatePlayerVisual as updatePlayerVisualPlayer,
  updateWeapon as updateWeaponPlayer
} from './player/runtime.js';
import {
  createSpikedEnemies,
  createSpikedEnemyModels as createSpikedEnemyModelsEnemies,
  damageSpikedEnemy as damageSpikedEnemyEnemies,
  hideSpikedEnemies as hideSpikedEnemiesEnemies,
  prepareEnemyTemplate as prepareEnemyTemplateEnemies,
  resetSpikedEnemies as resetSpikedEnemiesEnemies,
  sphereIntersectsSphere as sphereIntersectsSphereEnemies,
  updateSpikedEnemies as updateSpikedEnemiesEnemies
} from './enemies/balls.js';
import {
  clearBullets as clearBulletsFx,
  clearExplosionEffects as clearExplosionEffectsFx,
  createCombatFxResources,
  rechargeAmmo as rechargeAmmoFx,
  spawnExplosion as spawnExplosionFx,
  tryFire as tryFireFx,
  updateBullets as updateBulletsFx,
  updateExplosionEffects as updateExplosionEffectsFx
} from './fx/combat-fx.js';

const ui = createUi({
  worldScenes: WORLD_SCENES,
  playableWorldSceneEntries: PLAYABLE_WORLD_SCENE_ENTRIES,
  enemyLevels: ENEMY_LEVELS,
  defaultSceneKey: DEFAULT_SCENE_KEY,
  defaultLevelIndex: DEFAULT_LEVEL_INDEX
});

const {
  hud,
  loadingEl,
  menuSceneCameraResetButton,
  menuSceneHeroPlayButton,
  menuSceneControlsButton,
  menuSceneViewButton,
  menuStormOverlay,
  pauseButton,
  pauseMenu,
  sceneSelector,
  sceneToggleButton,
  screenFade,
  startScreen,
  statusOverlay,
  audioToggleButton,
  controlsCloseButton,
  controlsMappingEl,
  controlsPopup,
  cutsceneScreen,
  cutsceneTitleEl,
  cutsceneTextEl,
  upgradeContinueButton,
  upgradeGridEl,
  upgradeScreen
} = ui;

function showStatusOverlay(
  title,
  hint = '',
  { interactive = false, buttonLabel = '', buttonAction = '', actions = null } = {}
) {
  showStatusOverlayUi(statusOverlay, title, hint, { interactive, buttonLabel, buttonAction, actions });
}

function hideStatusOverlay() {
  hideStatusOverlayUi(statusOverlay);
}

function getCurrentLevelProgressText() {
  return `${currentLevelIndex + 1} / ${ENEMY_LEVELS.length}`;
}

function getCurrentLevelLabel() {
  return currentLevelConfig?.label ?? `Level ${currentLevelIndex + 1}`;
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

const SCENE_FADE_DURATION = 850;
let fadeVisible = false;

function setFadeVisible(visible) {
  fadeVisible = visible;
  screenFade.classList.toggle('is-visible', visible);
}

async function fadeToBlack(duration = SCENE_FADE_DURATION) {
  if (fadeVisible) {
    return;
  }

  setFadeVisible(true);
  await wait(duration);
}

async function fadeFromBlack(duration = SCENE_FADE_DURATION) {
  if (!fadeVisible) {
    return;
  }

  setFadeVisible(false);
  await wait(duration);
}

function resetRunStats() {
  Object.assign(playerStats, BASE_PLAYER_STATS);
  Object.assign(weaponStats, BASE_WEAPON_STATS);
  Object.assign(abilityStats, BASE_ABILITY_STATS);
  hp = playerStats.maxHP;
  ammo = weaponStats.magazine;
  shockwaveCooldownTimer = 0;
}

function getCurrentLevelEnemies() {
  return currentLevelConfig?.enemies ?? [];
}

function getCurrentLevelUpgradeIds() {
  return currentLevelConfig?.availableUpgrades ?? [];
}

function isNonPlayableScene(sceneKey = activeSceneKey) {
  return WORLD_SCENES[sceneKey]?.playable === false;
}

function usesMenuSceneExperience(sceneKey = activeSceneKey) {
  return WORLD_SCENES[sceneKey]?.menuExperience === 'storm';
}

function getMenuSceneGlowCubeCount(sceneKey = activeSceneKey) {
  return WORLD_SCENES[sceneKey]?.menuGlowCubeCount ?? MENU_GLOW_CUBE_COUNT;
}

function getFixedSceneViewConfig(sceneKey = activeSceneKey) {
  return WORLD_SCENES[sceneKey]?.fixedView ?? null;
}

function getDefaultFixedSceneCameraOverride(sceneKey = activeSceneKey) {
  return getFixedSceneViewConfig(sceneKey)?.defaultCameraOverride ?? null;
}

function getSceneLightControlConfig(sceneKey = activeSceneKey) {
  return WORLD_SCENES[sceneKey]?.lightControls ?? null;
}

function getScenePlayerControlConfig(sceneKey = activeSceneKey) {
  return WORLD_SCENES[sceneKey]?.playerControls ?? null;
}

function shouldShowSceneTools(sceneKey = activeSceneKey) {
  return menuSceneViewOpen && WORLD_SCENES[sceneKey]?.showSceneTools === true;
}

function hasFixedSceneCameraOverride(sceneKey = activeSceneKey) {
  return Boolean(getDefaultFixedSceneCameraOverride(sceneKey));
}

function hasEditableFixedSceneView(sceneKey = activeSceneKey) {
  return Boolean(getFixedSceneViewConfig(sceneKey));
}

function shouldShowMenuSceneCameraControls(sceneKey = activeSceneKey) {
  return shouldShowSceneTools(sceneKey) && hasEditableFixedSceneView(sceneKey);
}

function shouldShowMenuSceneLightControls(sceneKey = activeSceneKey) {
  return shouldShowSceneTools(sceneKey) && Boolean(getSceneLightControlConfig(sceneKey));
}

function shouldShowMenuScenePlayerControls(sceneKey = activeSceneKey) {
  return shouldShowSceneTools(sceneKey) && Boolean(getScenePlayerControlConfig(sceneKey));
}

function shouldHideGameplayAvatar(sceneKey = activeSceneKey) {
  return WORLD_SCENES[sceneKey]?.hideGameplayAvatar === true;
}

function shouldShowMenuSceneHero(sceneKey = activeSceneKey) {
  return menuSceneViewOpen && sceneKey === INTRO_SCENE_KEY;
}

function getStartScreenPreviewSceneKey() {
  return startScreenTab === 'menu' ? INTRO_SCENE_KEY : selectedStartSceneKey;
}

function syncScreenVisibility() {
  syncScreenVisibilityUi(ui, {
    startScreenOpen,
    menuSceneViewOpen,
    sceneReady,
    pauseMenuOpen,
    gameState
  });
  setMenuSceneHeroVisibleUi(ui, shouldShowMenuSceneHero());
  setMenuSceneCameraControlsVisibleUi(ui, shouldShowMenuSceneCameraControls());
  setMenuSceneLightControlsVisibleUi(ui, shouldShowMenuSceneLightControls());
  setMenuScenePlayerControlsVisibleUi(ui, shouldShowMenuScenePlayerControls());
}

function startSelectedRun() {
  if (!sceneReady) {
    return;
  }

  campaignSceneKey = selectedStartSceneKey;
  resetRunStats();
  runInProgress = true;
  startCampaignLevel(selectedStartLevelIndex);
}

function updateStartScreenSelectionUi() {
  updateStartScreenSelectionUiUi(ui, {
    selectedStartLevelIndex,
    selectedStartSceneKey,
    startScreenTab,
    enemyLevels: ENEMY_LEVELS,
    playableWorldScenes: PLAYABLE_WORLD_SCENES,
    worldScenes: WORLD_SCENES,
    startScreenPreviewSceneKey: getStartScreenPreviewSceneKey()
  });
}

function renderControlsPopup() {
  controlsMappingEl.innerHTML = [
    ['Move', 'WASD / Arrow keys'],
    ['Run', 'Hold Shift'],
    ['Jump', 'Space'],
    ['Aim', 'Mouse'],
    ['Shoot', 'Left click'],
    ['Shockwave', 'E'],
    ['Pause', 'P']
  ]
    .map(
      ([control, input]) => `
        <span class="controls-popup__control">${control}</span>
        <span class="controls-popup__input">${input}</span>
      `
    )
    .join('');
}

function setControlsPopupOpen(open) {
  if (open) {
    renderControlsPopup();
  }

  controlsPopup.hidden = !open;
}

function renderUpgradeScreen(upgradeIds) {
  selectedUpgradeId = upgradeIds[0] ?? null;
  upgradeGridEl.innerHTML = upgradeIds
    .map((upgradeId) => {
      const upgrade = UPGRADES[upgradeId];
      if (!upgrade) {
        return '';
      }

      return `
        <button class="upgrade-card${upgrade.id === selectedUpgradeId ? ' is-selected' : ''}" type="button" data-upgrade-id="${upgrade.id}">
          <strong class="upgrade-card__title">${upgrade.title}</strong>
          <span class="upgrade-card__description">${upgrade.description}</span>
        </button>
      `;
    })
    .join('');
}

function setSelectedUpgrade(upgradeId) {
  if (!UPGRADES[upgradeId]) {
    return;
  }

  selectedUpgradeId = upgradeId;
  for (const card of upgradeGridEl.querySelectorAll('[data-upgrade-id]')) {
    card.classList.toggle('is-selected', card.dataset.upgradeId === selectedUpgradeId);
  }
}

function applyUpgrade(upgradeId) {
  const upgrade = UPGRADES[upgradeId];
  if (!upgrade) {
    return;
  }

  if (upgrade.type === 'player') {
    if (upgrade.stat === 'maxHP') {
      playerStats.maxHP = Math.min(PLAYER_MAX_HP_CAP, playerStats.maxHP + upgrade.value);
      hp = Math.min(playerStats.maxHP, hp + upgrade.value);
    } else if (upgrade.stat === 'maxWalkSpeed') {
      playerStats.maxWalkSpeed *= 1 + upgrade.value;
    } else if (upgrade.stat === 'running') {
      playerStats.running += upgrade.value;
    } else if (upgrade.stat === 'jump') {
      playerStats.jump *= 1 + upgrade.value;
    }
  } else if (upgrade.type === 'weapon') {
    if (upgrade.stat === 'damage') {
      weaponStats.damage *= 1 + upgrade.value;
    } else if (upgrade.stat === 'magazine') {
      weaponStats.magazine = Math.min(WEAPON_MAGAZINE_CAP, weaponStats.magazine + upgrade.value);
      ammo = Math.min(weaponStats.magazine, ammo + upgrade.value);
    } else if (upgrade.stat === 'fireRate') {
      weaponStats.fireRate = Math.max(0.12, weaponStats.fireRate * (1 + upgrade.value));
    } else if (upgrade.stat === 'reloadSpeed') {
      weaponStats.reloadSpeed *= 1 + upgrade.value;
    }
  } else if (upgrade.type === 'ability') {
    if (upgrade.stat === 'shockwave') {
      abilityStats.shockwaveUnlocked = true;
    } else if (upgrade.stat === 'shockwaveCooldown') {
      abilityStats.shockwaveCooldown = Math.max(3, abilityStats.shockwaveCooldown * (1 + upgrade.value));
    }
  }
}

const CUTSCENE_TYPE_INTERVAL = 56;
const FINAL_CAMPAIGN_CUTSCENE = {
  title: 'Final',
  cutsceneText:
    'This game was made by andreykr with the help of Three.js and Codex during vibejam 2026. Zero lines of code were written. If you enjoyed the game and want to see more levels and updates, follow me on Twitter.'
};

function normalizeCutsceneSegments(cutsceneText) {
  if (Array.isArray(cutsceneText)) {
    return cutsceneText.map((segment) => ({
      text: String(segment.text ?? ''),
      tone: segment.tone ?? '',
      strong: Boolean(segment.strong)
    }));
  }

  return [{ text: String(cutsceneText ?? ''), tone: '', strong: false }];
}

function getCutscenePlainText(cutsceneText) {
  return normalizeCutsceneSegments(cutsceneText)
    .map((segment) => segment.text)
    .join('');
}

function createCutsceneTextSegment(segment) {
  const element = document.createElement(segment.strong ? 'strong' : 'span');

  if (segment.tone) {
    element.className = `cutscene-screen__text--${segment.tone}`;
  }

  return element;
}

function renderCutsceneTextInstant(target, segments) {
  target.textContent = '';

  for (const segment of segments) {
    const element = createCutsceneTextSegment(segment);
    element.textContent = segment.text;
    target.append(element);
  }
}

function startCutsceneTypewriter(target, segments, onComplete) {
  target.textContent = '';
  playCutsceneTypewriterSfx();

  let segmentIndex = 0;
  let characterIndex = 0;
  let activeElement = null;
  let timer = 0;
  let completed = false;

  const complete = () => {
    if (completed) {
      return;
    }

    completed = true;
    timer = 0;
    stopCutsceneTypewriterSfx();
    onComplete?.();
  };

  const tick = () => {
    const segment = segments[segmentIndex];

    if (!segment) {
      complete();
      return;
    }

    if (!activeElement) {
      activeElement = createCutsceneTextSegment(segment);
      target.append(activeElement);
    }

    activeElement.textContent += segment.text[characterIndex] ?? '';
    characterIndex += 1;

    if (characterIndex >= segment.text.length) {
      segmentIndex += 1;
      characterIndex = 0;
      activeElement = null;
    }

    timer = window.setTimeout(tick, CUTSCENE_TYPE_INTERVAL);
  };

  timer = window.setTimeout(tick, 180);

  return () => {
    if (timer) {
      window.clearTimeout(timer);
    }
    stopCutsceneTypewriterSfx();
  };
}

function showCutscene(levelConfig, { beforeTypewriter = null, onContinue = null } = {}) {
  return new Promise((resolve) => {
    const segments = normalizeCutsceneSegments(levelConfig.cutsceneText);
    let typewriterComplete = false;
    let stopTypewriter = null;
    let resolved = false;

    cutsceneTitleEl.textContent =
      levelConfig.title ?? `Chapter ${levelConfig.number ?? currentLevelIndex + 1}`;
    cutsceneTextEl.textContent = '';
    cutsceneScreen.hidden = false;

    const continueCutscene = () => {
      if (!typewriterComplete) {
        stopTypewriter?.();
        renderCutsceneTextInstant(cutsceneTextEl, segments);
        typewriterComplete = true;
        return;
      }

      onContinue?.();
      cutsceneScreen.removeEventListener('click', continueCutscene);
      stopTypewriter?.();
      resolved = true;
      resolve();
    };

    const beginTypewriter = async () => {
      await beforeTypewriter?.();

      if (resolved) {
        return;
      }

      stopTypewriter = startCutsceneTypewriter(cutsceneTextEl, segments, () => {
        typewriterComplete = true;
        stopTypewriter = null;
      });
      cutsceneScreen.addEventListener('click', continueCutscene);
    };

    beginTypewriter();
  });
}

function showUpgradeScreen(upgradeIds, { hideOnFinish = true } = {}) {
  return new Promise((resolve) => {
    pendingUpgradeIds = upgradeIds.filter((upgradeId) => UPGRADES[upgradeId]).slice(0, 2);

    if (pendingUpgradeIds.length === 0) {
      resolve(null);
      return;
    }

    renderUpgradeScreen(pendingUpgradeIds);
    upgradeScreen.hidden = false;

    const finish = () => {
      upgradeContinueButton.removeEventListener('click', finish);
      upgradeGridEl.removeEventListener('click', selectFromGrid);
      if (hideOnFinish) {
        upgradeScreen.hidden = true;
      }
      resolve(selectedUpgradeId);
    };

    const selectFromGrid = (event) => {
      const card = event.target.closest('[data-upgrade-id]');
      if (card) {
        setSelectedUpgrade(card.dataset.upgradeId);
      }
    };

    upgradeGridEl.addEventListener('click', selectFromGrid);
    upgradeContinueButton.addEventListener('click', finish);
  });
}

function hideSpikedEnemies() {
  activeEnemyHudTarget = hideSpikedEnemiesEnemies(spikedEnemies);
}

function setStartScreenOpen(open) {
  if (open) {
    stopMenuSceneExperience();
    menuSceneViewOpen = false;
    menuSceneCameraOverrideEnabled = false;
  }

  startScreenOpen = open;
  syncScreenVisibility();

  if (open) {
    triggerHeld = false;
    clearInputState();
    hideStatusOverlay();
    hideSpikedEnemies();

    if (document.pointerLockElement === renderer.domElement) {
      document.exitPointerLock();
    }

    gameState = 'startscreen';
  } else if (sceneReady && gameState === 'startscreen') {
    gameState = 'playing';
  }

  if (open) {
    syncStartScreenPreviewScene();
  }

  refreshHudMessage();
}

function openMenuSceneView(sceneKey = INTRO_SCENE_KEY) {
  if (!sceneReady) {
    return;
  }

  startScreenTab = 'menu';
  updateStartScreenSelectionUi();
  triggerHeld = false;
  clearInputState();
  hideStatusOverlay();
  hideSpikedEnemies();

  if (document.pointerLockElement === renderer.domElement) {
    document.exitPointerLock();
  }

  const sceneLabel = WORLD_SCENES[sceneKey]?.label ?? 'Scene';

  if (activeSceneKey !== sceneKey) {
    showLoaderScreen(`Opening ${sceneLabel}`, `Showing ${sceneLabel}.`);
    updateLoaderScreen(`Opening ${sceneLabel}`, `Showing ${sceneLabel}.`, 1, 1);
    applyWorldScene(sceneKey, { restartPlayer: false });
    hideLoaderScreen();
  } else {
    configureNonPlayableScenePlayerPose(sceneKey);
    updateCamera(0);
    updatePlayerVisual();
  }

  startScreenOpen = false;
  menuSceneViewOpen = true;
  gameState = 'menuview';
  resetMenuSceneCameraControls(sceneKey);
  resetMenuSceneLightControls(sceneKey);
  resetMenuScenePlayerControls(sceneKey);
  syncScreenVisibility();
  if (usesMenuSceneExperience(sceneKey)) {
    startMenuSceneExperience();
  } else {
    stopMenuSceneExperience();
  }
  refreshHudMessage();
}

async function openMenuSceneViewWithTransition(sceneKey = INTRO_SCENE_KEY) {
  if (!sceneReady) {
    return;
  }

  gameState = 'transition';
  triggerHeld = false;
  clearInputState();

  if (document.pointerLockElement === renderer.domElement) {
    document.exitPointerLock();
  }

  await fadeToBlack();
  pauseMenuOpen = false;
  pauseMenu.hidden = true;
  sceneSelectorOpen = false;
  sceneSelector.hidden = true;
  stopLevelSoundtrack();
  stopWinMusic();
  openMenuSceneView(sceneKey);
  await fadeFromBlack();
}

function closeMenuSceneView() {
  if (!menuSceneViewOpen) {
    return;
  }

  stopMenuSceneExperience();
  menuSceneViewOpen = false;
  menuSceneCameraOverrideEnabled = false;
  setStartScreenOpen(true);
}

function getActiveSceneLabel() {
  return WORLD_SCENES[activeSceneKey]?.label ?? activeSceneKey;
}

function getSceneLabelList() {
  return PLAYABLE_WORLD_SCENE_ENTRIES
    .map(([, sceneConfig]) => sceneConfig.label)
    .join(', ');
}

function setStartScreenTab(tab) {
  const nextTab = tab === 'menu' ? 'menu' : DEFAULT_START_SCREEN_TAB;
  if (startScreenTab === nextTab) {
    updateStartScreenSelectionUi();
    return;
  }

  startScreenTab = nextTab;
  updateStartScreenSelectionUi();
  syncStartScreenPreviewScene();
}

function syncStartScreenPreviewScene() {
  if (!sceneReady || !startScreenOpen) {
    return;
  }

  const previewSceneKey = getStartScreenPreviewSceneKey();
  if (!WORLD_SCENES[previewSceneKey] || activeSceneKey === previewSceneKey) {
    if (isNonPlayableScene(previewSceneKey)) {
      configureNonPlayableScenePlayerPose(previewSceneKey);
      updateCamera(0);
      updatePlayerVisual();
    }
    return;
  }

  showLoaderScreen('Loading Scene Preview', `Previewing ${WORLD_SCENES[previewSceneKey].label}.`);
  updateLoaderScreen('Loading Scene Preview', `Previewing ${WORLD_SCENES[previewSceneKey].label}.`, 1, 1);
  applyWorldScene(previewSceneKey, { restartPlayer: false });
  hideSpikedEnemies();
  hideLoaderScreen();
}

function getPlayableSceneConfig(sceneKey) {
  return getPlayableSceneConfigWorld(PLAYABLE_WORLD_SCENES, sceneKey);
}

function createWorldSceneRoot(sceneKey) {
  return createWorldSceneRootWorld({ worldSceneFactories, loadedWorldTemplates, sceneKey });
}

function clearMenuSceneEffects() {
  clearMenuSceneEffectsWorld(menuSceneFireEffects);
}

function playHtmlAudio(audio, { restart = true } = {}) {
  if (!audio || !audioEnabled) {
    return;
  }

  if (restart) {
    audio.currentTime = 0;
  }

  const playPromise = audio.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {});
  }
}

function loadImageAsset(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
    image.src = url;
  });
}

function loadBinaryAsset(url) {
  return fetch(url, { cache: 'force-cache' }).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to preload asset: ${url}`);
    }

    return response.arrayBuffer();
  });
}

function updateAudioToggleLabel() {
  audioToggleButton.textContent = audioEnabled ? 'Music/SFX On' : 'Music/SFX Off';
}

function syncAudioMuteState() {
  for (const audio of [
    menuMusicAudio,
    thunderstormOneAudio,
    thunderstormTwoAudio,
    pistolSfxAudio,
    pistolEmptySfxAudio,
    enemyHitSfxAudio,
    enemyExplosionSfxAudio,
    playerHitSfxAudio,
    playerDeathSfxAudio,
    teleportOpenSfxAudio,
    teleportationSfxAudio,
    uiHoverSfxAudio,
    typewriterSfxAudio,
    winMusicAudio,
    levelMusicAudio,
    fadingLevelMusicAudio,
    activeUiHoverSfxAudio,
    ...levelSoundtrackAudioCache.values()
  ]) {
    if (audio) {
      audio.muted = !audioEnabled;
    }
  }
}

const audioFadeFrames = new WeakMap();

function cancelAudioFade(audio) {
  const frameId = audio ? audioFadeFrames.get(audio) : null;
  if (frameId) {
    window.cancelAnimationFrame(frameId);
    audioFadeFrames.delete(audio);
  }
}

function fadeAudioVolume(
  audio,
  targetVolume,
  duration = 1000,
  { stopWhenSilent = false, resetVolume = null, onComplete = null } = {}
) {
  if (!audio) {
    return;
  }

  cancelAudioFade(audio);

  const startVolume = audio.volume;
  const startTime = performance.now();

  const update = (time) => {
    const progress = Math.min(1, (time - startTime) / Math.max(duration, 1));
    audio.volume = THREE.MathUtils.lerp(startVolume, targetVolume, progress);

    if (progress < 1) {
      audioFadeFrames.set(audio, window.requestAnimationFrame(update));
      return;
    }

    audioFadeFrames.delete(audio);

    if (stopWhenSilent) {
      stopHtmlAudio(audio);
      if (resetVolume !== null) {
        audio.volume = resetVolume;
      }
    }

    onComplete?.();
  };

  audioFadeFrames.set(audio, window.requestAnimationFrame(update));
}

function stopLevelSoundtrack() {
  stopHtmlAudio(levelMusicAudio);
  stopHtmlAudio(fadingLevelMusicAudio);
  levelMusicAudio = null;
  fadingLevelMusicAudio = null;
}

function getLevelSoundtrackAudio(url) {
  if (!url) {
    return null;
  }

  let audio = levelSoundtrackAudioCache.get(url);
  if (!audio) {
    audio = new Audio(url);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = LEVEL_MUSIC_VOLUME;
    levelSoundtrackAudioCache.set(url, audio);
  }

  return audio;
}

function fadeOutMenuMusic(duration = 1000) {
  fadeAudioVolume(menuMusicAudio, 0, duration, {
    stopWhenSilent: true,
    resetVolume: MENU_MUSIC_VOLUME
  });
}

function fadeOutLevelSoundtrack(duration = 1300) {
  const audio = levelMusicAudio;
  levelMusicAudio = null;
  fadingLevelMusicAudio = audio;
  fadeAudioVolume(audio, 0, duration, {
    stopWhenSilent: true,
    resetVolume: LEVEL_MUSIC_VOLUME,
    onComplete: () => {
      if (fadingLevelMusicAudio === audio) {
        fadingLevelMusicAudio = null;
      }
    }
  });
}

function stopWinMusic() {
  stopHtmlAudio(winMusicAudio);
  winMusicAudio.volume = WIN_MUSIC_VOLUME;
}

function startWinMusic() {
  if (!audioEnabled) {
    return;
  }

  stopWinMusic();
  winMusicAudio.volume = 0;
  playHtmlAudio(winMusicAudio);
  fadeAudioVolume(winMusicAudio, WIN_MUSIC_VOLUME, 1800);
}

function startLevelSoundtrack() {
  stopLevelSoundtrack();
  stopWinMusic();

  if (!currentLevelConfig?.soundtrack) {
    return;
  }

  levelMusicAudio = getLevelSoundtrackAudio(currentLevelConfig.soundtrack);
  if (!levelMusicAudio) {
    return;
  }

  levelMusicAudio.volume = LEVEL_MUSIC_VOLUME;
  syncAudioMuteState();
  playHtmlAudio(levelMusicAudio);
}

function playOneShotSfx(baseAudio, { volume = baseAudio?.volume ?? 1, onEnded = null } = {}) {
  if (!baseAudio || !audioEnabled) {
    return null;
  }

  const sfx = baseAudio.cloneNode();
  sfx.volume = volume;
  sfx.muted = !audioEnabled;

  if (onEnded) {
    sfx.addEventListener('ended', onEnded, { once: true });
  }

  playHtmlAudio(sfx);
  return sfx;
}

function playPistolSfx() {
  playOneShotSfx(pistolSfxAudio);
}

function playPistolEmptySfx() {
  playOneShotSfx(pistolEmptySfxAudio);
}

function playEnemyHitSfx() {
  playOneShotSfx(enemyHitSfxAudio);
}

function playEnemyExplosionSfx() {
  playOneShotSfx(enemyExplosionSfxAudio);
}

function playPlayerHitSfx() {
  playOneShotSfx(playerHitSfxAudio);
}

function playPlayerDeathSfx() {
  playOneShotSfx(playerDeathSfxAudio);
}

function playTeleportationSfx() {
  playOneShotSfx(teleportationSfxAudio);
}

function playPortalOpenSequence() {
  const sequenceId = ++portalAudioSequenceId;
  fadeOutLevelSoundtrack();

  if (!audioEnabled) {
    return;
  }

  let winStarted = false;
  const startWinOnce = () => {
    if (winStarted) {
      return;
    }

    if (sequenceId !== portalAudioSequenceId || gameState !== 'portal') {
      return;
    }

    winStarted = true;
    startWinMusic();
  };

  const openSfx = playOneShotSfx(teleportOpenSfxAudio, { onEnded: startWinOnce });
  if (!openSfx) {
    startWinOnce();
  }
}

function playUiHoverSfx() {
  if (!audioEnabled) {
    return;
  }

  if (activeUiHoverSfxAudio && !activeUiHoverSfxAudio.paused) {
    const previousAudio = activeUiHoverSfxAudio;
    fadeAudioVolume(previousAudio, 0, 90, {
      stopWhenSilent: true,
      resetVolume: UI_HOVER_SFX_VOLUME,
      onComplete: () => {
        if (activeUiHoverSfxAudio === previousAudio) {
          activeUiHoverSfxAudio = null;
        }
      }
    });
  }

  const nextAudio = new Audio(uiSfxUrl);
  nextAudio.preload = 'auto';
  nextAudio.volume = UI_HOVER_SFX_VOLUME * 0.25;
  nextAudio.muted = !audioEnabled;
  activeUiHoverSfxAudio = nextAudio;
  nextAudio.addEventListener('ended', () => {
    if (activeUiHoverSfxAudio === nextAudio) {
      activeUiHoverSfxAudio = null;
    }
  }, { once: true });
  playHtmlAudio(nextAudio, { restart: false });
  fadeAudioVolume(nextAudio, UI_HOVER_SFX_VOLUME, 55);
}

function playCutsceneTypewriterSfx() {
  playHtmlAudio(typewriterSfxAudio);
}

function stopCutsceneTypewriterSfx() {
  stopHtmlAudio(typewriterSfxAudio);
}

function toggleAudioEnabled() {
  audioEnabled = !audioEnabled;
  if (audioEnabled) {
    audioInteractionUnlocked = true;
  }
  syncAudioMuteState();
  updateAudioToggleLabel();

  if (!audioEnabled) {
    stopHtmlAudio(menuMusicAudio);
    stopHtmlAudio(thunderstormOneAudio);
    stopHtmlAudio(thunderstormTwoAudio);
    stopHtmlAudio(activeUiHoverSfxAudio);
    activeUiHoverSfxAudio = null;
    stopCutsceneTypewriterSfx();
    stopLevelSoundtrack();
    stopWinMusic();
    return;
  }

  if (menuSceneViewOpen && usesMenuSceneExperience()) {
    playHtmlAudio(menuMusicAudio, { restart: false });
  } else if (gameState === 'portal') {
    startWinMusic();
  } else if (gameState === 'playing') {
    startLevelSoundtrack();
  }
}

function unlockAudioOnUserGesture() {
  if (!audioEnabled || audioInteractionUnlocked) {
    return;
  }

  audioInteractionUnlocked = true;

  if (menuSceneViewOpen && usesMenuSceneExperience()) {
    playHtmlAudio(menuMusicAudio, { restart: false });
  }
}

function stopHtmlAudio(audio) {
  if (!audio) {
    return;
  }

  cancelAudioFade(audio);
  audio.pause();
  audio.currentTime = 0;
}

function triggerMenuStormFlash(strength = 1) {
  menuSceneStormState.flashTimer = MENU_STORM_FLASH_DURATION;
  menuSceneStormState.flashStrength = strength;
  menuSceneStormState.phase = Math.random() * Math.PI * 2;
  menuStormOverlay.hidden = false;
}

function startMenuSceneExperience() {
  menuMusicAudio.volume = MENU_MUSIC_VOLUME;
  playHtmlAudio(menuMusicAudio);
  stopHtmlAudio(thunderstormOneAudio);
  stopHtmlAudio(thunderstormTwoAudio);
  menuSceneStormState.active = true;
  menuSceneStormState.sequenceTime = 0;
  menuSceneStormState.playedThunderOne = false;
  menuSceneStormState.triggeredSecondFlash = false;
  menuSceneStormState.playedThunderTwo = false;
  menuSceneStormState.flashTimer = 0;
  menuSceneStormState.flashStrength = 0;
  triggerMenuStormFlash(1);
}

function stopMenuSceneExperience({ keepMusic = false } = {}) {
  menuSceneStormState.active = false;
  menuSceneStormState.sequenceTime = 0;
  menuSceneStormState.playedThunderOne = false;
  menuSceneStormState.triggeredSecondFlash = false;
  menuSceneStormState.playedThunderTwo = false;
  menuSceneStormState.flashTimer = 0;
  menuSceneStormState.flashStrength = 0;
  menuStormLight.intensity = 0;
  menuStormOverlay.style.opacity = '0';
  menuStormOverlay.hidden = true;
  if (!keepMusic) {
    stopHtmlAudio(menuMusicAudio);
  }
  stopHtmlAudio(thunderstormOneAudio);
  stopHtmlAudio(thunderstormTwoAudio);
}

function updateMenuStorm(deltaTime) {
  if (!menuSceneStormState.active || !menuSceneViewOpen || !usesMenuSceneExperience()) {
    menuStormLight.intensity = 0;
    menuStormOverlay.style.opacity = '0';
    menuStormOverlay.hidden = true;
    return;
  }

  menuSceneStormState.sequenceTime += deltaTime;

  if (!menuSceneStormState.playedThunderOne && menuSceneStormState.sequenceTime >= 2) {
    menuSceneStormState.playedThunderOne = true;
    playHtmlAudio(thunderstormOneAudio);
  }

  if (!menuSceneStormState.triggeredSecondFlash && menuSceneStormState.sequenceTime >= 9) {
    menuSceneStormState.triggeredSecondFlash = true;
    triggerMenuStormFlash(0.94);
  }

  if (!menuSceneStormState.playedThunderTwo && menuSceneStormState.sequenceTime >= 12) {
    menuSceneStormState.playedThunderTwo = true;
    playHtmlAudio(thunderstormTwoAudio);
  }

  if (menuSceneStormState.sequenceTime >= MENU_STORM_SEQUENCE_DURATION) {
    menuSceneStormState.sequenceTime = 0;
    menuSceneStormState.playedThunderOne = false;
    menuSceneStormState.triggeredSecondFlash = false;
    menuSceneStormState.playedThunderTwo = false;
    triggerMenuStormFlash(0.98);
  }

  if (menuSceneStormState.flashTimer > 0) {
    menuSceneStormState.flashTimer = Math.max(0, menuSceneStormState.flashTimer - deltaTime);
    const progress = 1 - menuSceneStormState.flashTimer / MENU_STORM_FLASH_DURATION;
    const pulseA = Math.max(0, 1 - Math.abs((progress - 0.12) / 0.09));
    const pulseB = Math.max(0, 1 - Math.abs((progress - 0.26) / 0.07));
    const pulseC = Math.max(0, 1 - Math.abs((progress - 0.44) / 0.11));
    const intensity =
      (pulseA * 1.2 + pulseB * 0.85 + pulseC * 0.55) * menuSceneStormState.flashStrength;

    menuStormLight.intensity = intensity * 2.35;
    menuStormOverlay.hidden = false;
    menuStormOverlay.style.opacity = `${THREE.MathUtils.clamp(0.12 + intensity * 0.2, 0, 0.4)}`;
  } else {
    menuStormLight.intensity = 0;
    menuStormOverlay.style.opacity = '0.05';
    menuStormOverlay.hidden = false;
  }
}

function updateMenuSceneEffects(deltaTime, time) {
  for (const fireEffect of menuSceneFireEffects) {
    fireEffect.mixer.update(deltaTime);

    if (fireEffect.light) {
      const flicker =
        0.88 +
        Math.sin(time * 3.6 + fireEffect.phase) * 0.16 +
        Math.sin(time * 7.2 + fireEffect.phase * 0.8) * 0.08;
      fireEffect.light.intensity = fireEffect.baseIntensity * flicker;
    }
  }

  updateMenuStorm(deltaTime);
}

function setupMenuSceneEffects() {
  setupMenuSceneEffectsWorld({
    currentWorldRoot,
    enabled: usesMenuSceneExperience(),
    menuSceneFireEffects
  });
}

function configureNonPlayableScenePlayerPose(sceneKey = activeSceneKey) {
  if (!isNonPlayableScene(sceneKey)) {
    return;
  }

  yaw = 0;
  pitch = 0;

  orbitYaw = 0;
  orbitPitch = 0;
  recoilBack = 0;
  recoilUp = 0;
  recoilTwist = 0;
  walkBob = 0;
  muzzleFlashTimer = 0;
  triggerHeld = false;
  playerVelocity.set(0, 0, 0);
  setCharacterAction('Armature|idle with pistol', { fade: 0.08, force: true });
}

function createIntroSceneWorld(assetTemplates) {
  return createIntroSceneWorldWorld(assetTemplates);
}

function addMenuSceneGlowCubes() {
  addMenuSceneGlowCubesWorld({
    worldBounds,
    playerSpawn,
    count: getMenuSceneGlowCubeCount(),
    colors: MENU_GLOW_CUBE_COLORS,
    createGlowCube
  });
}

function addGlowCubesForScene(sceneKey) {
  if (usesMenuSceneExperience(sceneKey)) {
    addMenuSceneGlowCubes();
    return;
  }

  const sceneConfig = WORLD_SCENES[sceneKey];
  if (sceneConfig?.useGlowCubes !== false) {
    addGlowCubesToWorld(sceneConfig?.glowCubeCount ?? GLOW_CUBE_COUNT);
  }
}

function updateLoaderScreen(title, hint, loaded = loaderState.loaded, total = loaderState.total) {
  updateLoaderScreenUi(ui, { title, hint, loaded, total });
}

function showLoaderScreen(title, hint) {
  showLoaderScreenUi(ui, {
    title,
    hint,
    loaded: loaderState.loaded,
    total: loaderState.total
  });
}

function hideLoaderScreen() {
  hideLoaderScreenUi(ui);
}

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.domElement.style.display = 'block';
renderer.domElement.style.touchAction = 'none';
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(EXAMPLE_SKY);
scene.fog = new THREE.Fog(0x05070c, 12, 40);

const camera = new THREE.PerspectiveCamera(
  GAMEPLAY_CAMERA_FOV,
  window.innerWidth / window.innerHeight,
  GAMEPLAY_CAMERA_NEAR,
  GAMEPLAY_CAMERA_FAR
);
camera.rotation.order = 'YXZ';

const composer = new EffectComposer(renderer);
composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
composer.setSize(window.innerWidth, window.innerHeight);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  FIRE_SUN_BLOOM_STRENGTH,
  FIRE_SUN_BLOOM_RADIUS,
  FIRE_SUN_BLOOM_THRESHOLD
);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

function applyEnemyBloomProfile(enemyKey) {
  if (enemyKey === 'lavaBall') {
    bloomPass.strength = LAVA_BALL_BLOOM_STRENGTH;
    bloomPass.radius = LAVA_BALL_BLOOM_RADIUS;
    bloomPass.threshold = LAVA_BALL_BLOOM_THRESHOLD;
    return;
  }

  if (enemyKey === 'magicBall') {
    bloomPass.strength = MAGIC_BALL_BLOOM_STRENGTH;
    bloomPass.radius = MAGIC_BALL_BLOOM_RADIUS;
    bloomPass.threshold = MAGIC_BALL_BLOOM_THRESHOLD;
    return;
  }

  if (enemyKey === 'electricBall') {
    bloomPass.strength = ELECTRIC_BALL_BLOOM_STRENGTH;
    bloomPass.radius = ELECTRIC_BALL_BLOOM_RADIUS;
    bloomPass.threshold = ELECTRIC_BALL_BLOOM_THRESHOLD;
    return;
  }

  if (enemyKey === 'crystalBallLightning') {
    bloomPass.strength = CRYSTAL_BALL_BLOOM_STRENGTH;
    bloomPass.radius = CRYSTAL_BALL_BLOOM_RADIUS;
    bloomPass.threshold = CRYSTAL_BALL_BLOOM_THRESHOLD;
    return;
  }

  bloomPass.strength = FIRE_SUN_BLOOM_STRENGTH;
  bloomPass.radius = FIRE_SUN_BLOOM_RADIUS;
  bloomPass.threshold = FIRE_SUN_BLOOM_THRESHOLD;
}

const fillLight = new THREE.HemisphereLight(0x284167, 0x060b12, 0.48);
fillLight.position.set(2, 1, 1);
scene.add(fillLight);

const sunLight = new THREE.DirectionalLight(0x9bb7ff, 0.84);
sunLight.position.set(-7, 18, 4);
sunLight.castShadow = true;
sunLight.shadow.camera.near = 0.01;
sunLight.shadow.camera.far = 500;
sunLight.shadow.camera.left = -30;
sunLight.shadow.camera.right = 30;
sunLight.shadow.camera.top = 30;
sunLight.shadow.camera.bottom = -30;
sunLight.shadow.mapSize.set(1024, 1024);
sunLight.shadow.radius = 4;
sunLight.shadow.bias = -0.00006;
scene.add(sunLight);

const warmTopLight = new THREE.DirectionalLight(0xffe3a6, 0.38);
warmTopLight.position.set(3, 24, 2);
warmTopLight.target.position.set(0, 0, 0);
warmTopLight.castShadow = false;
scene.add(warmTopLight);
scene.add(warmTopLight.target);

scene.add(new THREE.AmbientLight(0x111928, 0.32));

const menuStormLight = new THREE.DirectionalLight(0xdbe8ff, 0);
menuStormLight.position.set(-5.5, 12.5, 8.5);
menuStormLight.castShadow = false;
menuStormLight.target.position.set(0, 1.1, 0);
scene.add(menuStormLight);
scene.add(menuStormLight.target);

const worldOctree = new Octree();
const worldMeshes = [];
const bullets = [];
const glowCubes = [];
const keyStates = {};

let gameState = 'loading';
let sceneReady = false;
let startScreenOpen = false;
let menuSceneViewOpen = false;
let playerOnFloor = false;
let hp = 3;
let ammo = 8;
let yaw = 0;
let pitch = DEFAULT_GAMEPLAY_PITCH;
let triggerHeld = false;
let lastShotAt = -Infinity;
let muzzleFlashTimer = 0;
let muzzleFlashDuration = 0.06;
let worldFloor = -10;
let characterModel = null;
let characterMixer = null;
let activeCharacterAction = null;
let activeCharacterActionName = '';
let shootActionTimer = 0;
let characterScale = 1;
let weaponHolderBone = null;
let characterTexture = null;
let pistolTexture = null;
let bricksTopTexture = null;
let bricksSideTexture = null;
let lastEmptyShotAt = -Infinity;
let orbitYaw = 0;
let orbitPitch = 0;
let currentWorldRoot = null;
let currentCollisionRoot = null;
let activeSceneKey = DEFAULT_SCENE_KEY;
let currentLevelIndex = 0;
let currentLevelConfig = ENEMY_LEVELS[currentLevelIndex];
let campaignSceneKey = DEFAULT_CAMPAIGN_SCENE_KEY;
let selectedStartLevelIndex = DEFAULT_LEVEL_INDEX;
let selectedStartSceneKey = DEFAULT_SCENE_KEY;
let startScreenTab = DEFAULT_START_SCREEN_TAB;
let sceneSelectorOpen = false;
let pauseMenuOpen = false;
let gameStateBeforePause = 'playing';
let simulationTime = 0;
let smoothedFps = 60;
let menuSceneCameraOverrideEnabled = false;
let runInProgress = false;
let selectedUpgradeId = null;
let pendingUpgradeIds = [];
let portalActive = false;
let portalTransitionActive = false;
let portalAudioSequenceId = 0;
let deathScreenTimer = 0;
let shockwaveCooldownTimer = 0;
let audioEnabled = true;
let audioInteractionUnlocked = false;

const BRICK_TILE_WORLD_SIZE = 5.4;
const loaderState = {
  total: 0,
  loaded: 0
};

const PLAYER_MAX_HP_CAP = 10;
const WEAPON_MAGAZINE_CAP = 10;
const LEVEL_MUSIC_VOLUME = 0.52;
const WIN_MUSIC_VOLUME = 0.48;
const UI_SFX_VOLUME = 0.21;
const UI_HOVER_SFX_VOLUME = UI_SFX_VOLUME * 0.6;
const EMPTY_SHOT_INTERVAL = 0.36;
const BASE_PLAYER_STATS = {
  maxHP: 3,
  maxWalkSpeed: WALK_ACCELERATION,
  running: 1.3,
  jump: JUMP_VELOCITY
};
const BASE_WEAPON_STATS = {
  damage: 20,
  magazine: 8,
  fireRate: 0.5,
  reloadSpeed: 1 / 1.5
};
const BASE_ABILITY_STATS = {
  shockwaveUnlocked: false,
  shockwaveCooldown: 10
};
const playerStats = { ...BASE_PLAYER_STATS };
const weaponStats = { ...BASE_WEAPON_STATS };
const abilityStats = { ...BASE_ABILITY_STATS };

const menuMusicAudio = new Audio(menuMusicUrl);
menuMusicAudio.loop = true;
menuMusicAudio.preload = 'auto';
menuMusicAudio.volume = MENU_MUSIC_VOLUME;

const pistolSfxAudio = new Audio(pistolSfxUrl);
pistolSfxAudio.preload = 'auto';
pistolSfxAudio.volume = 0.72;

const pistolEmptySfxAudio = new Audio(pistolEmptySfxUrl);
pistolEmptySfxAudio.preload = 'auto';
pistolEmptySfxAudio.volume = 0.38;

const enemyHitSfxAudio = new Audio(enemyHitSfxUrl);
enemyHitSfxAudio.preload = 'auto';
enemyHitSfxAudio.volume = 0.48;

const enemyExplosionSfxAudio = new Audio(enemyExplosionSfxUrl);
enemyExplosionSfxAudio.preload = 'auto';
enemyExplosionSfxAudio.volume = 0.58;

const playerHitSfxAudio = new Audio(playerHitSfxUrl);
playerHitSfxAudio.preload = 'auto';
playerHitSfxAudio.volume = 0.5;

const playerDeathSfxAudio = new Audio(playerDeathSfxUrl);
playerDeathSfxAudio.preload = 'auto';
playerDeathSfxAudio.volume = 0.62;

const teleportOpenSfxAudio = new Audio(teleportOpenSfxUrl);
teleportOpenSfxAudio.preload = 'auto';
teleportOpenSfxAudio.volume = 0.6;

const teleportationSfxAudio = new Audio(teleportationSfxUrl);
teleportationSfxAudio.preload = 'auto';
teleportationSfxAudio.volume = 0.62;

const uiHoverSfxAudio = new Audio(uiSfxUrl);
uiHoverSfxAudio.preload = 'auto';
uiHoverSfxAudio.volume = UI_HOVER_SFX_VOLUME;

const typewriterSfxAudio = new Audio(typewriterSfxUrl);
typewriterSfxAudio.loop = true;
typewriterSfxAudio.preload = 'auto';
typewriterSfxAudio.volume = UI_SFX_VOLUME;

const winMusicAudio = new Audio(winMusicUrl);
winMusicAudio.loop = true;
winMusicAudio.preload = 'auto';
winMusicAudio.volume = WIN_MUSIC_VOLUME;

let levelMusicAudio = null;
let fadingLevelMusicAudio = null;
let activeUiHoverSfxAudio = null;
const levelSoundtrackAudioCache = new Map();

const thunderstormOneAudio = new Audio(thunderstormOneUrl);
thunderstormOneAudio.preload = 'auto';
thunderstormOneAudio.volume = MENU_THUNDER_ONE_VOLUME;

const thunderstormTwoAudio = new Audio(thunderstormTwoUrl);
thunderstormTwoAudio.preload = 'auto';
thunderstormTwoAudio.volume = MENU_THUNDER_TWO_VOLUME;

const AUDIO_PRELOAD_URLS = Array.from(new Set([
  menuMusicUrl,
  pistolSfxUrl,
  pistolEmptySfxUrl,
  enemyHitSfxUrl,
  enemyExplosionSfxUrl,
  playerHitSfxUrl,
  playerDeathSfxUrl,
  teleportOpenSfxUrl,
  teleportationSfxUrl,
  thunderstormOneUrl,
  thunderstormTwoUrl,
  typewriterSfxUrl,
  uiSfxUrl,
  winMusicUrl,
  roundCornersMusicUrl,
  ...ENEMY_LEVELS.map((levelConfig) => levelConfig.soundtrack).filter(Boolean)
]));

const UI_IMAGE_PRELOAD_URLS = [
  decorationUiUrl,
  heartUiUrl,
  lineUiUrl,
  logoUiUrl,
  pauseUiUrl
];

for (const soundtrackUrl of ENEMY_LEVELS.map((levelConfig) => levelConfig.soundtrack).filter(Boolean)) {
  getLevelSoundtrackAudio(soundtrackUrl);
}

for (const audio of [
  menuMusicAudio,
  pistolSfxAudio,
  pistolEmptySfxAudio,
  enemyHitSfxAudio,
  enemyExplosionSfxAudio,
  playerHitSfxAudio,
  playerDeathSfxAudio,
  teleportOpenSfxAudio,
  teleportationSfxAudio,
  thunderstormOneAudio,
  thunderstormTwoAudio,
  uiHoverSfxAudio,
  typewriterSfxAudio,
  winMusicAudio,
  ...levelSoundtrackAudioCache.values()
]) {
  audio.load();
}

syncAudioMuteState();

const loadedWorldTemplates = {};
const worldSceneFactories = {};
const enemyTemplates = {};
const enemyVisualRadii = {};
const menuSceneFireEffects = [];
const menuSceneStormState = {
  active: false,
  sequenceTime: 0,
  playedThunderOne: false,
  triggeredSecondFlash: false,
  playedThunderTwo: false,
  flashTimer: 0,
  flashStrength: 0,
  phase: 0
};
let spikedEnemyVisualRadius = SPIKED_ENEMY_TARGET_DIAMETER * 0.5;
let activeEnemyHudTarget = null;
const explosionEffects = [];
const enemyProjectiles = [];
const shockwaveEffects = [];
let portalGroup = null;
let portalMaterial = null;

const enemyProjectileGeometry = new THREE.SphereGeometry(0.16, 14, 10);
const fireProjectileMaterial = new THREE.MeshStandardMaterial({
  color: 0xffd15a,
  emissive: 0xff9d00,
  emissiveIntensity: 2.6,
  roughness: 0.35,
  metalness: 0.02
});
const lavaProjectileMaterial = new THREE.MeshStandardMaterial({
  color: 0xff4d00,
  emissive: 0xff2400,
  emissiveIntensity: 2.9,
  roughness: 0.42,
  metalness: 0.03
});

const clock = new THREE.Clock();

const playerCollider = new Capsule(
  new THREE.Vector3(0, PLAYER_RADIUS, 0),
  new THREE.Vector3(0, PLAYER_CAPSULE_TOP, 0),
  PLAYER_RADIUS
);

const playerVelocity = new THREE.Vector3();
const playerSpawn = new THREE.Vector3(0, 2, 0);
const playerDirection = new THREE.Vector3();
const worldBounds = new THREE.Box3();

const cameraEuler = new THREE.Euler(0, 0, 0, 'YXZ');
const cameraQuaternion = new THREE.Quaternion();
const cameraTarget = new THREE.Vector3();
const desiredCameraPosition = new THREE.Vector3();
const cameraRayDirection = new THREE.Vector3();

const tempBox = new THREE.Box3();
const tempBox2 = new THREE.Box3();
const tempVectorA = new THREE.Vector3();
const tempVectorB = new THREE.Vector3();
const tempVectorC = new THREE.Vector3();
const tempVectorD = new THREE.Vector3();
const tempVectorE = new THREE.Vector3();
const tempVectorF = new THREE.Vector3();
const tempVectorG = new THREE.Vector3();
const tempProjectilePreviousCenter = new THREE.Vector3();
const tempNormalMatrix = new THREE.Matrix3();
const tempMatrix4A = new THREE.Matrix4();
const tempMatrix4B = new THREE.Matrix4();
const tempSphere = new THREE.Sphere();
const tempFixedCameraEuler = new THREE.Euler(0, 0, 0, 'XYZ');

const movementVelocity = new THREE.Vector3();
const menuSceneCameraControlPosition = new THREE.Vector3();
const menuSceneCameraControlRotation = new THREE.Euler(0, 0, 0, 'XYZ');
const menuSceneLightPosition = new THREE.Vector3();
const menuSceneLightTargetPosition = new THREE.Vector3();
let menuSceneLightIntensity = 0;
const menuScenePlayerPosition = new THREE.Vector3();
let menuScenePlayerRotationDegrees = 0;
let menuScenePlayerScale = 1;
const obstacleRaycaster = new THREE.Raycaster();
const spawnRaycaster = new THREE.Raycaster();
const aimRaycaster = new THREE.Raycaster();
const playerCapsuleLine = new THREE.Line3();

const glowCubeGeometry = new THREE.BoxGeometry(0.34, 0.34, 0.34);
const { bulletGeometry, bulletMaterial, explosionParticleGeometry } = createCombatFxResources();

const playerVisual = new THREE.Group();
scene.add(playerVisual);
const avatarRoot = new THREE.Group();
playerVisual.add(avatarRoot);
const fallbackAvatar = new THREE.Group();
playerVisual.add(fallbackAvatar);
const characterKeyLight = new THREE.PointLight(0xf4fbff, 1.7, 5.5, 2);
characterKeyLight.position.set(0.45, 1.9, 1.35);
characterKeyLight.castShadow = false;
avatarRoot.add(characterKeyLight);
const characterFillLight = new THREE.PointLight(0x7fd6ff, 0.8, 4.25, 2);
characterFillLight.position.set(-0.75, 1.45, 0.7);
characterFillLight.castShadow = false;
avatarRoot.add(characterFillLight);

const bodyMaterial = new THREE.MeshStandardMaterial({
  color: 0x32424f,
  roughness: 0.78,
  metalness: 0.08
});

const headMaterial = new THREE.MeshStandardMaterial({
  color: 0x90a8b4,
  roughness: 0.6,
  metalness: 0.04
});

const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.95, 6, 12), bodyMaterial);
torso.position.y = 1.02;
torso.castShadow = true;
torso.receiveShadow = true;
fallbackAvatar.add(torso);

const shoulders = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.24), bodyMaterial);
shoulders.position.y = 1.55;
shoulders.castShadow = true;
shoulders.receiveShadow = true;
fallbackAvatar.add(shoulders);

const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 18), headMaterial);
head.position.y = 1.92;
head.castShadow = true;
head.receiveShadow = true;
fallbackAvatar.add(head);

const fallbackGunMountPosition = new THREE.Vector3(0.44, 1.42, -0.1);
const fallbackGunMountRotation = new THREE.Euler(-0.1, 0.2, 0.08);
const fallbackMuzzlePosition = new THREE.Vector3(0.06, 0.02, -0.72);
const characterGunMountPosition = new THREE.Vector3(-0.403, -0.186, -0.025);
const characterGunMountRotation = new THREE.Euler(0.096, 0.026, 0.288);
const characterGunModelPosition = new THREE.Vector3(-1.5, -1.411, 0.242);
const characterGunModelRotation = new THREE.Euler(
  THREE.MathUtils.degToRad(-8),
  THREE.MathUtils.degToRad(2.5),
  THREE.MathUtils.degToRad(-105.5)
);
let characterGunScaleMultiplier = 2.85;
const fallbackCharacterMuzzlePosition = new THREE.Vector3(-0.024, -0.033, -1.494);
const characterMuzzlePosition = fallbackCharacterMuzzlePosition.clone();

const gunMount = new THREE.Group();
gunMount.position.copy(fallbackGunMountPosition);
gunMount.rotation.copy(fallbackGunMountRotation);
playerVisual.add(gunMount);

const muzzleAnchor = new THREE.Object3D();
muzzleAnchor.position.copy(fallbackMuzzlePosition);
gunMount.add(muzzleAnchor);

const muzzleFlash = new THREE.PointLight(0xffdfb1, 0, 4, 2);
muzzleFlash.visible = false;
muzzleFlash.position.set(0, 0, 0);
muzzleAnchor.add(muzzleFlash);

const fallbackGun = new THREE.Mesh(
  new THREE.BoxGeometry(0.16, 0.12, 0.62),
  new THREE.MeshStandardMaterial({
    color: 0xb7c0cc,
    roughness: 0.45,
    metalness: 0.3
  })
);
fallbackGun.position.set(0.08, -0.05, -0.32);
fallbackGun.castShadow = true;
fallbackGun.receiveShadow = true;
gunMount.add(fallbackGun);

const gunBasePosition = fallbackGunMountPosition.clone();
const gunBaseRotation = fallbackGunMountRotation.clone();
const weaponLookSway = new THREE.Vector2();
const weaponSway = new THREE.Vector2();
let walkBob = 0;
let recoilBack = 0;
let recoilUp = 0;
let recoilTwist = 0;
const characterActions = {};
let playerGunModel = null;
const enemyPoolSize = Math.max(SPIKED_ENEMY_COUNT, ...ENEMY_LEVELS.map((level) => level.enemies.length));
const spikedEnemies = createSpikedEnemies({
  scene,
  count: enemyPoolSize,
  targetDiameter: SPIKED_ENEMY_TARGET_DIAMETER,
  maxHp: SPIKED_ENEMY_MAX_HP
});

function updateSceneToggleLabel() {
  const label = sceneToggleButton.querySelector('.scene-button__label');
  label.textContent = `Scene: ${getActiveSceneLabel()}`;
}

function updateSceneSelectorButtons() {
  for (const button of document.querySelectorAll('[data-scene]')) {
    button.classList.toggle('is-active', button.dataset.scene === activeSceneKey);
  }
}

function isGameplayBlocked() {
  return sceneSelectorOpen || pauseMenuOpen;
}

function refreshHudMessage() {
  if (!sceneReady) {
    setHudMessage(
      'Loading all assets.<br /><span class="hud__hint">The game will start after both scenes, all enemy types, character, weapon, and textures are ready.</span>'
    );
    return;
  }

  if (menuSceneViewOpen) {
    setHudMessage(
      'Menu scene view.<br /><span class="hud__hint">Press Play to start, Controls to change level setup, or Music/SFX to toggle audio.</span>'
    );
    return;
  }

  if (pauseMenuOpen) {
    setHudMessage(
      `Paused in ${getActiveSceneLabel()} on ${getCurrentLevelLabel()}.<br /><span class="hud__hint">Press P or click Resume to continue, or switch scenes from the pause menu.</span>`
    );
    return;
  }

  if (startScreenOpen) {
    setHudMessage(
      'Choose a scene and starting wave.<br /><span class="hud__hint">The run starts from the main menu Play button.</span>'
    );
    return;
  }

  if (gameState === 'levelcomplete') {
    setHudMessage(
      `${getCurrentLevelLabel()} cleared.<br /><span class="hud__hint">Use the Next button to continue the campaign.</span>`
    );
    return;
  }

  if (gameState === 'portal') {
    setHudMessage(
      `${getCurrentLevelLabel()} cleared.<br /><span class="hud__hint">Enter the green portal to choose an upgrade.</span>`
    );
    return;
  }

  if (gameState === 'dying') {
    setHudMessage(
      `${getCurrentLevelLabel()} failed.<br /><span class="hud__hint">Recovering combat state.</span>`
    );
    return;
  }

  if (gameState === 'gameover') {
    setHudMessage(
      `${getCurrentLevelLabel()} failed.<br /><span class="hud__hint">Use Retry to restart the current wave.</span>`
    );
    return;
  }

  if (sceneSelectorOpen) {
    setHudMessage(
      `Scene selector open.<br /><span class="hud__hint">Choose ${getSceneLabelList()}, then click the canvas to continue.</span>`
    );
    return;
  }

  if (document.pointerLockElement === renderer.domElement) {
    setHudMessage(
      `${getActiveSceneLabel()} online. ${getCurrentLevelLabel()}.<br /><span class="hud__hint">WASD move, Shift sprint, Space jump, hold Alt to orbit, hold left click to fire, press P for pause, click the S button to switch scenes.</span>`
    );
  } else {
    setHudMessage(
      `Click to lock the cursor for ${getCurrentLevelLabel()}.<br /><span class="hud__hint">WASD move, Shift sprint, Space jump, hold Alt to orbit, hold left click to fire, press P for pause, click the S button to switch scenes.</span>`
    );
  }
}

function setSceneSelectorOpen(open) {
  if (open && (!sceneReady || gameState !== 'playing')) {
    return;
  }

  sceneSelectorOpen = open;
  sceneSelector.hidden = !open;

  if (open) {
    gameStateBeforePause = gameState;
    clearInputState();

    if (document.pointerLockElement === renderer.domElement) {
      document.exitPointerLock();
    }
  }

  refreshHudMessage();
}

async function switchPlayableSceneWithTransition(nextSceneKey) {
  if (!sceneReady || !getPlayableSceneConfig(nextSceneKey)) {
    return;
  }

  if (nextSceneKey === activeSceneKey) {
    setSceneSelectorOpen(false);
    return;
  }

  gameState = 'transition';
  triggerHeld = false;
  clearInputState();

  await fadeToBlack();
  setSceneSelectorOpen(false);
  showLoaderScreen('Switching Scene', `Activating ${WORLD_SCENES[nextSceneKey].label}.`);
  updateLoaderScreen('Switching Scene', `Activating ${WORLD_SCENES[nextSceneKey].label}.`, 1, 1);
  campaignSceneKey = nextSceneKey;
  applyWorldScene(nextSceneKey);
  hideLoaderScreen();
  await fadeFromBlack();
}

function setPauseMenuOpen(open, { relock = false } = {}) {
  if (
    open &&
    (
      !sceneReady ||
      gameState === 'loading' ||
      gameState === 'error' ||
      gameState === 'gameover' ||
      gameState === 'levelcomplete' ||
      gameState === 'dying' ||
      gameState === 'transition' ||
      gameState === 'cutscene' ||
      gameState === 'upgrading'
    )
  ) {
    return;
  }

  pauseMenuOpen = open;
  pauseMenu.hidden = !open;
  syncScreenVisibility();

  if (open) {
    clearInputState();

    if (sceneSelectorOpen) {
      sceneSelectorOpen = false;
      sceneSelector.hidden = true;
    }

    if (document.pointerLockElement === renderer.domElement) {
      document.exitPointerLock();
    }

    gameState = 'paused';
  } else if (sceneReady && gameState !== 'gameover' && gameState !== 'levelcomplete' && gameState !== 'error') {
    gameState = gameStateBeforePause === 'portal' ? 'portal' : 'playing';

    if (relock && document.pointerLockElement !== renderer.domElement) {
      renderer.domElement.requestPointerLock();
    }
  }

  refreshHudMessage();
}

function updateHud() {
  activeEnemyHudTarget = updateHudUi(ui, {
    hp,
    ammo,
    maxHp: PLAYER_MAX_HP_CAP,
    maxAmmo: WEAPON_MAGAZINE_CAP,
    levelProgressText: getCurrentLevelProgressText(),
    enemyLabel: currentLevelConfig.enemyLabel,
    activeEnemyHudTarget,
    spikedEnemies,
    enemyMaxHp: activeEnemyHudTarget?.maxHp ?? currentLevelConfig.enemies?.[0]?.hp ?? 100
  });
}

function updateFps(fps) {
  updateFpsUi(ui, fps);
}

function setHudMessage(text) {
  setHudMessageUi(ui, text);
}

function clearBullets() {
  clearBulletsFx({ bullets, scene });
}

function clearExplosionEffects() {
  clearExplosionEffectsFx({ explosionEffects, scene });
}

function clearGlowCubes() {
  clearGlowCubesWorld({ glowCubes, scene });
}

function clearWorldScene() {
  clearPortal();
  clearEnemyProjectiles();
  clearShockwaveEffects();
  const nextState = clearWorldSceneWorld({
    scene,
    currentWorldRoot,
    currentCollisionRoot,
    worldMeshes,
    worldOctree,
    worldBounds,
    clearGlowCubes,
    clearExplosionEffects,
    clearMenuSceneEffects
  });
  currentWorldRoot = nextState.currentWorldRoot;
  currentCollisionRoot = nextState.currentCollisionRoot;
  worldFloor = nextState.worldFloor;
}

function loadTracked(label, loader) {
  return loader().then((asset) => {
    loaderState.loaded += 1;
    updateLoaderScreen(
      'Loading Assets',
      `Loaded ${label.toLowerCase()}.`,
      loaderState.loaded,
      loaderState.total
    );
    return asset;
  });
}

function prepareEnemyTemplate(enemyKey, root) {
  const visualRadius = prepareEnemyTemplateEnemies({
    renderer,
    root,
    tempBox,
    tempVectorA,
    tempVectorB,
    tempVectorC,
    targetDiameter: SPIKED_ENEMY_TARGET_DIAMETER,
    spikedEnemies
  });
  enemyVisualRadii[enemyKey] = visualRadius;
  spikedEnemyVisualRadius = visualRadius;
}

function cloneMeshMaterial(mesh) {
  if (!mesh?.isMesh || !mesh.material) {
    return null;
  }

  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map((material) => material?.clone?.() ?? material);
    return mesh.material[0] ?? null;
  }

  mesh.material = mesh.material.clone?.() ?? mesh.material;
  return mesh.material;
}

let fireSunNoiseTexture = null;
let fireSunLavaTexture = null;
let magicBallLavaTexture = null;
let crystalBallLavaTexture = null;
let electricBallNoiseTexture = null;
let electricBallDetailTexture = null;

function createFireSunNoiseTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  const image = context.createImageData(size, size);
  const data = image.data;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = x / size - 0.5;
      const ny = y / size - 0.5;
      const ripple = Math.sin((x + y) * 0.09) * 0.22;
      const swirls =
        Math.cos(x * 0.17 - y * 0.12) * 0.2 +
        Math.sin(Math.hypot(nx, ny) * 24.0) * 0.16 +
        Math.cos((x * 0.05 + y * 0.08) * 6.0) * 0.11;
      const value = THREE.MathUtils.clamp(0.5 + ripple + swirls, 0, 1);
      const color = Math.round(value * 255);
      const index = (y * size + x) * 4;
      data[index] = color;
      data[index + 1] = color;
      data[index + 2] = color;
      data[index + 3] = color;
    }
  }

  context.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function samplePalette(stops, t) {
  for (let i = 1; i < stops.length; i += 1) {
    const [endT, endColor] = stops[i];
    if (t <= endT) {
      const [startT, startColor] = stops[i - 1];
      const alpha = THREE.MathUtils.inverseLerp(startT, endT, t);
      return startColor.clone().lerp(endColor, alpha);
    }
  }

  return stops[stops.length - 1][1].clone();
}

function createLavaPaletteTexture(stops) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  const image = context.createImageData(size, size);
  const data = image.data;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / (size - 1);
      const v = y / (size - 1);
      const band =
        Math.sin(v * Math.PI * 6.0) * 0.05 +
        Math.cos((u + v) * Math.PI * 5.0) * 0.04 +
        Math.sin(u * Math.PI * 9.0) * 0.03;
      const color = samplePalette(stops, THREE.MathUtils.clamp(u + band, 0, 1));
      const index = (y * size + x) * 4;
      data[index] = Math.round(color.r * 255);
      data[index + 1] = Math.round(color.g * 255);
      data[index + 2] = Math.round(color.b * 255);
      data[index + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function createFireSunLavaTexture() {
  return createLavaPaletteTexture([
    [0.0, new THREE.Color(0x2a0300)],
    [0.18, new THREE.Color(0x6a0d00)],
    [0.42, new THREE.Color(0xc13a00)],
    [0.7, new THREE.Color(0xff8a00)],
    [0.9, new THREE.Color(0xffd35a)],
    [1.0, new THREE.Color(0xfff1c7)]
  ]);
}

function createMagicBallLavaTexture() {
  return createLavaPaletteTexture([
    [0.0, new THREE.Color(0x00150d)],
    [0.2, new THREE.Color(0x003a1c)],
    [0.44, new THREE.Color(0x00873d)],
    [0.7, new THREE.Color(0x1fe06a)],
    [0.88, new THREE.Color(0x8dffb7)],
    [1.0, new THREE.Color(0xe6fff1)]
  ]);
}

function createCrystalBallLavaTexture() {
  return createLavaPaletteTexture([
    [0.0, new THREE.Color(0x11001f)],
    [0.18, new THREE.Color(0x31005f)],
    [0.42, new THREE.Color(0x5c1ab6)],
    [0.7, new THREE.Color(0x8a4dff)],
    [0.9, new THREE.Color(0xc695ff)],
    [1.0, new THREE.Color(0xf1dcff)]
  ]);
}

function getFireSunShaderTextures() {
  if (!fireSunNoiseTexture) {
    fireSunNoiseTexture = createFireSunNoiseTexture();
  }

  if (!fireSunLavaTexture) {
    fireSunLavaTexture = createFireSunLavaTexture();
  }

  return {
    noiseTexture: fireSunNoiseTexture,
    lavaTexture: fireSunLavaTexture
  };
}

function getMagicBallShaderTextures() {
  if (!fireSunNoiseTexture) {
    fireSunNoiseTexture = createFireSunNoiseTexture();
  }

  if (!magicBallLavaTexture) {
    magicBallLavaTexture = createMagicBallLavaTexture();
  }

  return {
    noiseTexture: fireSunNoiseTexture,
    lavaTexture: magicBallLavaTexture
  };
}

function getCrystalBallShaderTextures() {
  if (!fireSunNoiseTexture) {
    fireSunNoiseTexture = createFireSunNoiseTexture();
  }

  if (!crystalBallLavaTexture) {
    crystalBallLavaTexture = createCrystalBallLavaTexture();
  }

  return {
    noiseTexture: fireSunNoiseTexture,
    lavaTexture: crystalBallLavaTexture
  };
}

function createElectricBallNoiseTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  const image = context.createImageData(size, size);
  const data = image.data;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = x / size - 0.5;
      const ny = y / size - 0.5;
      const pseudo = Math.sin((x + 17) * 12.9898 + (y + 11) * 78.233) * 43758.5453;
      const grain = pseudo - Math.floor(pseudo);
      const waves =
        Math.sin((x * 0.19 + y * 0.07) * 7.0) * 0.24 +
        Math.cos((x * 0.08 - y * 0.22) * 5.0) * 0.2 +
        Math.sin(Math.hypot(nx, ny) * 28.0) * 0.18;
      const value = THREE.MathUtils.clamp(0.5 + waves + (grain - 0.5) * 0.34, 0, 1);
      const color = Math.round(value * 255);
      const index = (y * size + x) * 4;
      data[index] = color;
      data[index + 1] = color;
      data[index + 2] = color;
      data[index + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function createElectricBallDetailTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  const image = context.createImageData(size, size);
  const data = image.data;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const v = y / size;
      const pseudo = Math.sin((x + 41) * 8.123 + (y + 29) * 35.517) * 23421.631;
      const grain = pseudo - Math.floor(pseudo);
      const streaks =
        Math.sin((u * 13.0 + v * 3.0) * Math.PI) * 0.3 +
        Math.cos((u * 4.0 - v * 15.0) * Math.PI) * 0.22 +
        Math.sin((u + v) * Math.PI * 12.0) * 0.16;
      const value = THREE.MathUtils.clamp(0.48 + streaks + (grain - 0.5) * 0.5, 0, 1);
      const color = Math.round(value * 255);
      const index = (y * size + x) * 4;
      data[index] = color;
      data[index + 1] = color;
      data[index + 2] = color;
      data[index + 3] = color;
    }
  }

  context.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function getElectricBallShaderTextures() {
  if (!electricBallNoiseTexture) {
    electricBallNoiseTexture = createElectricBallNoiseTexture();
  }

  if (!electricBallDetailTexture) {
    electricBallDetailTexture = createElectricBallDetailTexture();
  }

  return {
    noiseTexture: electricBallNoiseTexture,
    detailTexture: electricBallDetailTexture
  };
}

function createLavaFlowMaterial({
  uvScale = new THREE.Vector2(3.2, 1.8),
  flowDirectionA = new THREE.Vector2(1.5, -1.5),
  flowDirectionB = new THREE.Vector2(-0.5, 2.0),
  flowRateA = 0.02,
  flowRateB = 0.01,
  noiseWarpA = 2.0,
  noiseWarpB = 0.25,
  displacementScale = 1,
  pulseDisplacement = 1,
  brightness = 1.04,
  pulseBrightness = 0.18,
  flickerInfluence = 0.55,
  edgeMix = 0.22,
  edgeColor = new THREE.Color(0xfff2c7),
  lavaTexture = null
} = {}) {
  const { noiseTexture, lavaTexture: defaultLavaTexture } = getFireSunShaderTextures();

  return new THREE.ShaderMaterial({
    toneMapped: false,
    uniforms: {
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uFlicker: { value: 1 },
      uUvScale: { value: uvScale.clone() },
      uFlowDirectionA: { value: flowDirectionA.clone() },
      uFlowDirectionB: { value: flowDirectionB.clone() },
      uFlowRateA: { value: flowRateA },
      uFlowRateB: { value: flowRateB },
      uNoiseWarpA: { value: noiseWarpA },
      uNoiseWarpB: { value: noiseWarpB },
      uDisplacementScale: { value: displacementScale },
      uPulseDisplacement: { value: pulseDisplacement },
      uBrightness: { value: brightness },
      uPulseBrightness: { value: pulseBrightness },
      uFlickerInfluence: { value: flickerInfluence },
      uEdgeMix: { value: edgeMix },
      uEdgeColor: { value: edgeColor.clone() },
      uNoiseTexture: { value: noiseTexture },
      uLavaTexture: { value: lavaTexture ?? defaultLavaTexture }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uPulse;
      uniform float uDisplacementScale;
      uniform float uPulseDisplacement;
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vViewDir;
      const float PI = 3.141592653589793;

      vec2 sphereUv( vec3 p ) {
        vec3 n = normalize( p );
        float u = atan( n.z, n.x ) / ( 2.0 * PI ) + 0.5;
        float v = asin( clamp( n.y, -1.0, 1.0 ) ) / PI + 0.5;
        return vec2( u, v );
      }

      void main() {
        vec3 dir = normalize( position );
        vUv = sphereUv( dir );

        float plasmaWave =
          sin( dir.y * 16.0 + uTime * 2.4 ) * 0.012 +
          cos( dir.x * 13.0 - uTime * 2.0 ) * 0.01 +
          sin( ( dir.z + dir.x ) * 11.0 + uTime * 3.1 ) * 0.008;

        vec3 displaced = position + normal * ( plasmaWave * uDisplacementScale + uPulse * 0.004 * uPulseDisplacement );
        vec4 worldPosition = modelMatrix * vec4( displaced, 1.0 );
        vWorldNormal = normalize( mat3( modelMatrix ) * normal );
        vViewDir = cameraPosition - worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uPulse;
      uniform float uFlicker;
      uniform vec2 uUvScale;
      uniform vec2 uFlowDirectionA;
      uniform vec2 uFlowDirectionB;
      uniform float uFlowRateA;
      uniform float uFlowRateB;
      uniform float uNoiseWarpA;
      uniform float uNoiseWarpB;
      uniform float uBrightness;
      uniform float uPulseBrightness;
      uniform float uFlickerInfluence;
      uniform float uEdgeMix;
      uniform vec3 uEdgeColor;
      uniform sampler2D uNoiseTexture;
      uniform sampler2D uLavaTexture;
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vViewDir;

      void main() {
        vec2 uv = vUv * uUvScale;
        vec4 noise = texture2D( uNoiseTexture, uv );

        vec2 T1 = uv + uFlowDirectionA * uTime * uFlowRateA;
        vec2 T2 = uv + uFlowDirectionB * uTime * uFlowRateB;
        T1.x += noise.r * uNoiseWarpA;
        T1.y += noise.g * uNoiseWarpA;
        T2.x -= noise.g * uNoiseWarpB;
        T2.y += noise.b * uNoiseWarpB;

        float p = texture2D( uNoiseTexture, T1 * 2.0 ).a;
        vec4 color = texture2D( uLavaTexture, T2 * 1.5 );
        vec3 lava = color.rgb * ( vec3( p ) * 2.15 ) + ( color.rgb * color.rgb - 0.12 );

        if ( lava.r > 1.0 ) lava.gb += clamp( lava.r - 1.0, 0.0, 1.0 ) * 0.24;
        if ( lava.g > 1.0 ) lava.rb += clamp( lava.g - 1.0, 0.0, 1.0 ) * 0.12;
        if ( lava.b > 1.0 ) lava.rg += clamp( lava.b - 1.0, 0.0, 1.0 ) * 0.08;

        float fresnel = pow( 1.0 - max( dot( normalize( vWorldNormal ), normalize( vViewDir ) ), 0.0 ), 2.0 );
        lava = mix( lava, uEdgeColor, fresnel * uEdgeMix );
        lava *= uBrightness + uPulse * uPulseBrightness + ( uFlicker - 1.0 ) * uFlickerInfluence;

        gl_FragColor = vec4( lava, 1.0 );
      }
    `
  });
}

function createFireSunCoreMaterial() {
  return createLavaFlowMaterial();
}

function createLavaBallCoreMaterial() {
  return createLavaFlowMaterial({
    uvScale: new THREE.Vector2(2.8, 1.55),
    flowDirectionA: new THREE.Vector2(1.2, -0.9),
    flowDirectionB: new THREE.Vector2(-0.35, 1.45),
    flowRateA: 0.013,
    flowRateB: 0.007,
    noiseWarpA: 1.55,
    noiseWarpB: 0.2,
    displacementScale: 0.72,
    pulseDisplacement: 0.7,
    brightness: 0.98,
    pulseBrightness: 0.12,
    flickerInfluence: 0.38,
    edgeMix: 0.16,
    edgeColor: new THREE.Color(0xffdfbb)
  });
}

function createMagicBallCoreMaterial() {
  return createLavaFlowMaterial({
    uvScale: new THREE.Vector2(2.55, 1.9),
    flowDirectionA: new THREE.Vector2(1.1, -1.25),
    flowDirectionB: new THREE.Vector2(-0.65, 1.55),
    flowRateA: 0.018,
    flowRateB: 0.012,
    noiseWarpA: 1.75,
    noiseWarpB: 0.22,
    displacementScale: 0.84,
    pulseDisplacement: 0.9,
    brightness: 1.02,
    pulseBrightness: 0.15,
    flickerInfluence: 0.32,
    edgeMix: 0.2,
    edgeColor: new THREE.Color(0xe1fff1),
    lavaTexture: getMagicBallShaderTextures().lavaTexture
  });
}

function createCrystalBallCoreMaterial() {
  return createLavaFlowMaterial({
    uvScale: new THREE.Vector2(2.7, 1.7),
    flowDirectionA: new THREE.Vector2(1.25, -1.1),
    flowDirectionB: new THREE.Vector2(-0.4, 1.7),
    flowRateA: 0.016,
    flowRateB: 0.009,
    noiseWarpA: 1.7,
    noiseWarpB: 0.2,
    displacementScale: 0.64,
    pulseDisplacement: 0.72,
    brightness: 1.02,
    pulseBrightness: 0.16,
    flickerInfluence: 0.28,
    edgeMix: 0.24,
    edgeColor: new THREE.Color(0xf2dcff),
    lavaTexture: getCrystalBallShaderTextures().lavaTexture
  });
}

function createElectricBallCoreMaterial() {
  const { noiseTexture, detailTexture } = getElectricBallShaderTextures();

  return new THREE.ShaderMaterial({
    toneMapped: false,
    uniforms: {
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uFlicker: { value: 1 },
      uBrightness: { value: 2.15 },
      uNoiseTexture: { value: noiseTexture },
      uDetailTexture: { value: detailTexture }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uPulse;
      varying vec3 vLocalDir;
      varying vec3 vWorldNormal;
      varying vec3 vViewDir;

      void main() {
        vec3 dir = normalize( position );
        float wave =
          sin( dir.y * 18.0 + uTime * 6.4 ) * 0.004 +
          cos( dir.x * 15.0 - uTime * 5.3 ) * 0.003 +
          sin( ( dir.z + dir.x ) * 13.0 + uTime * 7.1 ) * 0.0025;
        vec3 displaced = position + normal * wave * ( 0.7 + uPulse * 0.35 );
        vec4 worldPosition = modelMatrix * vec4( displaced, 1.0 );
        vLocalDir = normalize( displaced );
        vWorldNormal = normalize( mat3( modelMatrix ) * normal );
        vViewDir = cameraPosition - worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uPulse;
      uniform float uFlicker;
      uniform float uBrightness;
      uniform sampler2D uNoiseTexture;
      uniform sampler2D uDetailTexture;
      varying vec3 vLocalDir;
      varying vec3 vWorldNormal;
      varying vec3 vViewDir;
      const float PI = 3.141592653589793;

      void main() {
        vec3 dir = normalize( vLocalDir );
        float angle = atan( dir.z, dir.x ) / PI + 1.0;
        float p = clamp( 1.0 - abs( dir.y ), 0.0, 1.0 );
        vec2 uv = vec2( p, angle * 0.5 ) * vec2( 1.8, 1.25 );
        float time = uTime;

        vec3 lightning = vec3( 0.0 );
        for ( int i = 1; i <= 5; i++ ) {
          float fi = float( i );
          float intensive = 0.09 + 0.065 * fi;
          vec2 offset = ( texture2D( uNoiseTexture, vec2( time * 0.35 * ( 0.5 + fract( sin( fi * 55.0 ) ) ), angle ) ).rg - vec2( 0.5 ) ) * intensive;
          vec2 uuv = uv + offset;
          float dist = max( abs( uuv.x - 0.58 ), 0.025 );
          float randSpeed = 0.2 + 0.05 * fract( cos( fi * 1144.0 ) );
          float gone = smoothstep(
            0.12 + 0.05 * ( fi - 0.5 ),
            1.0,
            texture2D( uDetailTexture, uv + vec2( time * randSpeed, -time * 0.08 ) ).r
          );
          float sparkMask = texture2D( uDetailTexture, uuv + vec2( time, -time * 0.3 ) ).r;
          vec3 boltColor = mix( vec3( 0.03, 0.26, 1.0 ), vec3( 0.44, 0.72, 1.0 ), gone );
          lightning += gone * boltColor / dist * 0.0085 * sparkMask;
        }

        float shell = smoothstep( 1.0, -1.4, abs( uv.x - 0.58 ) * 2.25 ) * texture2D( uDetailTexture, uv * 0.75 + vec2( time * 0.1, time * 0.06 ) ).a;
        float fresnel = pow( 1.0 - max( dot( normalize( vWorldNormal ), normalize( vViewDir ) ), 0.0 ), 2.5 );
        vec3 base = mix( vec3( 0.02, 0.08, 0.46 ), vec3( 0.16, 0.44, 0.95 ), 0.45 + uPulse * 0.25 );
        vec3 glow = base * ( 0.55 + shell * 0.9 + fresnel * 0.8 );
        vec3 color = glow + lightning * uBrightness;
        color *= 0.96 + ( uFlicker - 1.0 ) * 0.9;
        color += vec3( 0.36, 0.6, 1.0 ) * fresnel * 0.14;

        gl_FragColor = vec4( color, 1.0 );
      }
    `
  });
}

function createFireSunAuraMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    toneMapped: false,
    uniforms: {
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uColorA: { value: new THREE.Color(0xff7f11) },
      uColorB: { value: new THREE.Color(0xffe18a) }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uPulse;
      varying vec3 vWorldNormal;
      varying vec3 vViewDir;
      varying float vWave;

      void main() {
        float wave =
          sin(position.y * 12.0 + uTime * 2.2) * 0.018 +
          cos(position.x * 10.0 - uTime * 1.7) * 0.013 +
          sin((position.z + position.x) * 8.0 + uTime * 2.8) * 0.012;
        vec3 displaced = position + normal * (wave + uPulse * 0.014);
        vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vViewDir = cameraPosition - worldPosition.xyz;
        vWave = wave;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uPulse;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec3 vWorldNormal;
      varying vec3 vViewDir;
      varying float vWave;

      void main() {
        float fresnel = pow(1.0 - max(dot(normalize(vWorldNormal), normalize(vViewDir)), 0.0), 2.4);
        float wave = 0.5 + 0.5 * sin(uTime * 3.1 + vWave * 24.0 + vWorldNormal.y * 6.5);
        vec3 color = mix(uColorA, uColorB, wave) * (0.65 + fresnel * 0.95);
        float alpha = fresnel * (0.18 + uPulse * 0.14) * (0.82 + wave * 0.28);
        gl_FragColor = vec4(color, alpha);
      }
    `
  });
}

function configureElectricBallRuntime(root) {
  if (!root || root.userData.electricBallFx) {
    return;
  }

  const core = root.getObjectByName('ElectricBall_Core');
  const bolts = root.getObjectByName('ElectricBall_Bolts');
  const sparks = root.getObjectByName('ElectricBall_Sparks');

  if (!core || !bolts || !sparks || !core.isMesh || !bolts.isMesh || !sparks.isMesh) {
    return;
  }

  const coreMaterial = createElectricBallCoreMaterial();
  core.material = coreMaterial;

  const boltsMaterial = cloneMeshMaterial(bolts) ?? new THREE.MeshStandardMaterial();
  boltsMaterial.color?.set(0x4ba8ff);
  boltsMaterial.emissive?.set(0x6eb6ff);
  boltsMaterial.emissiveIntensity = 3.45;
  boltsMaterial.roughness = 0.08;
  boltsMaterial.metalness = 0;
  boltsMaterial.toneMapped = false;
  boltsMaterial.needsUpdate = true;
  bolts.material = boltsMaterial;

  const sparksMaterial = cloneMeshMaterial(sparks) ?? new THREE.MeshStandardMaterial();
  sparksMaterial.color?.set(0x9ed3ff);
  sparksMaterial.emissive?.set(0xb7ddff);
  sparksMaterial.emissiveIntensity = 4.05;
  sparksMaterial.roughness = 0.04;
  sparksMaterial.metalness = 0;
  sparksMaterial.toneMapped = false;
  sparksMaterial.needsUpdate = true;
  sparks.material = sparksMaterial;

  root.userData.electricBallFx = {
    core,
    bolts,
    sparks,
    coreMaterial,
    boltsMaterial,
    sparksMaterial,
    boltsBaseEmissive: boltsMaterial.emissiveIntensity,
    sparksBaseEmissive: sparksMaterial.emissiveIntensity,
    phase: Math.random() * Math.PI * 2
  };
}

function configureCrystalBallLightningRuntime(root) {
  if (!root || root.userData.crystalBallFx) {
    return;
  }

  const core = root.getObjectByName('CrystalBallLightning_Core');
  const particles = root.getObjectByName('CrystalBallLightning_Particles');

  if (!core || !particles || !core.isMesh) {
    return;
  }

  const particleMeshes = [];
  particles.traverse((child) => {
    if (child.isMesh) {
      particleMeshes.push(child);
    }
  });

  if (particleMeshes.length === 0) {
    return;
  }

  const coreMaterial = createCrystalBallCoreMaterial();
  core.material = coreMaterial;

  const particleMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xc796ff),
    emissive: new THREE.Color(0x8f4dff),
    emissiveIntensity: 1.8,
    roughness: 0.14,
    metalness: 0,
    toneMapped: false
  });

  for (const mesh of particleMeshes) {
    mesh.material = particleMaterial;
  }

  root.userData.crystalBallFx = {
    core,
    particles,
    particleMeshes,
    coreMaterial,
    particleMaterial,
    particleBaseEmissive: particleMaterial.emissiveIntensity,
    phase: Math.random() * Math.PI * 2
  };
}

function configureMagicBallRuntime(root) {
  if (!root || root.userData.magicBallFx) {
    return;
  }

  const core = root.getObjectByName('MagicBall_Core');
  const particles = root.getObjectByName('MagicBall_Particles');
  const swirlA = root.getObjectByName('MagicBall_SwirlA');
  const swirlB = root.getObjectByName('MagicBall_SwirlB');
  const swirlC = root.getObjectByName('MagicBall_SwirlC');

  if (
    !core ||
    !particles ||
    !swirlA ||
    !swirlB ||
    !swirlC ||
    !core.isMesh ||
    !particles.isMesh ||
    !swirlA.isMesh ||
    !swirlB.isMesh ||
    !swirlC.isMesh
  ) {
    return;
  }

  const coreMaterial = createMagicBallCoreMaterial();
  core.material = coreMaterial;

  const particleMaterial = cloneMeshMaterial(particles) ?? new THREE.MeshStandardMaterial();
  particleMaterial.color?.set(0xcffff0);
  particleMaterial.emissive?.set(0x8dffc4);
  particleMaterial.emissiveIntensity = 3.2;
  particleMaterial.roughness = 0.08;
  particleMaterial.metalness = 0;
  particleMaterial.toneMapped = false;
  particleMaterial.needsUpdate = true;
  particles.material = particleMaterial;

  const swirls = [swirlA, swirlB, swirlC];
  const swirlMaterials = swirls.map((swirl) => {
    const material = cloneMeshMaterial(swirl) ?? new THREE.MeshStandardMaterial();
    material.color?.set(0x68ff9f);
    material.emissive?.set(0x39ff8d);
    material.emissiveIntensity = 2.35;
    material.roughness = 0.16;
    material.metalness = 0;
    material.toneMapped = false;
    material.needsUpdate = true;
    swirl.material = material;
    return material;
  });

  root.userData.magicBallFx = {
    core,
    particles,
    swirls,
    coreMaterial,
    particleMaterial,
    swirlMaterials,
    particleBaseEmissive: particleMaterial.emissiveIntensity,
    swirlBaseEmissive: swirlMaterials.map((material) => material.emissiveIntensity),
    phase: Math.random() * Math.PI * 2
  };
}

function configureLavaBallRuntime(root) {
  if (!root || root.userData.lavaBallFx) {
    return;
  }

  const core = root.getObjectByName('LavaBall_Core');
  const crust = root.getObjectByName('LavaBall_Crust');
  const cinders = root.getObjectByName('LavaBall_Cinders');

  if (!core || !crust || !cinders || !core.isMesh || !crust.isMesh || !cinders.isMesh) {
    return;
  }

  const coreMaterial = createLavaBallCoreMaterial();
  core.material = coreMaterial;

  const crustMaterial = cloneMeshMaterial(crust) ?? new THREE.MeshStandardMaterial();
  crustMaterial.color?.set(0x2a1711);
  crustMaterial.emissive?.set(0x120705);
  crustMaterial.emissiveIntensity = 0.45;
  crustMaterial.roughness = 0.9;
  crustMaterial.metalness = 0;
  crust.material = crustMaterial;

  const cinderMaterial = cloneMeshMaterial(cinders) ?? new THREE.MeshStandardMaterial();
  cinderMaterial.color?.set(0xff7e2c);
  cinderMaterial.emissive?.set(0xff8f33);
  cinderMaterial.emissiveIntensity = 2.8;
  cinderMaterial.roughness = 0.22;
  cinderMaterial.metalness = 0;
  cinderMaterial.toneMapped = false;
  cinderMaterial.needsUpdate = true;
  cinders.material = cinderMaterial;

  root.userData.lavaBallFx = {
    core,
    crust,
    cinders,
    coreMaterial,
    cinderMaterial,
    cinderBaseEmissive: cinderMaterial.emissiveIntensity,
    phase: Math.random() * Math.PI * 2
  };
}

function configureFireSunRuntime(root) {
  if (!root || root.userData.fireSunFx) {
    return;
  }

  const core = root.getObjectByName('FireSun_Core');
  const dots = root.getObjectByName('FireSun_Dots');

  if (!core || !dots || !core.isMesh || !dots.isMesh) {
    return;
  }

  const coreMaterial = createFireSunCoreMaterial();
  core.material = coreMaterial;

  const dotsMaterial = cloneMeshMaterial(dots) ?? new THREE.MeshStandardMaterial();
  dotsMaterial.color?.set(0xff8f1d);
  dotsMaterial.emissive?.set(0xffd268);
  dotsMaterial.emissiveIntensity = 4.4;
  dotsMaterial.roughness = 0.08;
  dotsMaterial.metalness = 0;
  dotsMaterial.toneMapped = false;
  dotsMaterial.needsUpdate = true;
  dots.material = dotsMaterial;

  const aura = new THREE.Mesh(core.geometry.clone(), createFireSunAuraMaterial());
  aura.name = 'FireSun_AuraRuntime';
  aura.scale.setScalar(1.32);
  aura.frustumCulled = false;
  aura.renderOrder = 5;
  aura.castShadow = false;
  aura.receiveShadow = false;
  root.add(aura);

  root.userData.fireSunFx = {
    core,
    dots,
    aura,
    coreMaterial,
    dotsMaterial,
    baseScale: root.scale.x,
    auraBaseScale: aura.scale.x,
    dotsBaseEmissive: dotsMaterial.emissiveIntensity,
    phase: Math.random() * Math.PI * 2
  };
}

function updateElectricBallRuntime(root, time, deltaTime) {
  const fx = root?.userData?.electricBallFx;
  if (!fx) {
    return;
  }

  const shaderTime = time * 1.22;
  const pulse = 0.5 + 0.5 * Math.sin(time * 3.1 + fx.phase);
  const flicker =
    0.92 +
    Math.sin(time * 21.0 + fx.phase * 0.5) * 0.09 +
    Math.sin(time * 37.0 + fx.phase * 1.3) * 0.05;

  fx.coreMaterial.uniforms.uTime.value = shaderTime;
  fx.coreMaterial.uniforms.uPulse.value = pulse;
  fx.coreMaterial.uniforms.uFlicker.value = flicker;

  fx.bolts.rotation.y += deltaTime * 1.8;
  fx.bolts.rotation.x -= deltaTime * 0.48;
  fx.bolts.rotation.z += deltaTime * 0.24;
  fx.sparks.rotation.y -= deltaTime * 2.6;
  fx.sparks.rotation.x += deltaTime * 0.35;
  fx.sparks.position.y = Math.sin(time * 4.8 + fx.phase) * 0.014;

  fx.boltsMaterial.emissiveIntensity = fx.boltsBaseEmissive * (0.78 + pulse * 0.62) * flicker;
  fx.sparksMaterial.emissiveIntensity = fx.sparksBaseEmissive * (0.82 + pulse * 0.7) * flicker;
}

function updateCrystalBallLightningRuntime(root, time, deltaTime) {
  const fx = root?.userData?.crystalBallFx;
  if (!fx) {
    return;
  }

  const pulse = 0.5 + 0.5 * Math.sin(time * 1.85 + fx.phase);
  const shimmer =
    0.95 +
    Math.sin(time * 8.5 + fx.phase * 0.7) * 0.05 +
    Math.sin(time * 15.0 + fx.phase * 1.2) * 0.022;

  fx.core.rotation.y += deltaTime * 0.28;
  fx.particles.rotation.y += deltaTime * 0.72;
  fx.particles.rotation.x -= deltaTime * 0.18;
  fx.particles.rotation.z += deltaTime * 0.08;
  fx.particles.position.y = Math.sin(time * 2.4 + fx.phase) * 0.018;

  fx.coreMaterial.uniforms.uTime.value = time * 1.18;
  fx.coreMaterial.uniforms.uPulse.value = 0.18 + pulse * 0.7;
  fx.coreMaterial.uniforms.uFlicker.value = shimmer;
  fx.particleMaterial.emissiveIntensity = fx.particleBaseEmissive * (0.9 + pulse * 0.24) * shimmer;
}

function updateMagicBallRuntime(root, time, deltaTime) {
  const fx = root?.userData?.magicBallFx;
  if (!fx) {
    return;
  }

  const shaderTime = time * 1.08;
  const pulse = 0.5 + 0.5 * Math.sin(time * 2.05 + fx.phase);
  const flicker =
    0.97 +
    Math.sin(time * 7.8 + fx.phase * 0.6) * 0.03 +
    Math.sin(time * 15.5 + fx.phase) * 0.018;

  fx.coreMaterial.uniforms.uTime.value = shaderTime;
  fx.coreMaterial.uniforms.uPulse.value = 0.3 + pulse * 0.85;
  fx.coreMaterial.uniforms.uFlicker.value = flicker;

  fx.swirls[0].rotation.y += deltaTime * 0.95;
  fx.swirls[0].rotation.z -= deltaTime * 0.42;
  fx.swirls[1].rotation.x -= deltaTime * 0.88;
  fx.swirls[1].rotation.y += deltaTime * 0.22;
  fx.swirls[2].rotation.z += deltaTime * 1.1;
  fx.swirls[2].rotation.x += deltaTime * 0.18;

  fx.particles.rotation.y -= deltaTime * 1.35;
  fx.particles.rotation.x += deltaTime * 0.24;
  fx.particles.position.y = Math.sin(time * 2.6 + fx.phase) * 0.018;
  fx.particleMaterial.emissiveIntensity = fx.particleBaseEmissive * (0.92 + pulse * 0.3) * flicker;

  for (let i = 0; i < fx.swirlMaterials.length; i += 1) {
    fx.swirlMaterials[i].emissiveIntensity =
      fx.swirlBaseEmissive[i] * (0.9 + pulse * 0.22 + Math.sin(time * 2.2 + fx.phase + i) * 0.04);
  }
}

function updateLavaBallRuntime(root, time, deltaTime) {
  const fx = root?.userData?.lavaBallFx;
  if (!fx) {
    return;
  }

  const shaderTime = time * 0.82;
  const pulse = 0.5 + 0.5 * Math.sin(time * 1.65 + fx.phase);
  const flicker =
    0.94 +
    Math.sin(time * 9.5 + fx.phase * 0.7) * 0.05 +
    Math.sin(time * 18.0 + fx.phase * 1.2) * 0.022;

  fx.coreMaterial.uniforms.uTime.value = shaderTime;
  fx.coreMaterial.uniforms.uPulse.value = pulse * 0.78;
  fx.coreMaterial.uniforms.uFlicker.value = flicker;

  fx.crust.rotation.y += deltaTime * 0.18;
  fx.crust.rotation.x += deltaTime * 0.06;
  fx.cinders.rotation.y -= deltaTime * 0.95;
  fx.cinders.rotation.z += deltaTime * 0.18;
  fx.cinders.position.y = Math.sin(time * 2.1 + fx.phase) * 0.012;
  fx.cinderMaterial.emissiveIntensity = fx.cinderBaseEmissive * (0.95 + pulse * 0.26) * flicker;
}

function updateFireSunRuntime(root, time, deltaTime, hoverOffset = 0) {
  const fx = root?.userData?.fireSunFx;
  if (!fx) {
    return;
  }

  const pulse = 0.5 + 0.5 * Math.sin(time * 2.7 + fx.phase);
  const flicker =
    0.92 +
    Math.sin(time * 16.0 + fx.phase * 0.8) * 0.06 +
    Math.sin(time * 31.0 + fx.phase * 1.3) * 0.025;

  root.scale.setScalar(fx.baseScale * (0.985 + pulse * 0.045));
  root.position.y = hoverOffset + Math.sin(time * 1.9 + fx.phase) * 0.035;

  fx.dots.rotation.y += deltaTime * 1.45;
  fx.dots.rotation.z += deltaTime * 0.25;
  fx.dots.position.y = Math.sin(time * 3.3 + fx.phase) * 0.028;
  fx.core.rotation.y += deltaTime * 0.18;

  fx.aura.scale.setScalar(fx.auraBaseScale + Math.sin(time * 2.35 + fx.phase) * 0.08 + pulse * 0.04);
  fx.aura.material.uniforms.uTime.value = time;
  fx.aura.material.uniforms.uPulse.value = pulse;

  fx.coreMaterial.uniforms.uTime.value = time;
  fx.coreMaterial.uniforms.uPulse.value = pulse;
  fx.coreMaterial.uniforms.uFlicker.value = flicker;
  fx.dotsMaterial.emissiveIntensity = fx.dotsBaseEmissive * (0.92 + pulse * 0.5) * flicker;
}

function configureEnemyRuntimeVisual(root, enemyKey) {
  if (!root) {
    return;
  }

  root.userData.enemyKey = enemyKey;

  if (enemyKey === 'fireSun') {
    configureFireSunRuntime(root);
    return;
  }

  if (enemyKey === 'crystalBallLightning') {
    configureCrystalBallLightningRuntime(root);
    return;
  }

  if (enemyKey === 'electricBall') {
    configureElectricBallRuntime(root);
    return;
  }

  if (enemyKey === 'lavaBall') {
    configureLavaBallRuntime(root);
    return;
  }

  if (enemyKey === 'magicBall') {
    configureMagicBallRuntime(root);
  }
}

function updateEnemyRuntimeVisual(root, enemyKey, time, deltaTime, hoverOffset = 0) {
  if (!root) {
    return;
  }

  if (enemyKey === 'fireSun') {
    updateFireSunRuntime(root, time, deltaTime, hoverOffset);
    return;
  }

  if (enemyKey === 'crystalBallLightning') {
    updateCrystalBallLightningRuntime(root, time, deltaTime);
    return;
  }

  if (enemyKey === 'electricBall') {
    updateElectricBallRuntime(root, time, deltaTime);
    return;
  }

  if (enemyKey === 'lavaBall') {
    updateLavaBallRuntime(root, time, deltaTime);
    return;
  }

  if (enemyKey === 'magicBall') {
    updateMagicBallRuntime(root, time, deltaTime);
  }
}

function getCurrentEnemyTemplate() {
  return enemyTemplates[currentLevelConfig.enemyKey] ?? null;
}

function applyGunMountConfig(position, rotation, muzzlePosition) {
  applyGunMountConfigPlayer(
    { gunBasePosition, gunBaseRotation, gunMount, muzzleAnchor },
    position,
    rotation,
    muzzlePosition
  );
}

function applyCharacterGunModelTransform(model) {
  applyCharacterGunModelTransformPlayer(
    {
      characterScale,
      characterGunScaleMultiplier,
      characterGunModelPosition,
      characterGunModelRotation
    },
    model
  );
}

function deriveGunMuzzlePosition(model, mount, target) {
  return deriveGunMuzzlePositionPlayer(
    {
      tempBox,
      tempBox2,
      tempMatrix4A,
      tempMatrix4B,
      fallbackCharacterMuzzlePosition,
      bulletRadius: BULLET_RADIUS
    },
    model,
    mount,
    target
  );
}

function updateCharacterMuzzlePosition() {
  updateCharacterMuzzlePositionPlayer({
    tempBox,
    tempBox2,
    tempMatrix4A,
    tempMatrix4B,
    fallbackCharacterMuzzlePosition,
    bulletRadius: BULLET_RADIUS,
    playerGunModel,
    gunMount,
    characterMuzzlePosition
  });
}

function getAnchorWorldPosition(anchor, target) {
  return getAnchorWorldPositionPlayer(anchor, target);
}

function syncCharacterGunTransforms() {
  syncCharacterGunTransformsPlayer({
    gunBasePosition,
    gunBaseRotation,
    gunMount,
    muzzleAnchor,
    characterScale,
    characterGunScaleMultiplier,
    characterGunModelPosition,
    characterGunModelRotation,
    tempBox,
    tempBox2,
    tempMatrix4A,
    tempMatrix4B,
    fallbackCharacterMuzzlePosition,
    bulletRadius: BULLET_RADIUS,
    playerGunModel,
    characterGunMountPosition,
    characterGunMountRotation,
    characterMuzzlePosition
  });
}

function setAvatarVisibility(visible) {
  setAvatarVisibilityPlayer({ avatarRoot, fallbackAvatar, gunMount, characterModel }, visible);
}

function setPlayerFootPosition(position) {
  setPlayerFootPositionPlayer(
    { playerCollider, playerRadius: PLAYER_RADIUS, playerCapsuleTop: PLAYER_CAPSULE_TOP },
    position
  );
}

function getPlayerFootPosition(target) {
  return getPlayerFootPositionPlayer(
    { playerCollider, playerRadius: PLAYER_RADIUS, up: UP },
    target
  );
}

function respawnPlayer(resetHealth = false) {
  hp = respawnPlayerPlayer(
    {
      playerSpawn,
      playerVelocity,
      playerCollider,
      playerRadius: PLAYER_RADIUS,
      playerCapsuleTop: PLAYER_CAPSULE_TOP,
      maxHp: playerStats.maxHP
    },
    resetHealth,
    hp
  );
}

function getSceneSpawnYaw(sceneKey = activeSceneKey) {
  const lookAt = WORLD_SCENES[sceneKey]?.spawnLookAt;

  if (!Array.isArray(lookAt)) {
    return 0;
  }

  const [targetX = 0, , targetZ = 0] = lookAt;
  const deltaX = targetX - playerSpawn.x;
  const deltaZ = targetZ - playerSpawn.z;

  if (Math.hypot(deltaX, deltaZ) < 0.001) {
    return 0;
  }

  return Math.atan2(-deltaX, -deltaZ);
}

function damagePlayer(amount) {
  const previousHp = hp;
  hp = damagePlayerPlayer({ maxHp: playerStats.maxHP }, hp, amount);

  if (hp < previousHp && hp > 0) {
    playPlayerHitSfx();
  }
}

function applyCurrentLevelConfig(levelIndex) {
  currentLevelIndex = THREE.MathUtils.clamp(levelIndex, 0, ENEMY_LEVELS.length - 1);
  currentLevelConfig = ENEMY_LEVELS[currentLevelIndex];
  applyEnemyBloomProfile(currentLevelConfig.enemyKey);
  activeEnemyHudTarget = null;
  createSpikedEnemyModels();
  updateHud();
  refreshHudMessage();
}

async function startCampaignLevel(levelIndex) {
  if (!sceneReady) {
    return;
  }

  const keepMenuMusicThroughCutscene = menuSceneViewOpen && usesMenuSceneExperience();
  gameState = 'transition';
  portalAudioSequenceId += 1;
  clearInputState();
  triggerHeld = false;
  if (document.pointerLockElement === renderer.domElement) {
    document.exitPointerLock();
  }

  await fadeToBlack();

  setControlsPopupOpen(false);
  upgradeScreen.hidden = true;
  cutsceneScreen.hidden = true;
  hideStatusOverlay();
  stopMenuSceneExperience({ keepMusic: keepMenuMusicThroughCutscene });
  stopLevelSoundtrack();
  stopWinMusic();
  startScreenOpen = false;
  menuSceneViewOpen = false;
  menuSceneCameraOverrideEnabled = false;
  syncScreenVisibility();

  applyCurrentLevelConfig(levelIndex);

  campaignSceneKey = currentLevelConfig.sceneKey ?? selectedStartSceneKey;
  showLoaderScreen('Loading Level', `Loading ${getCurrentLevelLabel()}.`);
  updateLoaderScreen('Loading Level', `Loading ${getCurrentLevelLabel()}.`, 1, 1);

  if (activeSceneKey !== campaignSceneKey) {
    applyWorldScene(campaignSceneKey, { startPlaying: false });
  } else {
    restartGame({ startPlaying: false });
  }

  hideLoaderScreen();
  gameState = 'cutscene';
  syncScreenVisibility();
  await showCutscene(currentLevelConfig, {
    beforeTypewriter: () => fadeFromBlack(),
    onContinue: requestGamePointerLock
  });
  if (keepMenuMusicThroughCutscene) {
    fadeOutMenuMusic();
  }
  await fadeToBlack();
  cutsceneScreen.hidden = true;
  gameState = 'playing';
  syncScreenVisibility();
  startLevelSoundtrack();
  await fadeFromBlack();
  requestGamePointerLock();
}

function requestGamePointerLock() {
  if (document.pointerLockElement !== renderer.domElement) {
    const lockPromise = renderer.domElement.requestPointerLock();
    if (lockPromise?.catch) {
      lockPromise.catch(() => {});
    }
  }
}

async function retryCurrentLevel() {
  if (!sceneReady) {
    return;
  }

  gameState = 'transition';
  portalAudioSequenceId += 1;
  clearInputState();
  triggerHeld = false;
  await fadeToBlack();

  setControlsPopupOpen(false);
  upgradeScreen.hidden = true;
  cutsceneScreen.hidden = true;
  hideStatusOverlay();
  stopMenuSceneExperience();
  stopLevelSoundtrack();
  stopWinMusic();
  startScreenOpen = false;
  menuSceneViewOpen = false;
  menuSceneCameraOverrideEnabled = false;
  syncScreenVisibility();

  applyCurrentLevelConfig(currentLevelIndex);
  campaignSceneKey = currentLevelConfig.sceneKey ?? selectedStartSceneKey;

  if (activeSceneKey !== campaignSceneKey) {
    applyWorldScene(campaignSceneKey, { startPlaying: false });
  } else {
    restartGame({ startPlaying: false });
  }

  gameState = 'playing';
  syncScreenVisibility();
  startLevelSoundtrack();
  await fadeFromBlack();
  requestGamePointerLock();
}

function completeLevel() {
  if (gameState !== 'playing') {
    return;
  }

  gameState = 'portal';
  triggerHeld = false;
  playerVelocity.set(0, 0, 0);
  clearInputState();
  clearBullets();
  clearEnemyProjectiles();
  openLevelPortal();
  playPortalOpenSequence();
  refreshHudMessage();
}

async function handlePortalEntered() {
  if (gameState !== 'portal') {
    return;
  }

  gameState = 'transition';
  portalAudioSequenceId += 1;
  clearInputState();
  clearBullets();
  clearEnemyProjectiles();
  playTeleportationSfx();
  stopWinMusic();
  stopLevelSoundtrack();

  if (document.pointerLockElement === renderer.domElement) {
    document.exitPointerLock();
  }

  await fadeToBlack();
  clearPortal();

  const finalLevel = currentLevelIndex >= ENEMY_LEVELS.length - 1;
  if (finalLevel) {
    gameState = 'cutscene';
    syncScreenVisibility();
    await showCutscene(FINAL_CAMPAIGN_CUTSCENE, {
      beforeTypewriter: () => fadeFromBlack()
    });
    await fadeToBlack();
    cutsceneScreen.hidden = true;
    runInProgress = false;
    resetRunStats();
    openMenuSceneView(INTRO_SCENE_KEY);
    await fadeFromBlack();
    return;
  }

  gameState = 'upgrading';
  syncScreenVisibility();
  const upgradeSelection = showUpgradeScreen(getCurrentLevelUpgradeIds(), { hideOnFinish: false });
  await fadeFromBlack();
  const upgradeId = await upgradeSelection;
  applyUpgrade(upgradeId);
  await fadeToBlack();
  upgradeScreen.hidden = true;
  startCampaignLevel(currentLevelIndex + 1);
}

function killPlayer() {
  if (gameState !== 'playing') {
    return;
  }

  gameState = 'dying';
  hp = 0;
  deathScreenTimer = 2;
  triggerHeld = false;
  playerVelocity.set(0, 0, 0);
  clearInputState();
  clearBullets();
  clearEnemyProjectiles();
  playPlayerDeathSfx();
  stopWinMusic();
  stopLevelSoundtrack();

  if (document.pointerLockElement === renderer.domElement) {
    document.exitPointerLock();
  }

  setCharacterAction('Armature|death', { fade: 0.08, force: true, loopOnce: true });
  syncScreenVisibility();
}

function restartGame({ startPlaying = true } = {}) {
  clearBullets();
  clearEnemyProjectiles();
  clearExplosionEffects();
  clearShockwaveEffects();
  clearPortal();
  hp = playerStats.maxHP;
  ammo = weaponStats.magazine;
  playerOnFloor = false;
  yaw = getSceneSpawnYaw();
  pitch = DEFAULT_GAMEPLAY_PITCH;
  orbitYaw = 0;
  orbitPitch = 0;
  recoilBack = 0;
  recoilUp = 0;
  recoilTwist = 0;
  walkBob = 0;
  lastShotAt = -Infinity;
  lastEmptyShotAt = -Infinity;
  muzzleFlashTimer = 0;
  deathScreenTimer = 0;
  shockwaveCooldownTimer = 0;
  clearInputState();
  respawnPlayer(true);
  resetSpikedEnemies();

  setSceneSelectorOpen(false);
  setPauseMenuOpen(false);
  hideStatusOverlay();
  gameState = startPlaying ? 'playing' : 'transition';
  setCharacterAction('Armature|idle with pistol', { fade: 0.01, force: true });
  updateCamera(0);
  updatePlayerVisual();
  if (startPlaying) {
    startLevelSoundtrack();
  }
  refreshHudMessage();
}

function clearInputState() {
  for (const code of Object.keys(keyStates)) {
    keyStates[code] = false;
  }

  triggerHeld = false;
  shootActionTimer = 0;
}

function getForwardVector() {
  return getForwardVectorPlayer({ playerDirection, yaw });
}

function getSideVector() {
  return getSideVectorPlayer({ playerDirection, yaw });
}

function playerCollisions() {
  playerOnFloor = playerCollisionsPlayer({ worldOctree, playerCollider, playerVelocity });
}

function controls(deltaTime) {
  controlsPlayer(
    {
      keyStates,
      playerVelocity,
      playerOnFloor,
      sprintAcceleration: playerStats.maxWalkSpeed * (1 + playerStats.running),
      walkAcceleration: playerStats.maxWalkSpeed,
      jumpVelocity: playerStats.jump,
      playerDirection,
      yaw
    },
    deltaTime
  );
}

function updatePlayer(deltaTime) {
  playerOnFloor = updatePlayerPlayer(
    {
      playerOnFloor,
      playerVelocity,
      gravity: GRAVITY,
      tempVectorA,
      playerCollider,
      worldOctree
    },
    deltaTime
  );
}

function updatePlayerVisual() {
  updatePlayerVisualPlayer({
    playerVisual,
    playerCollider,
    playerRadius: PLAYER_RADIUS,
    tempVectorA,
    yaw,
    camera,
    cameraTarget,
    shouldHideGameplayAvatar: () => shouldHideGameplayAvatar(),
    setAvatarVisibility,
    up: UP
  });
  applyMenuScenePlayerControlsToVisual();
}

function updateWeapon(deltaTime) {
  const nextState = updateWeaponPlayer(
    {
      playerVelocity,
      movementVelocity,
      playerOnFloor,
      walkBob,
      weaponLookSway,
      weaponSway,
      recoilBack,
      recoilUp,
      recoilTwist,
      gunBasePosition,
      gunBaseRotation,
      gunMount,
      muzzleFlashTimer,
      muzzleFlashDuration,
      muzzleFlash
    },
    deltaTime
  );

  walkBob = nextState.walkBob;
  recoilBack = nextState.recoilBack;
  recoilUp = nextState.recoilUp;
  recoilTwist = nextState.recoilTwist;
  muzzleFlashTimer = nextState.muzzleFlashTimer;
}

function createGlowCube(position, colorHex) {
  createGlowCubeWorld({ scene, glowCubes, glowCubeGeometry }, position, colorHex);
}

function updateGlowCubes(time) {
  updateGlowCubesWorld(glowCubes, time);
}

function setCharacterAction(name, { fade = 0.16, force = false, loopOnce = false } = {}) {
  const nextState = setCharacterActionPlayer(
    { characterActions, activeCharacterAction, activeCharacterActionName },
    name,
    { fade, force, loopOnce }
  );
  activeCharacterAction = nextState.activeCharacterAction;
  activeCharacterActionName = nextState.activeCharacterActionName;
}

function updateCharacterAnimation(deltaTime) {
  const nextState = updateCharacterAnimationPlayer(
    {
      characterMixer,
      gameState: gameState === 'portal' ? 'playing' : gameState,
      shootActionTimer,
      keyStates,
      playerOnFloor,
      characterActions,
      activeCharacterAction,
      activeCharacterActionName
    },
    deltaTime
  );

  shootActionTimer = nextState.shootActionTimer;
  activeCharacterAction = nextState.activeCharacterAction;
  activeCharacterActionName = nextState.activeCharacterActionName;
}

function sampleFlatGroundPoint({
  around = null,
  radius = null,
  minDistanceFrom = null,
  minDistanceSquared = 0,
  normalThreshold = 0.72,
  attempts = 80
} = {}) {
  if (worldBounds.isEmpty() || worldMeshes.length === 0) {
    return null;
  }

  const topY = worldBounds.max.y + 20;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    let x;
    let z;

    if (around && radius !== null) {
      x = THREE.MathUtils.clamp(
        around.x + THREE.MathUtils.randFloatSpread(radius * 2),
        worldBounds.min.x + 0.8,
        worldBounds.max.x - 0.8
      );
      z = THREE.MathUtils.clamp(
        around.z + THREE.MathUtils.randFloatSpread(radius * 2),
        worldBounds.min.z + 0.8,
        worldBounds.max.z - 0.8
      );
    } else {
      x = THREE.MathUtils.randFloat(worldBounds.min.x + 0.8, worldBounds.max.x - 0.8);
      z = THREE.MathUtils.randFloat(worldBounds.min.z + 0.8, worldBounds.max.z - 0.8);
    }

    spawnRaycaster.set(tempVectorA.set(x, topY, z), DOWN);
    spawnRaycaster.far = topY - worldBounds.min.y + 40;

    const intersections = spawnRaycaster.intersectObjects(worldMeshes, false);
    let groundHit = null;

    for (const hit of intersections) {
      if (!hit.face) {
        continue;
      }

      tempNormalMatrix.getNormalMatrix(hit.object.matrixWorld);
      tempVectorB.copy(hit.face.normal).applyMatrix3(tempNormalMatrix).normalize();

      if (tempVectorB.y > normalThreshold) {
        groundHit = hit;
        break;
      }
    }

    if (!groundHit) {
      continue;
    }

    const candidate = groundHit.point.clone().addScaledVector(UP, 0.04);
    if (
      minDistanceFrom &&
      candidate.distanceToSquared(minDistanceFrom) < minDistanceSquared
    ) {
      continue;
    }

    const capsule = new Capsule(
      tempVectorC.set(candidate.x, candidate.y + PLAYER_RADIUS, candidate.z),
      tempVectorD.set(candidate.x, candidate.y + PLAYER_CAPSULE_TOP, candidate.z),
      PLAYER_RADIUS
    );

    const collision = worldOctree.capsuleIntersect(capsule);
    if (!collision || collision.depth < 0.15) {
      return candidate;
    }
  }

  return null;
}

function sphereIntersectsSphere(a, b) {
  return sphereIntersectsSphereEnemies(a, b);
}

function resetSpikedEnemies() {
  activeEnemyHudTarget = resetSpikedEnemiesEnemies({
    enemyTemplate: getCurrentEnemyTemplate(),
    spikedEnemies,
    levelEnemies: getCurrentLevelEnemies(),
    sampleFlatGroundPoint,
    playerSpawn,
    spikedEnemyMinSpawnDistance: SPIKED_ENEMY_MIN_SPAWN_DISTANCE,
    findGroundPointAt,
    tempVectorA,
    spikedEnemyVisualRadius,
    enemyVisualRadii,
    spikedEnemyMaxHp: SPIKED_ENEMY_MAX_HP,
    up: UP,
    spikedEnemyPatrolRadius: SPIKED_ENEMY_PATROL_RADIUS
  });
}

function spawnExplosion(position) {
  spawnExplosionFx(
    {
      scene,
      explosionEffects,
      explosionParticleGeometry,
      explosionParticleCount: EXPLOSION_PARTICLE_COUNT,
      explosionDuration: EXPLOSION_DURATION
    },
    position
  );
}

function updateExplosionEffects(deltaTime) {
  updateExplosionEffectsFx({ explosionEffects, scene }, deltaTime);
}

function damageSpikedEnemy(enemyInstance, impactPoint, damage = weaponStats.damage) {
  const wasAlive = enemyInstance.alive;
  const previousHp = enemyInstance.hp;

  activeEnemyHudTarget = damageSpikedEnemyEnemies(
    {
      activeEnemyHudTarget,
      spawnExplosion,
      spikedEnemies,
      completeLevel,
      tempVectorA
    },
    enemyInstance,
    impactPoint,
    damage
  );

  if (!wasAlive || previousHp <= 0 || enemyInstance.hp >= previousHp) {
    return;
  }

  if (!enemyInstance.alive) {
    playEnemyExplosionSfx();
  } else {
    playEnemyHitSfx();
  }
}

function updateSpikedEnemies(deltaTime) {
  activeEnemyHudTarget = updateSpikedEnemiesEnemies(
    {
      activeEnemyHudTarget,
      spikedEnemies,
      gameState,
      getPlayerFootPosition,
      tempVectorA,
      tempVectorB,
      tempVectorC,
      tempVectorD,
      tempVectorE,
      spikedEnemyChaseRadius: SPIKED_ENEMY_CHASE_RADIUS,
      spikedEnemyChaseSpeed: SPIKED_ENEMY_CHASE_SPEED,
      spikedEnemyPatrolRadius: SPIKED_ENEMY_PATROL_RADIUS,
      spikedEnemyPatrolSpeed: SPIKED_ENEMY_PATROL_SPEED,
      movementVelocity,
      spikedEnemyAcceleration: SPIKED_ENEMY_ACCELERATION,
      spikedEnemyGravity: SPIKED_ENEMY_GRAVITY,
      worldOctree,
      findGroundPointAt,
      currentLevelConfig,
      spikedEnemyVisualRadius,
      updateEnemyRuntimeVisual,
      simulationTime,
      fireSunFloatHeight: FIRE_SUN_FLOAT_HEIGHT,
      playerCapsuleLine,
      playerCollider,
      playerVelocity,
      spikedEnemyHitCooldown: SPIKED_ENEMY_HIT_COOLDOWN,
      onPlayerDamaged: (amount) => {
        damagePlayer(amount);
        return hp;
      },
      spikedEnemyContactDamage: SPIKED_ENEMY_CONTACT_DAMAGE,
      spikedEnemyContactPush: SPIKED_ENEMY_CONTACT_PUSH,
      spikedEnemyBounceSpeed: SPIKED_ENEMY_BOUNCE_SPEED,
      killPlayer,
      spawnEnemyProjectile,
      hasActiveEnemyProjectiles,
      sampleFlatGroundPoint,
      up: UP
    },
    deltaTime
  );
}

function updateBullets(deltaTime) {
  updateBulletsFx(
    {
      bullets,
      scene,
      worldOctree,
      spikedEnemies,
      sphereIntersectsSphere,
      damageSpikedEnemy
    },
    deltaTime
  );
}

function clearEnemyProjectiles() {
  while (enemyProjectiles.length > 0) {
    const projectile = enemyProjectiles.pop();
    scene.remove(projectile.mesh);
  }
}

function hasActiveEnemyProjectiles(type = null) {
  return enemyProjectiles.some((projectile) => !type || projectile.type === type);
}

function spawnEnemyProjectile({
  type,
  position,
  target = null,
  direction = null,
  damage = 1,
  speed = 7,
  radius = 0.16,
  lifetime = 4
}) {
  const material = type === 'lava' ? lavaProjectileMaterial : fireProjectileMaterial;
  const mesh = new THREE.Mesh(enemyProjectileGeometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  mesh.position.copy(position);
  mesh.position.y += 0.12;
  mesh.scale.setScalar(radius / 0.16);

  const light = new THREE.PointLight(type === 'lava' ? 0xff3a00 : 0xffc247, 2.5, 5.5, 2);
  mesh.add(light);

  const velocity = new THREE.Vector3();
  if (direction) {
    velocity.copy(direction).normalize();
  } else if (target) {
    velocity.subVectors(target, mesh.position).normalize();
  } else {
    velocity.set(0, 0, 1);
  }

  velocity.multiplyScalar(speed);
  scene.add(mesh);
  enemyProjectiles.push({
    type,
    mesh,
    light,
    collider: new THREE.Sphere(mesh.position.clone(), radius),
    velocity,
    damage,
    age: 0,
    lifetime
  });
}

function closestSegmentDistanceSquared(startA, endA, startB, endB) {
  tempVectorC.subVectors(endA, startA);
  tempVectorD.subVectors(endB, startB);
  tempVectorE.subVectors(startA, startB);

  const a = tempVectorC.dot(tempVectorC);
  const b = tempVectorC.dot(tempVectorD);
  const c = tempVectorD.dot(tempVectorD);
  const d = tempVectorC.dot(tempVectorE);
  const e = tempVectorD.dot(tempVectorE);
  const denominator = a * c - b * b;

  let s = 0;
  let t = 0;

  if (a <= 1e-8 && c <= 1e-8) {
    return startA.distanceToSquared(startB);
  }

  if (a <= 1e-8) {
    t = THREE.MathUtils.clamp(e / c, 0, 1);
  } else if (c <= 1e-8) {
    s = THREE.MathUtils.clamp(-d / a, 0, 1);
  } else {
    s = denominator !== 0 ? THREE.MathUtils.clamp((b * e - c * d) / denominator, 0, 1) : 0;
    t = (b * s + e) / c;

    if (t < 0) {
      t = 0;
      s = THREE.MathUtils.clamp(-d / a, 0, 1);
    } else if (t > 1) {
      t = 1;
      s = THREE.MathUtils.clamp((b - d) / a, 0, 1);
    }
  }

  tempVectorF.copy(startA).addScaledVector(tempVectorC, s);
  tempVectorG.copy(startB).addScaledVector(tempVectorD, t);
  return tempVectorF.distanceToSquared(tempVectorG);
}

function enemyProjectilePointHitsPlayer(projectile, point) {
  playerCapsuleLine.start.copy(playerCollider.start);
  playerCapsuleLine.end.copy(playerCollider.end);
  playerCapsuleLine.closestPointToPoint(point, true, tempVectorA);
  const radius = playerCollider.radius + projectile.collider.radius;
  return tempVectorA.distanceToSquared(point) <= radius * radius;
}

function enemyProjectileHitsPlayer(projectile, previousCenter = null) {
  if (enemyProjectilePointHitsPlayer(projectile, projectile.collider.center)) {
    return true;
  }

  if (!previousCenter) {
    return false;
  }

  if (enemyProjectilePointHitsPlayer(projectile, previousCenter)) {
    return true;
  }

  const radius = playerCollider.radius + projectile.collider.radius;
  return (
    closestSegmentDistanceSquared(
      previousCenter,
      projectile.collider.center,
      playerCollider.start,
      playerCollider.end
    ) <= radius * radius
  );
}

function enemyProjectileOutsideWorldBounds(projectile) {
  if (worldBounds.isEmpty()) {
    return false;
  }

  const padding = projectile.collider.radius + 1;
  const { x, z } = projectile.collider.center;
  return (
    x < worldBounds.min.x - padding ||
    x > worldBounds.max.x + padding ||
    z < worldBounds.min.z - padding ||
    z > worldBounds.max.z + padding
  );
}

function updateEnemyProjectiles(deltaTime) {
  for (let i = enemyProjectiles.length - 1; i >= 0; i -= 1) {
    const projectile = enemyProjectiles[i];
    projectile.age += deltaTime;

    if (projectile.age >= projectile.lifetime) {
      scene.remove(projectile.mesh);
      enemyProjectiles.splice(i, 1);
      continue;
    }

    if (projectile.type !== 'lava') {
      projectile.velocity.y -= 8.5 * deltaTime;
    }

    tempProjectilePreviousCenter.copy(projectile.collider.center);
    projectile.collider.center.addScaledVector(projectile.velocity, deltaTime);

    if (
      (gameState === 'playing' || gameState === 'portal') &&
      enemyProjectileHitsPlayer(projectile, tempProjectilePreviousCenter)
    ) {
      damagePlayer(projectile.damage);
      scene.remove(projectile.mesh);
      enemyProjectiles.splice(i, 1);

      if (hp <= 0) {
        killPlayer();
      }
      continue;
    }

    if (projectile.type === 'lava' && enemyProjectileOutsideWorldBounds(projectile)) {
      scene.remove(projectile.mesh);
      enemyProjectiles.splice(i, 1);
      continue;
    }

    const worldHit = projectile.type === 'lava' ? null : worldOctree.sphereIntersect(projectile.collider);
    if (worldHit) {
      scene.remove(projectile.mesh);
      enemyProjectiles.splice(i, 1);
      continue;
    }

    projectile.mesh.position.copy(projectile.collider.center);
    projectile.mesh.rotation.x += deltaTime * 5;
    projectile.mesh.rotation.y += deltaTime * 7;
    projectile.light.intensity = 2.2 + Math.sin((simulationTime + projectile.age) * 18) * 0.35;
  }
}

function triggerShockwave() {
  if (!abilityStats.shockwaveUnlocked || shockwaveCooldownTimer > 0 || gameState !== 'playing') {
    return;
  }

  shockwaveCooldownTimer = abilityStats.shockwaveCooldown;
  const origin = getPlayerFootPosition(tempVectorA).clone();
  origin.y += 0.08;

  const geometry = new THREE.RingGeometry(0.25, 0.32, 72);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00b872,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const ring = new THREE.Mesh(geometry, material);
  ring.rotation.x = -Math.PI * 0.5;
  ring.position.copy(origin);
  scene.add(ring);
  shockwaveEffects.push({ ring, age: 0, lifetime: 0.55, radius: 0.25 });

  for (const enemyInstance of spikedEnemies) {
    if (!enemyInstance.alive) {
      continue;
    }

    const distance = enemyInstance.collider.center.distanceTo(origin);
    if (distance > 4.2) {
      continue;
    }

    const damage = weaponStats.damage * 1.35;
    damageSpikedEnemy(enemyInstance, origin, damage);
    tempVectorB.subVectors(enemyInstance.collider.center, origin).setY(0);
    if (tempVectorB.lengthSq() > 0.001) {
      tempVectorB.normalize();
      enemyInstance.velocity.addScaledVector(tempVectorB, 5.4);
      enemyInstance.velocity.y = Math.max(enemyInstance.velocity.y, 3.2);
    }
  }
}

function updateShockwaveEffects(deltaTime) {
  shockwaveCooldownTimer = Math.max(0, shockwaveCooldownTimer - deltaTime);

  for (let i = shockwaveEffects.length - 1; i >= 0; i -= 1) {
    const effect = shockwaveEffects[i];
    effect.age += deltaTime;
    const progress = THREE.MathUtils.clamp(effect.age / effect.lifetime, 0, 1);

    if (progress >= 1) {
      effect.ring.material.dispose();
      effect.ring.geometry.dispose();
      scene.remove(effect.ring);
      shockwaveEffects.splice(i, 1);
      continue;
    }

    const scale = THREE.MathUtils.lerp(1, 13, progress);
    effect.ring.scale.setScalar(scale);
    effect.ring.material.opacity = 0.8 * (1 - progress);
  }
}

function clearShockwaveEffects() {
  while (shockwaveEffects.length > 0) {
    const effect = shockwaveEffects.pop();
    effect.ring.material.dispose();
    effect.ring.geometry.dispose();
    scene.remove(effect.ring);
  }
}

function clearPortal() {
  portalActive = false;
  portalTransitionActive = false;

  if (!portalGroup) {
    return;
  }

  portalGroup.traverse((child) => {
    if (child.isMesh) {
      child.geometry?.dispose?.();
      child.material?.dispose?.();
    }
  });
  scene.remove(portalGroup);
  portalGroup = null;
  portalMaterial = null;
}

function createPortalMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vec2 p = vUv - 0.5;
        float d = length(p);
        float ring = smoothstep(0.48, 0.38, d) - smoothstep(0.28, 0.18, d);
        float pulse = 0.65 + sin(uTime * 5.0 + d * 28.0) * 0.35;
        vec3 color = mix(vec3(0.02, 0.95, 0.55), vec3(0.65, 1.0, 0.82), pulse);
        gl_FragColor = vec4(color, ring * (0.68 + pulse * 0.3));
      }
    `
  });
}

function openLevelPortal() {
  clearPortal();
  let groundPoint = null;

  if (Array.isArray(currentLevelConfig.portalPosition)) {
    const [x = 0, y = 0, z = 0] = currentLevelConfig.portalPosition;
    groundPoint = findGroundPointAt(x, z, 0.45, true) ?? new THREE.Vector3(x, y, z);
  } else {
    const playerFoot = getPlayerFootPosition(tempVectorA);
    tempVectorB.set(-Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
    tempVectorC.copy(playerFoot).addScaledVector(tempVectorB, 4.5);
    groundPoint = findGroundPointAt(tempVectorC.x, tempVectorC.z, 0.45) ?? playerFoot.clone().addScaledVector(tempVectorB, 4.5);
  }

  portalGroup = new THREE.Group();
  portalGroup.position.copy(groundPoint).addScaledVector(UP, 0.08);
  portalMaterial = createPortalMaterial();

  const portalDisc = new THREE.Mesh(new THREE.CircleGeometry(1.35, 96), portalMaterial);
  portalDisc.rotation.x = -Math.PI * 0.5;
  portalGroup.add(portalDisc);

  const portalRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.08, 0.055, 10, 96),
    new THREE.MeshBasicMaterial({ color: 0x00b872, transparent: true, opacity: 0.8 })
  );
  portalRing.rotation.x = -Math.PI * 0.5;
  portalGroup.add(portalRing);

  const portalLight = new THREE.PointLight(0x00b872, 3.4, 8, 2);
  portalLight.position.y = 0.6;
  portalGroup.add(portalLight);

  scene.add(portalGroup);
  portalActive = true;
}

function updatePortal(deltaTime) {
  if (!portalGroup || !portalActive) {
    return;
  }

  portalMaterial.uniforms.uTime.value = simulationTime;
  portalGroup.rotation.y += deltaTime * 0.55;

  const playerFoot = getPlayerFootPosition(tempVectorA);
  tempVectorB.copy(portalGroup.position);
  tempVectorB.y = playerFoot.y;

  if (!portalTransitionActive && playerFoot.distanceTo(tempVectorB) <= 1.15) {
    portalTransitionActive = true;
    handlePortalEntered();
  }
}

function tryFire(now) {
  if (ammo < 1) {
    if (now - lastEmptyShotAt >= EMPTY_SHOT_INTERVAL) {
      lastEmptyShotAt = now;
      playPistolEmptySfx();
    }

    return;
  }

  const nextState = tryFireFx(
    {
      sceneReady,
      ammo,
      ammoPerShot: 1,
      shotInterval: weaponStats.fireRate,
      lastShotAt,
      getAnchorWorldPosition,
      muzzleAnchor,
      tempVectorA,
      tempVectorB,
      tempVectorC,
      tempVectorD,
      camera,
      aimRaycaster,
      worldMeshes,
      spikedEnemies,
      bulletRadius: BULLET_RADIUS,
      bulletGeometry,
      bulletMaterial,
      bullets,
      scene,
      bulletForward: BULLET_FORWARD,
      bulletLifetime: BULLET_LIFETIME,
      bulletSpeed: BULLET_SPEED,
      recoilBack,
      recoilUp,
      recoilTwist,
      damage: weaponStats.damage,
      onShotFired: () => {
        playPistolSfx();
        setCharacterAction('Armature|shoot with pistol', { fade: 0.05, force: true, loopOnce: true });
      }
    },
    now
  );

  if (!nextState) {
    return;
  }

  ammo = nextState.ammo;
  lastShotAt = nextState.lastShotAt;
  recoilBack = nextState.recoilBack;
  recoilUp = nextState.recoilUp;
  recoilTwist = nextState.recoilTwist;
  muzzleFlashDuration = nextState.muzzleFlashDuration;
  muzzleFlashTimer = nextState.muzzleFlashTimer;
  shootActionTimer = nextState.shootActionTimer;
}

function rechargeAmmo(deltaTime, now) {
  ammo = rechargeAmmoFx(
    {
      ammo,
      maxAmmo: weaponStats.magazine,
      lastShotAt,
      ammoRechargeDelay: 0,
      ammoRechargeRate: weaponStats.reloadSpeed
    },
    deltaTime,
    now
  );
}

function syncMenuSceneCameraControlsFromCamera() {
  menuSceneCameraControlPosition.copy(camera.position);
  tempFixedCameraEuler.setFromQuaternion(camera.quaternion, 'XYZ');
  menuSceneCameraControlRotation.copy(tempFixedCameraEuler);
  updateMenuSceneCameraControlsUi(ui, {
    position: menuSceneCameraControlPosition
  });
}

function resetMenuSceneCameraControls(sceneKey = activeSceneKey) {
  if (!hasEditableFixedSceneView(sceneKey)) {
    menuSceneCameraOverrideEnabled = false;
    return;
  }

  const defaultOverride = getDefaultFixedSceneCameraOverride(sceneKey);
  if (defaultOverride) {
    menuSceneCameraControlPosition.fromArray(defaultOverride.position);
    menuSceneCameraControlRotation.set(
      ...defaultOverride.rotationDegrees.map((value) => THREE.MathUtils.degToRad(value)),
      'XYZ'
    );
    menuSceneCameraOverrideEnabled = true;
    updateCamera(0);
    syncMenuSceneCameraControlsFromCamera();
    return;
  }

  menuSceneCameraOverrideEnabled = false;
  updateCamera(0);
  syncMenuSceneCameraControlsFromCamera();
  menuSceneCameraOverrideEnabled = true;
}

function applyMenuSceneCameraPositionValue(axis, rawValue, { normalize = false } = {}) {
  if (!shouldShowMenuSceneCameraControls()) {
    return;
  }

  const value = Number.parseFloat(rawValue);
  if (!Number.isFinite(value)) {
    return;
  }

  menuSceneCameraControlPosition[axis] = value;
  menuSceneCameraOverrideEnabled = true;
  updateCamera(0);

  if (normalize) {
    syncMenuSceneCameraControlsFromCamera();
  }
}

function getMenuSceneLightHandles(sceneKey = activeSceneKey) {
  const lightConfig = getSceneLightControlConfig(sceneKey);
  if (!lightConfig || !currentWorldRoot) {
    return null;
  }

  const light = currentWorldRoot.getObjectByName(lightConfig.lightName);
  const target = currentWorldRoot.getObjectByName(lightConfig.targetName);
  if (!light?.isDirectionalLight || !target) {
    return null;
  }

  return { light, target, lightConfig };
}

function syncMenuSceneLightControlsFromScene(sceneKey = activeSceneKey) {
  const handles = getMenuSceneLightHandles(sceneKey);
  if (handles) {
    menuSceneLightPosition.copy(handles.light.position);
    menuSceneLightTargetPosition.copy(handles.target.position);
    menuSceneLightIntensity = handles.light.intensity;
  } else {
    const defaults = getSceneLightControlConfig(sceneKey)?.defaultValues;
    if (!defaults) {
      return;
    }
    menuSceneLightPosition.fromArray(defaults.position);
    menuSceneLightTargetPosition.fromArray(defaults.target);
    menuSceneLightIntensity = defaults.intensity;
  }

  updateMenuSceneLightControlsUi(ui, {
    position: menuSceneLightPosition,
    target: menuSceneLightTargetPosition,
    intensity: menuSceneLightIntensity
  });
}

function applyMenuSceneLightControlsToScene(sceneKey = activeSceneKey) {
  const handles = getMenuSceneLightHandles(sceneKey);
  if (!handles) {
    return;
  }

  handles.light.position.copy(menuSceneLightPosition);
  handles.target.position.copy(menuSceneLightTargetPosition);
  handles.light.intensity = menuSceneLightIntensity;
  handles.target.updateMatrixWorld();
  handles.light.updateMatrixWorld();
  currentWorldRoot.updateMatrixWorld(true);
}

function resetMenuSceneLightControls(sceneKey = activeSceneKey) {
  const defaults = getSceneLightControlConfig(sceneKey)?.defaultValues;
  if (!defaults) {
    return;
  }

  menuSceneLightPosition.fromArray(defaults.position);
  menuSceneLightTargetPosition.fromArray(defaults.target);
  menuSceneLightIntensity = defaults.intensity;
  applyMenuSceneLightControlsToScene(sceneKey);
  syncMenuSceneLightControlsFromScene(sceneKey);
}

function syncMenuScenePlayerControlsFromVisual() {
  menuScenePlayerPosition.copy(playerVisual.position);
  menuScenePlayerRotationDegrees = THREE.MathUtils.radToDeg(playerVisual.rotation.y);
  menuScenePlayerScale = playerVisual.scale.x;
  updateMenuScenePlayerControlsUi(ui, {
    position: menuScenePlayerPosition,
    rotationDegrees: menuScenePlayerRotationDegrees,
    scale: menuScenePlayerScale
  });
}

function applyMenuScenePlayerControlsToVisual(sceneKey = activeSceneKey) {
  if (!getScenePlayerControlConfig(sceneKey)) {
    playerVisual.scale.setScalar(1);
    return;
  }

  playerVisual.position.copy(menuScenePlayerPosition);
  playerVisual.rotation.y = THREE.MathUtils.degToRad(menuScenePlayerRotationDegrees);
  playerVisual.scale.setScalar(menuScenePlayerScale);
}

function resetMenuScenePlayerControls(sceneKey = activeSceneKey) {
  const defaults = getScenePlayerControlConfig(sceneKey)?.defaultValues;
  if (!defaults) {
    playerVisual.scale.setScalar(1);
    return;
  }

  menuScenePlayerPosition.fromArray(defaults.position);
  menuScenePlayerRotationDegrees = defaults.rotationDegrees;
  menuScenePlayerScale = defaults.scale;
  applyMenuScenePlayerControlsToVisual(sceneKey);
  syncMenuScenePlayerControlsFromVisual();
}

function applyMenuScenePlayerControlValue(group, axis, rawValue, { normalize = false } = {}) {
  if (!shouldShowMenuScenePlayerControls()) {
    return;
  }

  const value = Number.parseFloat(rawValue);
  if (!Number.isFinite(value)) {
    return;
  }

  if (group === 'position') {
    menuScenePlayerPosition[axis] = value;
  } else if (group === 'rotation') {
    menuScenePlayerRotationDegrees = value;
  } else {
    menuScenePlayerScale = Math.max(0.1, value);
  }

  applyMenuScenePlayerControlsToVisual();

  if (normalize) {
    syncMenuScenePlayerControlsFromVisual();
  } else {
    updateMenuScenePlayerControlsUi(ui, {
      position: menuScenePlayerPosition,
      rotationDegrees: menuScenePlayerRotationDegrees,
      scale: menuScenePlayerScale
    });
  }
}

function applyMenuSceneLightControlValue(group, axis, rawValue) {
  if (!shouldShowMenuSceneLightControls()) {
    return;
  }

  const value = Number.parseFloat(rawValue);
  if (!Number.isFinite(value)) {
    return;
  }

  if (group === 'position') {
    menuSceneLightPosition[axis] = value;
  } else if (group === 'target') {
    menuSceneLightTargetPosition[axis] = value;
  } else {
    menuSceneLightIntensity = value;
  }

  applyMenuSceneLightControlsToScene();
  syncMenuSceneLightControlsFromScene();
}

function updateCamera(deltaTime = 0) {
  const nextState = updateCameraPlayer(
    {
      getFixedSceneViewConfig: () => getFixedSceneViewConfig(),
      currentWorldRoot,
      camera,
      desiredCameraPosition,
      cameraTarget,
      keyStates,
      orbitYaw,
      orbitPitch,
      pitch,
      yaw,
      playerCollider,
      up: UP,
      cameraEuler,
      cameraQuaternion,
      gameplayCameraFov: GAMEPLAY_CAMERA_FOV,
      gameplayCameraNear: GAMEPLAY_CAMERA_NEAR,
      gameplayCameraFar: GAMEPLAY_CAMERA_FAR,
      cameraOffset: CAMERA_OFFSET,
      cameraRayDirection,
      obstacleRaycaster,
      worldMeshes,
      cameraCollisionPadding: CAMERA_COLLISION_PADDING,
      fixedCameraOverride: {
        enabled: menuSceneCameraOverrideEnabled && hasFixedSceneCameraOverride(),
        position: menuSceneCameraControlPosition,
        rotation: menuSceneCameraControlRotation
      }
    },
    deltaTime
  );

  orbitYaw = nextState.orbitYaw;
  orbitPitch = nextState.orbitPitch;
}

function handleWorldBounds() {
  if (gameState !== 'playing') {
    return;
  }

  if (playerCollider.end.y < worldFloor - 6) {
    damagePlayer(24);

    if (hp <= 0) {
      killPlayer();
    } else {
      respawnPlayer();
    }
  }
}

function loadGLTF(url) {
  return loadGLTFWorld(url);
}

function loadFBX(url) {
  return loadFBXWorld(url);
}

function loadTexture(url) {
  return loadTextureWorld(url);
}

function prepareVoxelTexture(texture) {
  return prepareVoxelTextureWorld(texture, renderer.capabilities.getMaxAnisotropy());
}

function prepareWorldTexture(texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.flipY = false;
  texture.needsUpdate = true;
  return texture;
}

function createWorldMaterialMap(texture, previousMap, options = {}) {
  const map = texture.clone();
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = renderer.capabilities.getMaxAnisotropy();
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.minFilter = THREE.LinearMipmapLinearFilter;
  map.magFilter = THREE.LinearFilter;
  map.flipY = false;

  if (options.repeat) {
    map.offset.set(0, 0);
    map.repeat.set(options.repeat[0], options.repeat[1]);
    map.center.set(0, 0);
    map.rotation = 0;
  } else if (previousMap) {
    map.offset.copy(previousMap.offset);
    map.repeat.copy(previousMap.repeat);
    map.center.copy(previousMap.center);
    map.rotation = previousMap.rotation;
  } else {
    map.repeat.set(6, 6);
  }

  map.needsUpdate = true;
  return map;
}

function ensureGeneratedBoxUv(geometry, object = null, tileSize = null, force = false) {
  const positionAttribute = geometry?.attributes?.position;
  if (!positionAttribute || (geometry.attributes.uv && !force)) {
    return;
  }

  const normalAttribute = geometry.attributes.normal;
  const uv = new Float32Array(positionAttribute.count * 2);
  const useWorldSpace = object && tileSize;
  const worldPosition = new THREE.Vector3();
  const worldNormal = new THREE.Vector3();
  const normalMatrix = new THREE.Matrix3();

  if (useWorldSpace) {
    object.updateWorldMatrix(true, false);
    normalMatrix.getNormalMatrix(object.matrixWorld);
  }

  for (let index = 0; index < positionAttribute.count; index += 1) {
    worldPosition.set(
      positionAttribute.getX(index),
      positionAttribute.getY(index),
      positionAttribute.getZ(index)
    );
    worldNormal.set(
      normalAttribute?.getX(index) ?? 0,
      normalAttribute?.getY(index) ?? 1,
      normalAttribute?.getZ(index) ?? 0
    );

    if (useWorldSpace) {
      worldPosition.applyMatrix4(object.matrixWorld);
      worldNormal.applyMatrix3(normalMatrix).normalize();
    }

    const x = worldPosition.x;
    const y = worldPosition.y;
    const z = worldPosition.z;
    const nx = worldNormal.x;
    const ny = worldNormal.y;
    const nz = worldNormal.z;
    const absX = Math.abs(nx);
    const absY = Math.abs(ny);
    const absZ = Math.abs(nz);
    const divisor = tileSize || 1;

    if (absY >= absX && absY >= absZ) {
      uv[index * 2] = x / divisor;
      uv[index * 2 + 1] = z / divisor;
    } else if (absX >= absZ) {
      uv[index * 2] = z / divisor;
      uv[index * 2 + 1] = y / divisor;
    } else {
      uv[index * 2] = x / divisor;
      uv[index * 2 + 1] = y / divisor;
    }
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

function applyBrickTextures(root, topTexture, sideTexture, options = {}) {
  if (!topTexture || !sideTexture) {
    return;
  }

  const extraTopMaterialNames = options.extraTopMaterialNames ?? [];
  const extraTopMeshNames = options.extraTopMeshNames ?? [];
  const generateUvForMaterialNames = options.generateUvForMaterialNames ?? [];

  root.traverse((child) => {
    if (!child.isMesh || !child.material) {
      return;
    }

    const meshName = child.name?.toLowerCase() ?? '';
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    const hasGeneratedUvMaterial = materials.some((material) => {
      const materialName = material?.name?.toLowerCase() ?? '';
      return generateUvForMaterialNames.some((name) => materialName.includes(name));
    });

    if (
      options.generateUvForMeshNames?.some((name) => meshName.includes(name)) ||
      hasGeneratedUvMaterial
    ) {
      if (!child.geometry.attributes.uv || options.forceGenerateUv) {
        child.geometry = child.geometry.clone();
      }
      ensureGeneratedBoxUv(
        child.geometry,
        child,
        options.generatedUvTileSize,
        options.forceGenerateUv
      );
    }

    for (const material of materials) {
      if (!material) {
        continue;
      }

      const materialName = material.name?.toLowerCase() ?? '';
      const shouldUseTopTexture =
        materialName.includes('bricktop') ||
        extraTopMaterialNames.some((name) => materialName.includes(name)) ||
        extraTopMeshNames.some((name) => meshName.includes(name));

      if (shouldUseTopTexture) {
        material.map = createWorldMaterialMap(topTexture, material.map, options.topMapOptions);
      } else if (materialName.includes('brickside')) {
        material.map = createWorldMaterialMap(sideTexture, material.map, options.sideMapOptions);
      } else {
        continue;
      }

      material.color?.set(0xffffff);
      material.needsUpdate = true;
    }
  });
}

function applyLevelOneBrickTextures(root) {
  applyBrickTextures(root, bricksTopTexture, bricksTopTexture, {
    extraTopMaterialNames: ['platformground'],
    extraTopMeshNames: ['cube'],
    generateUvForMeshNames: ['cube'],
    generatedUvTileSize: BRICK_TILE_WORLD_SIZE,
    forceGenerateUv: true,
    topMapOptions: { repeat: [1, 1] },
    sideMapOptions: { repeat: [1, 1] }
  });
}

function applyLevelTwoBrickTextures(root) {
  applyBrickTextures(root, bricksTopTexture, bricksTopTexture, {
    extraTopMaterialNames: ['platformground'],
    extraTopMeshNames: ['cube'],
    generateUvForMeshNames: ['cube'],
    generatedUvTileSize: BRICK_TILE_WORLD_SIZE,
    forceGenerateUv: true,
    topMapOptions: { repeat: [1, 1] },
    sideMapOptions: { repeat: [1, 1] }
  });
}

function applyLevelThreeBrickTextures(root) {
  applyBrickTextures(root, bricksTopTexture, bricksTopTexture, {
    extraTopMaterialNames: ['platformground', 'material'],
    extraTopMeshNames: ['cube'],
    generateUvForMeshNames: ['cube'],
    generateUvForMaterialNames: ['material'],
    generatedUvTileSize: BRICK_TILE_WORLD_SIZE,
    forceGenerateUv: true,
    topMapOptions: { repeat: [1, 1] },
    sideMapOptions: { repeat: [1, 1] }
  });
}

function isBrickPlatformObject(object) {
  const objectName = object.name?.toLowerCase() ?? '';
  const geometryName = object.geometry?.name?.toLowerCase() ?? '';
  const materials = Array.isArray(object.material) ? object.material : [object.material];
  const hasPlatformMaterial = materials.some((material) => {
    const materialName = material?.name?.toLowerCase() ?? '';
    return materialName === 'material' || materialName.includes('platformground');
  });

  return objectName.includes('cube') || geometryName.includes('cube') || hasPlatformMaterial;
}

function expandBrickPlatformInstances(root) {
  const replacements = [];

  root.traverse((child) => {
    if (child.isInstancedMesh && isBrickPlatformObject(child)) {
      replacements.push(child);
    }
  });

  for (const source of replacements) {
    const parent = source.parent;
    if (!parent) {
      continue;
    }

    const expanded = new THREE.Group();
    expanded.name = source.name || source.geometry?.name || 'BrickPlatformInstances';
    expanded.matrix.copy(source.matrix);
    expanded.matrixAutoUpdate = false;

    for (let index = 0; index < source.count; index += 1) {
      const instanceMatrix = new THREE.Matrix4();
      source.getMatrixAt(index, instanceMatrix);

      const mesh = new THREE.Mesh(source.geometry.clone(), source.material);
      mesh.name = `${expanded.name}_${index + 1}`;
      mesh.matrix.copy(instanceMatrix);
      mesh.matrixAutoUpdate = false;
      mesh.castShadow = source.castShadow;
      mesh.receiveShadow = source.receiveShadow;
      mesh.userData = { ...source.userData };
      expanded.add(mesh);
    }

    parent.remove(source);
    parent.add(expanded);
  }
}

function addWorldScene(root, collisionRoot = root) {
  if (activeSceneKey === 'levelThree') {
    expandBrickPlatformInstances(root);
  }

  const nextState = addWorldSceneWorld(
    { scene, renderer, worldMeshes, worldOctree, worldBounds },
    root,
    collisionRoot
  );
  if (activeSceneKey === 'levelOne') {
    applyLevelOneBrickTextures(root);
  } else if (activeSceneKey === 'levelTwo') {
    applyLevelTwoBrickTextures(root);
  } else if (activeSceneKey === 'levelThree') {
    applyLevelThreeBrickTextures(root);
  }
  currentCollisionRoot = nextState.currentCollisionRoot;
  worldFloor = nextState.worldFloor;
}

function addCharacterModel(fbx) {
  const nextState = addCharacterModelPlayer(
    {
      avatarRoot,
      tempBox,
      tempVectorA,
      tempVectorB,
      characterActions,
      characterTexture,
      characterTargetHeight: CHARACTER_TARGET_HEIGHT
    },
    fbx
  );

  characterModel = nextState.characterModel;
  weaponHolderBone = nextState.weaponHolderBone;
  characterMixer = nextState.characterMixer;
  characterScale = nextState.characterScale;
  activeCharacterAction = nextState.activeCharacterAction;
  activeCharacterActionName = nextState.activeCharacterActionName;
}

function addGunModel(fbx) {
  const nextState = addGunModelPlayer(
    {
      fallbackGun,
      pistolTexture,
      weaponHolderBone,
      gunMount,
      playerVisual,
      fallbackGunMountPosition,
      fallbackGunMountRotation,
      fallbackMuzzlePosition,
      tempBox,
      tempVectorA
    },
    fbx
  );

  playerGunModel = nextState.playerGunModel;
  if (nextState.shouldSyncCharacterGunTransforms) {
    syncCharacterGunTransforms();
  }
}

function createSpikedEnemyModels() {
  createSpikedEnemyModelsEnemies({
    spikedEnemies,
    enemyTemplate: getCurrentEnemyTemplate(),
    enemyTemplates,
    levelEnemies: getCurrentLevelEnemies(),
    enemyKey: currentLevelConfig.enemyKey,
    configureEnemyRuntimeVisual
  });
}

function findSpawnPoint() {
  return findSpawnPointWorld({
    worldBounds,
    worldMeshes,
    worldOctree,
    playerRadius: PLAYER_RADIUS,
    playerCapsuleTop: PLAYER_CAPSULE_TOP
  });
}

function addGlowCubesToWorld(count) {
  addGlowCubesToWorldWorld({
    worldBounds,
    worldMeshes,
    playerSpawn,
    count,
    colors: GLOW_CUBE_COLORS,
    createGlowCube
  });
}

function findGroundPointAt(x, z, normalThreshold = 0.5, preferHighest = false) {
  return findGroundPointAtWorld({ worldBounds, worldMeshes, x, z, normalThreshold, preferHighest });
}

function getSceneSpawnPoint(sceneKey) {
  return getSceneSpawnPointWorld({
    sceneKey,
    worldScenes: WORLD_SCENES,
    currentWorldRoot,
    worldBounds,
    worldMeshes,
    worldOctree,
    playerRadius: PLAYER_RADIUS,
    playerCapsuleTop: PLAYER_CAPSULE_TOP
  });
}

function applyWorldScene(sceneKey, { restartPlayer = true, startPlaying = true } = {}) {
  applyWorldSceneWorld({
    sceneKey,
    restartPlayer,
    createWorldSceneRoot,
    clearBullets,
    spikedEnemies,
    clearWorldScene,
    setActiveSceneKey: (nextSceneKey) => {
      activeSceneKey = nextSceneKey;
    },
    setCurrentWorldRoot: (worldRoot) => {
      currentWorldRoot = worldRoot;
    },
    addWorldScene,
    setupMenuSceneEffects,
    getSceneSpawnPoint,
    playerSpawn,
    restartGame: () => restartGame({ startPlaying }),
    respawnPlayer,
    worldScenes: WORLD_SCENES,
    hideSpikedEnemies,
    configureNonPlayableScenePlayerPose,
    resetSpikedEnemies,
    updateCamera,
    updatePlayerVisual,
    addGlowCubesForScene,
    updateSceneToggleLabel,
    updateSceneSelectorButtons,
    refreshHudMessage,
    setActiveEnemyHudTarget: (target) => {
      activeEnemyHudTarget = target;
    }
  });
}

async function init() {
  try {
    loaderState.total = 28 + AUDIO_PRELOAD_URLS.length + UI_IMAGE_PRELOAD_URLS.length;
    loaderState.loaded = 0;
    showLoaderScreen(
      'Loading Assets',
      'Preloading all models, textures, UI images, sounds, and music.'
    );
    updateLoaderScreen(
      'Loading Assets',
      'Preloading all models, textures, UI images, sounds, and music.',
      0,
      loaderState.total
    );
    loadingEl.style.display = 'block';
    loadingEl.textContent = 'Loading all game assets...';
    refreshHudMessage();

    const [
      worldGltf,
      enemyTestWorldGltf,
      levelOneWorldGltf,
      levelTwoWorldGltf,
      levelThreeWorldGltf,
      blockMossXsGltf,
      groundMossXsGltf,
      groundMossMdGltf,
      gateGltf,
      mossXlGltf,
      pillarSquareGltf,
      skullCrackedGltf,
      stairsXlGltf,
      vaseGltf,
      wallLightGltf,
      wallNormalXlGltf,
      spikedBallGltf,
      fireSunGltf,
      lavaBallGltf,
      magicBallGltf,
      electricBallGltf,
      crystalBallLightningGltf,
      characterFbx,
      pistolFbx,
      loadedCharacterTexture,
      loadedPistolTexture,
      loadedBricksTopTexture,
      loadedBricksSideTexture
    ] = await Promise.all([
      loadTracked('Demo scene', () => loadGLTF(WORLD_SCENES.demo.url)),
      loadTracked('Enemy test scene', () => loadGLTF(WORLD_SCENES.enemyTest.url)),
      loadTracked('Level 1 scene', () => loadGLTF(WORLD_SCENES.levelOne.url)),
      loadTracked('Level 2 scene', () => loadGLTF(WORLD_SCENES.levelTwo.url)),
      loadTracked('Level 3 scene', () => loadGLTF(WORLD_SCENES.levelThree.url)),
      loadTracked('Block moss XS', () => loadGLTF(blockMossXsUrl)),
      loadTracked('Ground moss XS', () => loadGLTF(groundMossXsUrl)),
      loadTracked('Ground moss MD', () => loadGLTF(groundMossMdUrl)),
      loadTracked('Gate', () => loadGLTF(gateUrl)),
      loadTracked('Moss XL', () => loadGLTF(mossXlUrl)),
      loadTracked('Square pillar', () => loadGLTF(pillarSquareUrl)),
      loadTracked('Cracked skull', () => loadGLTF(skullCrackedUrl)),
      loadTracked('Stairs XL', () => loadGLTF(stairsXlUrl)),
      loadTracked('Vase', () => loadGLTF(vaseUrl)),
      loadTracked('Wall light', () => loadGLTF(wallLightUrl)),
      loadTracked('Wall normal XL', () => loadGLTF(wallNormalXlUrl)),
      loadTracked('Level 1 enemy', () => loadGLTF(ENEMY_TEMPLATE_URLS.spikedBall)),
      loadTracked('Level 2 enemy', () => loadGLTF(ENEMY_TEMPLATE_URLS.fireSun)),
      loadTracked('Level 3 enemy', () => loadGLTF(ENEMY_TEMPLATE_URLS.lavaBall)),
      loadTracked('Level 4 enemy', () => loadGLTF(ENEMY_TEMPLATE_URLS.magicBall)),
      loadTracked('Level 5 enemy', () => loadGLTF(ENEMY_TEMPLATE_URLS.electricBall)),
      loadTracked('Level 6 enemy', () => loadGLTF(ENEMY_TEMPLATE_URLS.crystalBallLightning)),
      loadTracked('Character rig', () => loadFBX(characterUrl)),
      loadTracked('Pistol', () => loadFBX(pistolUrl)),
      loadTracked('Character texture', () => loadTexture(characterTextureUrl)),
      loadTracked('Pistol texture', () => loadTexture(pistolTextureUrl)),
      loadTracked('Bricks top texture', () => loadTexture(bricksTopTextureUrl)),
      loadTracked('Bricks side texture', () => loadTexture(bricksSideTextureUrl)),
      ...AUDIO_PRELOAD_URLS.map((url, index) =>
        loadTracked(`Sound ${index + 1}`, () => loadBinaryAsset(url))
      ),
      ...UI_IMAGE_PRELOAD_URLS.map((url, index) =>
        loadTracked(`UI image ${index + 1}`, () => loadImageAsset(url))
      )
    ]);

    characterTexture = prepareVoxelTexture(loadedCharacterTexture);
    pistolTexture = prepareVoxelTexture(loadedPistolTexture);
    bricksTopTexture = prepareWorldTexture(loadedBricksTopTexture);
    bricksSideTexture = prepareWorldTexture(loadedBricksSideTexture);
    loadedWorldTemplates.demo = worldGltf.scene;
    loadedWorldTemplates.enemyTest = enemyTestWorldGltf.scene;
    loadedWorldTemplates.levelOne = levelOneWorldGltf.scene;
    loadedWorldTemplates.levelTwo = levelTwoWorldGltf.scene;
    loadedWorldTemplates.levelThree = levelThreeWorldGltf.scene;
    worldSceneFactories[INTRO_SCENE_KEY] = () =>
      createIntroSceneWorld({
        blockMossXs: blockMossXsGltf.scene,
        gate: gateGltf.scene,
        groundMossMd: groundMossMdGltf.scene,
        groundMossXs: groundMossXsGltf.scene,
        mossXl: mossXlGltf.scene,
        pillarSquare: pillarSquareGltf.scene,
        skullCracked: skullCrackedGltf.scene,
        stairsXl: stairsXlGltf.scene,
        vase: vaseGltf.scene,
        wallLight: wallLightGltf.scene,
        wallNormalXl: wallNormalXlGltf.scene
      });
    enemyTemplates.spikedBall = spikedBallGltf.scene;
    enemyTemplates.fireSun = fireSunGltf.scene;
    enemyTemplates.lavaBall = lavaBallGltf.scene;
    enemyTemplates.magicBall = magicBallGltf.scene;
    enemyTemplates.electricBall = electricBallGltf.scene;
    enemyTemplates.crystalBallLightning = crystalBallLightningGltf.scene;

    for (const [enemyKey, template] of Object.entries(enemyTemplates)) {
      prepareEnemyTemplate(enemyKey, template);
    }

    addCharacterModel(characterFbx);
    addGunModel(pistolFbx);
    applyCurrentLevelConfig(currentLevelIndex);
    loadingEl.style.display = 'none';
    sceneReady = true;
    gameState = 'transition';
    hideStatusOverlay();
    hideLoaderScreen();
    syncScreenVisibility();
    updateSceneToggleLabel();
    updateSceneSelectorButtons();
    updateAudioToggleLabel();

    updateCamera(0);
    updatePlayerVisual();
    updateHud();
    openMenuSceneView(INTRO_SCENE_KEY);
    refreshHudMessage();
    renderer.setAnimationLoop(animate);
  } catch (error) {
    console.error(error);
    gameState = 'error';
    loadingEl.textContent = 'Loading failed. Check the console for asset errors.';
    setHudMessage('The scene could not be assembled with the current assets.');
    showStatusOverlay('Loading Failed', 'Check the console for asset errors.');
    showLoaderScreen('Loading Failed', 'One or more assets could not be loaded. Check the console for details.');
  }
}

function animate() {
  const frameDelta = Math.min(0.05, clock.getDelta());
  const stepDelta = frameDelta / STEPS_PER_FRAME;
  const now = performance.now() * 0.001;
  const simulationDelta = gameState === 'paused' ? 0 : frameDelta;
  const targetFps = 1 / Math.max(frameDelta, 1e-4);

  smoothedFps = THREE.MathUtils.lerp(smoothedFps, targetFps, 0.12);

  simulationTime += simulationDelta;

  cameraEuler.set(pitch, yaw, 0);
  cameraQuaternion.setFromEuler(cameraEuler);
  camera.quaternion.copy(cameraQuaternion);

  if ((gameState === 'playing' || gameState === 'portal') && !isGameplayBlocked()) {
    for (let step = 0; step < STEPS_PER_FRAME; step += 1) {
      controls(stepDelta);

      if (gameState === 'playing' && triggerHeld && document.pointerLockElement === renderer.domElement) {
        tryFire(now);
      }

      updatePlayer(stepDelta);
      updateBullets(stepDelta);
      updateEnemyProjectiles(stepDelta);
      if (gameState === 'playing') {
        updateSpikedEnemies(stepDelta);
        rechargeAmmo(stepDelta, now);
      }
      handleWorldBounds();
    }
  }

  if (gameState === 'dying') {
    deathScreenTimer = Math.max(0, deathScreenTimer - frameDelta);
    if (deathScreenTimer <= 0) {
      gameState = 'gameover';
      showStatusOverlay('Defeat', `${getCurrentLevelLabel()} failed.`, {
        interactive: true,
        actions: [
          { label: 'Retry', action: 'retry-level' },
          { label: 'Home', action: 'home' }
        ]
      });
      syncScreenVisibility();
    }
  }

  updateCharacterAnimation(simulationDelta);
  updateWeapon(simulationDelta);
  updateExplosionEffects(simulationDelta);
  updateShockwaveEffects(simulationDelta);
  updatePortal(simulationDelta);
  updateMenuSceneEffects(simulationDelta, simulationTime);
  updateGlowCubes(simulationTime);
  updateCamera(simulationDelta);
  updatePlayerVisual();
  updateHud();
  updateFps(smoothedFps);

  composer.render(frameDelta);
}

document.addEventListener('keydown', (event) => {
  keyStates[event.code] = true;

  if (event.code === 'Space') {
    event.preventDefault();
  }

  if (event.code === 'KeyP' && !event.repeat) {
    event.preventDefault();

    if (pauseMenuOpen) {
      setPauseMenuOpen(false, { relock: true });
    } else if (gameState === 'playing' || gameState === 'portal' || sceneSelectorOpen) {
      setPauseMenuOpen(true);
    }
  }

  if (event.code === 'KeyE' && !event.repeat) {
    event.preventDefault();
    triggerShockwave();
  }
});

document.addEventListener('keyup', (event) => {
  keyStates[event.code] = false;
});

document.addEventListener('mousemove', (event) => {
  if (document.pointerLockElement !== renderer.domElement) {
    return;
  }

  if (keyStates.AltLeft || keyStates.AltRight) {
    orbitYaw -= event.movementX * 0.0025;
    orbitPitch -= event.movementY * 0.0021;
    orbitPitch = THREE.MathUtils.clamp(orbitPitch, -0.72, 0.72);
    return;
  }

  yaw -= event.movementX * 0.0025;
  pitch -= event.movementY * 0.0021;
  pitch = THREE.MathUtils.clamp(pitch, -0.72, 0.4);

  weaponLookSway.x = THREE.MathUtils.clamp(
    weaponLookSway.x - event.movementY * 0.0015,
    -0.18,
    0.18
  );
  weaponLookSway.y = THREE.MathUtils.clamp(
    weaponLookSway.y - event.movementX * 0.0015,
    -0.18,
    0.18
  );
});

renderer.domElement.addEventListener('mousedown', (event) => {
  if (event.button !== 0) {
    return;
  }

  if (!sceneReady || gameState !== 'playing' || isGameplayBlocked()) {
    return;
  }

  if (document.pointerLockElement !== renderer.domElement) {
    requestGamePointerLock();
    return;
  }

  triggerShockwave();
  triggerHeld = true;
});

sceneToggleButton.addEventListener('click', () => {
  if (!sceneReady || gameState !== 'playing' || pauseMenuOpen) {
    return;
  }

  setSceneSelectorOpen(!sceneSelectorOpen);
});

pauseButton.addEventListener('click', () => {
  if (pauseMenuOpen) {
    setPauseMenuOpen(false, { relock: true });
    return;
  }

  if (gameState === 'playing' || gameState === 'portal' || sceneSelectorOpen) {
    setPauseMenuOpen(true);
  }
});

statusOverlay.addEventListener('click', (event) => {
  const action = event.target.closest('[data-status-action]')?.dataset.statusAction;
  if (!action) {
    return;
  }

  if (action === 'retry-level') {
    requestGamePointerLock();
    void retryCurrentLevel();
    return;
  }

  if (action === 'next-level') {
    startCampaignLevel(currentLevelIndex + 1);
    return;
  }

  if (action === 'restart-campaign') {
    resetRunStats();
    startCampaignLevel(0);
    return;
  }

  if (action === 'home') {
    void openMenuSceneViewWithTransition(INTRO_SCENE_KEY);
  }
});

startScreen.addEventListener('click', (event) => {
  const tabButton = event.target.closest('[data-start-tab]');
  if (tabButton) {
    setStartScreenTab(tabButton.dataset.startTab);
    return;
  }

  const sceneButton = event.target.closest('[data-start-scene]');
  if (sceneButton) {
    const nextSceneKey = sceneButton.dataset.startScene;
    if (getPlayableSceneConfig(nextSceneKey) && nextSceneKey !== selectedStartSceneKey) {
      selectedStartSceneKey = nextSceneKey;
      updateStartScreenSelectionUi();
      syncStartScreenPreviewScene();
    }
    return;
  }

  const levelButton = event.target.closest('[data-start-level]');
  if (levelButton) {
    selectedStartLevelIndex = Number(levelButton.dataset.startLevel);
    updateStartScreenSelectionUi();
    return;
  }

  const action = event.target.closest('[data-start-action]')?.dataset.startAction;
  if (action === 'show-intro-scene') {
    void openMenuSceneViewWithTransition(INTRO_SCENE_KEY);
    return;
  }

  if (action === 'start') {
    startSelectedRun();
  }
});

menuSceneViewButton.addEventListener('click', () => {
  closeMenuSceneView();
});

menuSceneHeroPlayButton.addEventListener('click', () => {
  startSelectedRun();
});

menuSceneControlsButton.addEventListener('click', () => {
  setControlsPopupOpen(true);
});

audioToggleButton.addEventListener('click', () => {
  toggleAudioEnabled();
});

controlsCloseButton.addEventListener('click', () => {
  setControlsPopupOpen(false);
});

controlsPopup.addEventListener('click', (event) => {
  if (event.target === controlsPopup) {
    setControlsPopupOpen(false);
  }
});

for (const [axis, input] of Object.entries(ui.menuSceneCameraPositionInputs)) {
  input.addEventListener('input', () => {
    applyMenuSceneCameraPositionValue(axis, input.value);
  });
  input.addEventListener('change', () => {
    applyMenuSceneCameraPositionValue(axis, input.value, { normalize: true });
  });
}

menuSceneCameraResetButton.addEventListener('click', () => {
  resetMenuSceneCameraControls();
  resetMenuSceneLightControls();
  resetMenuScenePlayerControls();
});

for (const [axis, input] of Object.entries(ui.menuScenePlayerPositionInputs)) {
  input.addEventListener('input', () => {
    applyMenuScenePlayerControlValue('position', axis, input.value);
  });
  input.addEventListener('change', () => {
    applyMenuScenePlayerControlValue('position', axis, input.value, { normalize: true });
  });
}

ui.menuScenePlayerRotationInput.addEventListener('input', () => {
  applyMenuScenePlayerControlValue('rotation', 'y', ui.menuScenePlayerRotationInput.value);
});
ui.menuScenePlayerRotationInput.addEventListener('change', () => {
  applyMenuScenePlayerControlValue('rotation', 'y', ui.menuScenePlayerRotationInput.value, { normalize: true });
});

ui.menuScenePlayerScaleInput.addEventListener('input', () => {
  applyMenuScenePlayerControlValue('scale', '', ui.menuScenePlayerScaleInput.value);
});
ui.menuScenePlayerScaleInput.addEventListener('change', () => {
  applyMenuScenePlayerControlValue('scale', '', ui.menuScenePlayerScaleInput.value, { normalize: true });
});

for (const [axis, input] of Object.entries(ui.menuSceneLightPositionInputs)) {
  input.addEventListener('input', () => {
    applyMenuSceneLightControlValue('position', axis, input.value);
  });
}

for (const [axis, input] of Object.entries(ui.menuSceneLightTargetInputs)) {
  input.addEventListener('input', () => {
    applyMenuSceneLightControlValue('target', axis, input.value);
  });
}

ui.menuSceneLightIntensityInput.addEventListener('input', () => {
  applyMenuSceneLightControlValue('intensity', '', ui.menuSceneLightIntensityInput.value);
});

sceneSelector.addEventListener('click', (event) => {
  const option = event.target.closest('[data-scene]');
  if (!option) {
    return;
  }

  const nextSceneKey = option.dataset.scene;
  if (!getPlayableSceneConfig(nextSceneKey)) {
    return;
  }

  void switchPlayableSceneWithTransition(nextSceneKey);
});

pauseMenu.addEventListener('click', (event) => {
  const action = event.target.closest('[data-pause-action]')?.dataset.pauseAction;
  if (action === 'resume') {
    setPauseMenuOpen(false, { relock: true });
    return;
  }

  if (action === 'restart') {
    restartGame();
    if (document.pointerLockElement !== renderer.domElement) {
      renderer.domElement.requestPointerLock();
    }
    return;
  }

  if (action === 'home') {
    void openMenuSceneViewWithTransition(INTRO_SCENE_KEY);
    return;
  }
});

document.addEventListener('pointerover', (event) => {
  const button = event.target.closest('button');
  if (!button || button.disabled || button.contains(event.relatedTarget)) {
    return;
  }

  playUiHoverSfx();
});

document.addEventListener('pointerdown', unlockAudioOnUserGesture);
document.addEventListener('keydown', unlockAudioOnUserGesture);

document.addEventListener('mouseup', (event) => {
  if (event.button === 0) {
    triggerHeld = false;
  }
});

document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement !== renderer.domElement) {
    triggerHeld = false;
  }

  refreshHudMessage();
});

document.addEventListener('contextmenu', (event) => event.preventDefault());

window.addEventListener('blur', clearInputState);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

updateHud();
init();
