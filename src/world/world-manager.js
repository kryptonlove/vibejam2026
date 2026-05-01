export function getPlayableSceneConfig(playableWorldScenes, sceneKey) {
  return playableWorldScenes[sceneKey] ?? null;
}

export function createWorldSceneRoot({ worldSceneFactories, loadedWorldTemplates, sceneKey }) {
  const factory = worldSceneFactories[sceneKey];
  if (factory) {
    return factory();
  }

  const template = loadedWorldTemplates[sceneKey];
  return template?.clone(true) ?? null;
}

export function clearWorldScene({
  scene,
  currentWorldRoot,
  currentCollisionRoot,
  worldMeshes,
  worldOctree,
  worldBounds,
  clearGlowCubes,
  clearExplosionEffects,
  clearMenuSceneEffects
}) {
  clearGlowCubes();
  clearExplosionEffects();
  clearMenuSceneEffects();
  worldMeshes.length = 0;
  worldOctree.clear();
  worldBounds.makeEmpty();

  const nestedCollisionRoot = Boolean(
    currentWorldRoot &&
    currentCollisionRoot &&
    currentCollisionRoot !== currentWorldRoot &&
    currentWorldRoot.getObjectById(currentCollisionRoot.id)
  );

  if (currentCollisionRoot && currentCollisionRoot !== currentWorldRoot && !nestedCollisionRoot) {
    currentCollisionRoot.traverse((child) => {
      if (!child.isMesh) {
        return;
      }

      if (child.userData?.disposeGeometry) {
        child.geometry?.dispose?.();
      }

      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material?.dispose?.());
      } else {
        child.material?.dispose?.();
      }
    });
  }

  if (!currentWorldRoot) {
    return {
      currentCollisionRoot: null,
      currentWorldRoot: null,
      worldFloor: -10
    };
  }

  currentWorldRoot.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    if (child.userData?.disposeGeometry) {
      child.geometry?.dispose?.();
    }

    if (Array.isArray(child.material)) {
      child.material.forEach((material) => material?.dispose?.());
    } else {
      child.material?.dispose?.();
    }
  });

  scene.remove(currentWorldRoot);

  return {
    currentCollisionRoot: null,
    currentWorldRoot: null,
    worldFloor: -10
  };
}

export function applyWorldScene({
  sceneKey,
  restartPlayer = true,
  createWorldSceneRoot,
  clearBullets,
  spikedEnemies,
  clearWorldScene,
  setActiveSceneKey,
  setCurrentWorldRoot,
  addWorldScene,
  setupMenuSceneEffects,
  getSceneSpawnPoint,
  playerSpawn,
  restartGame,
  respawnPlayer,
  worldScenes,
  hideSpikedEnemies,
  configureNonPlayableScenePlayerPose,
  resetSpikedEnemies,
  updateCamera,
  updatePlayerVisual,
  addGlowCubesForScene,
  updateSceneToggleLabel,
  updateSceneSelectorButtons,
  refreshHudMessage,
  setActiveEnemyHudTarget
}) {
  const worldRoot = createWorldSceneRoot(sceneKey);
  if (!worldRoot) {
    return false;
  }

  clearBullets();
  setActiveEnemyHudTarget(null);

  for (const enemyInstance of spikedEnemies) {
    enemyInstance.alive = false;
    enemyInstance.root.visible = false;
    enemyInstance.healthHudTimer = 0;
  }

  clearWorldScene();
  setActiveSceneKey(sceneKey);
  setCurrentWorldRoot(worldRoot);
  addWorldScene(worldRoot, worldRoot.userData?.collisionRoot ?? worldRoot);
  setupMenuSceneEffects();
  playerSpawn.copy(getSceneSpawnPoint(sceneKey));

  if (restartPlayer) {
    restartGame();
  } else {
    respawnPlayer(true);
    if (worldScenes[sceneKey]?.playable === false) {
      hideSpikedEnemies();
      configureNonPlayableScenePlayerPose(sceneKey);
    } else {
      resetSpikedEnemies();
    }
    updateCamera(0);
    updatePlayerVisual();
  }

  addGlowCubesForScene(sceneKey);
  updateSceneToggleLabel();
  updateSceneSelectorButtons();
  refreshHudMessage();
  return true;
}
