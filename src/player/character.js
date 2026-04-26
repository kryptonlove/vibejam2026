import * as THREE from 'three';

export function applyGunMountConfig(state, position, rotation, muzzlePosition) {
  const { gunBasePosition, gunBaseRotation, gunMount, muzzleAnchor } = state;
  gunBasePosition.copy(position);
  gunBaseRotation.copy(rotation);
  gunMount.position.copy(position);
  gunMount.rotation.copy(rotation);
  muzzleAnchor.position.copy(muzzlePosition);
}

export function applyCharacterGunModelTransform(state, model) {
  if (!model) {
    return;
  }

  const {
    characterScale,
    characterGunScaleMultiplier,
    characterGunModelPosition,
    characterGunModelRotation
  } = state;

  model.scale.setScalar(characterScale * characterGunScaleMultiplier);
  model.position.copy(characterGunModelPosition);
  model.rotation.copy(characterGunModelRotation);
}

export function deriveGunMuzzlePosition(state, model, mount, target) {
  const {
    tempBox,
    tempBox2,
    tempMatrix4A,
    tempMatrix4B,
    fallbackCharacterMuzzlePosition,
    bulletRadius
  } = state;

  if (!model || !mount) {
    target.copy(fallbackCharacterMuzzlePosition);
    return false;
  }

  mount.updateWorldMatrix(true, false);
  model.updateWorldMatrix(true, true);
  tempBox2.makeEmpty();
  tempMatrix4A.copy(mount.matrixWorld).invert();

  model.traverse((child) => {
    if (!child.isMesh || !child.geometry) {
      return;
    }

    if (!child.geometry.boundingBox) {
      child.geometry.computeBoundingBox();
    }

    if (!child.geometry.boundingBox) {
      return;
    }

    tempBox.copy(child.geometry.boundingBox);
    tempMatrix4B.multiplyMatrices(tempMatrix4A, child.matrixWorld);
    tempBox.applyMatrix4(tempMatrix4B);
    tempBox2.union(tempBox);
  });

  if (tempBox2.isEmpty()) {
    target.copy(fallbackCharacterMuzzlePosition);
    return false;
  }

  const width = tempBox2.max.x - tempBox2.min.x;
  const height = tempBox2.max.y - tempBox2.min.y;
  target.set(
    tempBox2.min.x + width * 0.5,
    tempBox2.min.y + height * 0.62,
    tempBox2.min.z - bulletRadius * 1.5
  );
  return true;
}

export function updateCharacterMuzzlePosition(state) {
  const { playerGunModel, gunMount, characterMuzzlePosition } = state;

  if (deriveGunMuzzlePosition(state, playerGunModel, gunMount, characterMuzzlePosition)) {
    return;
  }

  characterMuzzlePosition.copy(state.fallbackCharacterMuzzlePosition);
}

export function getAnchorWorldPosition(anchor, target) {
  anchor.updateWorldMatrix(true, false);
  return anchor.getWorldPosition(target);
}

export function syncCharacterGunTransforms(state) {
  const {
    characterGunMountPosition,
    characterGunMountRotation,
    characterMuzzlePosition,
    muzzleAnchor
  } = state;

  applyGunMountConfig(state, characterGunMountPosition, characterGunMountRotation, characterMuzzlePosition);

  applyCharacterGunModelTransform(state, state.playerGunModel);
  updateCharacterMuzzlePosition(state);
  muzzleAnchor.position.copy(characterMuzzlePosition);
}

export function setAvatarVisibility(state, visible) {
  const { avatarRoot, fallbackAvatar, gunMount, characterModel } = state;
  avatarRoot.visible = visible && !!characterModel;
  fallbackAvatar.visible = visible && !characterModel;
  gunMount.visible = visible;
}

export function cloneCharacterMaterial(state, material, isSkinnedMesh = false) {
  const cloned = material ? material.clone() : new THREE.MeshStandardMaterial();
  if (cloned.color) {
    cloned.color.set(0xffffff);
  }
  cloned.roughness = 0.74;
  cloned.metalness = 0.04;
  cloned.skinning = isSkinnedMesh;
  cloned.map = state.characterTexture;

  if (state.characterTexture) {
    cloned.map = state.characterTexture;
  }

  cloned.needsUpdate = true;
  return cloned;
}

export function clonePistolMaterial(state, material) {
  const cloned = material ? material.clone() : new THREE.MeshStandardMaterial();
  cloned.color?.set(0xffffff);
  cloned.map = state.pistolTexture;
  cloned.roughness = 0.4;
  cloned.metalness = 0.2;
  cloned.needsUpdate = true;
  return cloned;
}

export function setCharacterAction(
  { characterActions, activeCharacterAction, activeCharacterActionName },
  name,
  { fade = 0.16, force = false, loopOnce = false } = {}
) {
  const action = characterActions[name];
  if (!action) {
    return { activeCharacterAction, activeCharacterActionName };
  }

  action.enabled = true;
  action.paused = false;
  action.clampWhenFinished = loopOnce;
  action.setLoop(loopOnce ? THREE.LoopOnce : THREE.LoopRepeat, loopOnce ? 1 : Infinity);
  action.setEffectiveTimeScale(1);
  action.setEffectiveWeight(1);

  if (activeCharacterAction === action && !force) {
    return { activeCharacterAction, activeCharacterActionName };
  }

  if (activeCharacterAction && activeCharacterAction !== action) {
    activeCharacterAction.fadeOut(fade);
  }

  action.reset();
  action.fadeIn(fade);
  action.play();

  return {
    activeCharacterAction: action,
    activeCharacterActionName: name
  };
}

export function updateCharacterAnimation(state, deltaTime) {
  const {
    characterMixer,
    gameState,
    keyStates,
    playerOnFloor,
    characterActions,
    activeCharacterAction,
    activeCharacterActionName
  } = state;

  let { shootActionTimer } = state;

  if (!characterMixer) {
    return { shootActionTimer, activeCharacterAction, activeCharacterActionName };
  }

  characterMixer.update(deltaTime);

  if (gameState !== 'playing') {
    return { shootActionTimer, activeCharacterAction, activeCharacterActionName };
  }

  shootActionTimer = Math.max(0, shootActionTimer - deltaTime);

  let targetAction = 'Armature|idle with pistol';
  const hasMoveInput = Boolean(
    keyStates.KeyW ||
    keyStates.KeyA ||
    keyStates.KeyS ||
    keyStates.KeyD
  );
  const sprinting = hasMoveInput && (keyStates.ShiftLeft || keyStates.ShiftRight);

  if (!playerOnFloor) {
    targetAction = 'Armature|jump';
  } else if (shootActionTimer > 0) {
    targetAction = 'Armature|shoot with pistol';
  } else if (sprinting) {
    targetAction = 'Armature|run with pistol';
  } else if (hasMoveInput) {
    targetAction = 'Armature|walk with pistol';
  }

  const actionState = setCharacterAction(
    { characterActions, activeCharacterAction, activeCharacterActionName },
    targetAction,
    targetAction === 'Armature|shoot with pistol'
      ? { fade: 0.08, loopOnce: true }
      : undefined
  );

  return {
    shootActionTimer,
    ...actionState
  };
}

export function addCharacterModel(state, fbx) {
  const {
    avatarRoot,
    tempBox,
    tempVectorA,
    tempVectorB,
    characterActions,
    characterTargetHeight
  } = state;

  avatarRoot.clear();

  fbx.traverse((child) => {
    if (!child.isMesh && !child.isSkinnedMesh) {
      return;
    }

    child.castShadow = true;
    child.receiveShadow = true;

    if (Array.isArray(child.material)) {
      child.material = child.material.map((material) =>
        cloneCharacterMaterial(state, material, child.isSkinnedMesh)
      );
    } else {
      child.material = cloneCharacterMaterial(state, child.material, child.isSkinnedMesh);
    }
  });

  tempBox.setFromObject(fbx);
  const size = tempBox.getSize(tempVectorA);
  const characterScale = characterTargetHeight / Math.max(size.y, 1);

  fbx.scale.setScalar(characterScale);
  fbx.rotation.set(0, Math.PI, 0);
  fbx.updateMatrixWorld(true);

  tempBox.setFromObject(fbx);
  const center = tempBox.getCenter(tempVectorB);
  fbx.position.set(-center.x, -tempBox.min.y, -center.z);
  fbx.updateMatrixWorld(true);

  avatarRoot.add(fbx);
  const weaponHolderBone = fbx.getObjectByName('weaponHolderR');
  const characterMixer = new THREE.AnimationMixer(fbx);

  for (const clip of fbx.animations) {
    characterActions[clip.name] = characterMixer.clipAction(clip);
  }

  const actionState = setCharacterAction(
    {
      characterActions,
      activeCharacterAction: null,
      activeCharacterActionName: ''
    },
    'Armature|idle with pistol',
    { fade: 0.01, force: true }
  );

  return {
    characterModel: fbx,
    weaponHolderBone,
    characterMixer,
    characterScale,
    ...actionState
  };
}

export function addGunModel(state, fbx) {
  const {
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
  } = state;

  fallbackGun.visible = false;
  let playerGunModel = null;

  fbx.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.castShadow = true;
    child.receiveShadow = true;

    if (Array.isArray(child.material)) {
      child.material = child.material.map((material) => material.clone());
      child.material.forEach((material) => {
        material.color?.set(0xffffff);
        material.map = pistolTexture;
        material.roughness = 0.4;
        material.metalness = 0.2;
        material.needsUpdate = true;
      });
    } else if (child.material) {
      child.material = child.material.clone();
      child.material.color?.set(0xffffff);
      child.material.map = pistolTexture;
      child.material.roughness = 0.4;
      child.material.metalness = 0.2;
      child.material.needsUpdate = true;
    }
  });

  if (weaponHolderBone) {
    gunMount.removeFromParent();
    weaponHolderBone.add(gunMount);
    playerGunModel = fbx;
  } else {
    if (gunMount.parent !== playerVisual) {
      gunMount.removeFromParent();
      playerVisual.add(gunMount);
    }

    applyGunMountConfig(state, fallbackGunMountPosition, fallbackGunMountRotation, fallbackMuzzlePosition);

    fbx.updateMatrixWorld(true);
    tempBox.setFromObject(fbx);
    const size = tempBox.getSize(tempVectorA);
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const scale = 0.72 / maxDimension;

    fbx.scale.setScalar(scale);
    fbx.rotation.set(0, Math.PI, 0);
    fbx.position.set(0.08, -0.08, -0.28);
  }

  gunMount.add(fbx);

  return {
    playerGunModel,
    shouldSyncCharacterGunTransforms: Boolean(weaponHolderBone)
  };
}
