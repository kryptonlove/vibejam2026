function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function updateSegmentCollection(elements, normalizedValue, { mode = 'scale-x' } = {}) {
  const totalSegments = elements.length || 1;
  const scaledValue = clamp(normalizedValue, 0, 1) * totalSegments;

  elements.forEach((element, index) => {
    const fill = clamp(scaledValue - index, 0, 1);

    if (mode === 'clip-right') {
      element.style.clipPath = fill <= 0 ? 'inset(0 100% 0 0)' : `inset(0 ${100 - fill * 100}% 0 0)`;
      element.style.opacity = fill <= 0 ? '0' : '1';
      return;
    }

    element.style.transform = `scaleX(${fill})`;
    element.style.opacity = fill <= 0 ? '0' : '1';
  });
}

export function showStatusOverlay(statusOverlay, title, hint = '', { interactive = false, buttonLabel = '', buttonAction = '', actions = null } = {}) {
  const resolvedActions = actions ?? (buttonLabel ? [{ label: buttonLabel, action: buttonAction }] : []);
  statusOverlay.classList.toggle('status-overlay--interactive', interactive);
  statusOverlay.innerHTML = `
    <strong class="status-overlay__title">${title}</strong>
    ${hint ? `<span class="status-overlay__hint">${hint}</span>` : ''}
    ${
      resolvedActions.length
        ? `<div class="status-overlay__actions">${resolvedActions
            .map(
              ({ label, action }) =>
                `<button class="status-overlay__button ui-pixel-button ui-pixel-button--yellow" type="button" data-status-action="${action}">${label}</button>`
            )
            .join('')}</div>`
        : ''
    }
  `;
  statusOverlay.hidden = false;
}

export function hideStatusOverlay(statusOverlay) {
  statusOverlay.classList.remove('status-overlay--interactive');
  statusOverlay.hidden = true;
}

export function syncScreenVisibility(ui, { startScreenOpen, menuSceneViewOpen, sceneReady, pauseMenuOpen, gameState }) {
  const overlayGameplayState =
    gameState === 'transition' ||
    gameState === 'cutscene' ||
    gameState === 'upgrading' ||
    gameState === 'gameover';
  ui.startScreen.hidden = true;
  ui.menuSceneViewButton.hidden = true;
  ui.menuSceneHero.hidden = true;
  ui.menuSceneCameraPanel.hidden = true;
  ui.hud.hidden = startScreenOpen || menuSceneViewOpen || overlayGameplayState;
  ui.fpsEl.hidden =
    !sceneReady ||
    startScreenOpen ||
    menuSceneViewOpen ||
    (gameState !== 'playing' && gameState !== 'paused' && gameState !== 'portal');
  ui.pauseControlEl.hidden =
    !sceneReady ||
    startScreenOpen ||
    menuSceneViewOpen ||
    (gameState !== 'playing' && gameState !== 'paused' && gameState !== 'portal');
  ui.sceneToggleButton.hidden = true;
}

function formatControlValue(value) {
  return `${Math.round(value * 1000) / 1000}`;
}

export function setMenuSceneCameraControlsVisible(ui, visible) {
  ui.menuSceneCameraPanel.hidden = !visible;
}

export function setMenuSceneHeroVisible(ui, visible) {
  ui.menuSceneHero.hidden = !visible;
}

export function setMenuSceneLightControlsVisible(ui, visible) {
  for (const section of ui.menuSceneLightControlSections) {
    section.hidden = !visible;
  }
}

export function setMenuScenePlayerControlsVisible(ui, visible) {
  for (const section of ui.menuScenePlayerControlSections) {
    section.hidden = !visible;
  }
}

export function updateMenuSceneCameraControls(ui, { position }) {
  for (const axis of ['x', 'y', 'z']) {
    ui.menuSceneCameraPositionInputs[axis].value = formatControlValue(position[axis]);
  }
}

export function updateMenuScenePlayerControls(ui, { position, rotationDegrees, scale }) {
  for (const axis of ['x', 'y', 'z']) {
    ui.menuScenePlayerPositionInputs[axis].value = formatControlValue(position[axis]);
  }

  ui.menuScenePlayerRotationInput.value = formatControlValue(rotationDegrees);
  ui.menuScenePlayerScaleInput.value = formatControlValue(scale);
}

export function updateMenuSceneLightControls(ui, { position, target, intensity }) {
  for (const axis of ['x', 'y', 'z']) {
    ui.menuSceneLightPositionInputs[axis].value = `${position[axis]}`;
    ui.menuSceneLightTargetInputs[axis].value = `${target[axis]}`;
    ui.menuSceneLightOutputs.position[axis].textContent = formatControlValue(position[axis]);
    ui.menuSceneLightOutputs.target[axis].textContent = formatControlValue(target[axis]);
  }

  ui.menuSceneLightIntensityInput.value = `${intensity}`;
  ui.menuSceneLightOutputs.intensity.textContent = formatControlValue(intensity);
}

export function updateStartScreenSelectionUi(
  ui,
  {
    selectedStartLevelIndex,
    selectedStartSceneKey,
    startScreenTab,
    enemyLevels,
    playableWorldScenes,
    worldScenes,
    startScreenPreviewSceneKey
  }
) {
  if (!ui.startSummaryLevelEl || !ui.startSummarySceneEl || !ui.startSummaryPreviewEl) {
    return;
  }

  const levelConfig = enemyLevels[selectedStartLevelIndex];
  ui.startSummaryLevelEl.textContent =
    `${levelConfig.label} · ${levelConfig.enemies?.length ?? 3} ${levelConfig.enemyPluralLabel}`;
  ui.startSummarySceneEl.textContent = playableWorldScenes[selectedStartSceneKey]?.label ?? selectedStartSceneKey;
  ui.startSummaryPreviewEl.textContent =
    `Preview · ${worldScenes[startScreenPreviewSceneKey]?.label ?? startScreenPreviewSceneKey}`;
  if (ui.startMenuSceneButton) {
    ui.startMenuSceneButton.textContent = 'View Intro Scene';
  }

  for (const button of ui.startTabButtons) {
    button.classList.toggle('is-active', button.dataset.startTab === startScreenTab);
  }

  for (const button of ui.startSceneButtons) {
    button.classList.toggle('is-active', button.dataset.startScene === selectedStartSceneKey);
  }

  for (const button of ui.startLevelButtons) {
    button.classList.toggle('is-active', Number(button.dataset.startLevel) === selectedStartLevelIndex);
  }
}

export function updateLoaderScreen(ui, { title, hint, loaded, total }) {
  const safeTotal = Math.max(total, 1);
  const progress = clamp(loaded / safeTotal, 0, 1);

  ui.loaderTitleEl.textContent = title;
  ui.loaderHintEl.textContent = hint;
  ui.loaderFillEl.style.width = `${progress * 100}%`;
  ui.loaderProgressEl.textContent = 'Loading';
  ui.loaderPercentEl.textContent = `${Math.round(progress * 100)}%`;
}

export function showLoaderScreen(ui, { title, hint, loaded, total }) {
  ui.loaderScreen.hidden = false;
  updateLoaderScreen(ui, { title, hint, loaded, total });
}

export function hideLoaderScreen(ui) {
  ui.loaderScreen.hidden = true;
}

export function updateFps(ui, fps) {
  ui.fpsEl.textContent = `${Math.round(fps)}`;
}

export function updateHud(
  ui,
  {
    hp,
    ammo,
    maxHp,
    maxAmmo,
    levelProgressText,
    activeEnemyHudTarget,
    spikedEnemies,
    enemyMaxHp
  }
) {
  const hpPercent = clamp(hp / maxHp, 0, 1);
  const ammoPercent = clamp(ammo / maxAmmo, 0, 1);
  let nextActiveEnemyHudTarget = activeEnemyHudTarget;

  ui.levelValueEl.textContent = levelProgressText;
  updateSegmentCollection(ui.heartFillEls, hpPercent, { mode: 'clip-right' });
  updateSegmentCollection(ui.ammoSegmentEls, ammoPercent);

  if (
    (!nextActiveEnemyHudTarget || !nextActiveEnemyHudTarget.alive || nextActiveEnemyHudTarget.healthHudTimer <= 0) &&
    spikedEnemies.some((enemy) => enemy.alive && enemy.healthHudTimer > 0)
  ) {
    nextActiveEnemyHudTarget = spikedEnemies.find((enemy) => enemy.alive && enemy.healthHudTimer > 0) ?? null;
  }

  if (nextActiveEnemyHudTarget && nextActiveEnemyHudTarget.alive && nextActiveEnemyHudTarget.healthHudTimer > 0) {
    const enemyPercent = clamp(nextActiveEnemyHudTarget.hp / enemyMaxHp, 0, 1);
    ui.enemyHudEl.hidden = false;
    ui.enemyValueEl.textContent = '';
    ui.enemyFillEl.style.width = `${enemyPercent * 100}%`;
  } else {
    nextActiveEnemyHudTarget = null;
    ui.enemyHudEl.hidden = true;
  }

  return nextActiveEnemyHudTarget;
}

export function setHudMessage(ui, text) {
  ui.messageEl.innerHTML = text;
}
