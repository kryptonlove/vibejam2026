import * as THREE from 'three';

const tempWorldQuaternion = new THREE.Quaternion();

function syncPerspectiveCameraProjection(camera, fov, near, far) {
  if (!camera.isPerspectiveCamera) {
    return;
  }

  const projectionChanged =
    Math.abs(camera.fov - fov) > 1e-4 ||
    Math.abs(camera.near - near) > 1e-6 ||
    Math.abs(camera.far - far) > 1e-6;

  if (!projectionChanged) {
    return;
  }

  camera.fov = fov;
  camera.near = near;
  camera.far = far;
  camera.updateProjectionMatrix();
}

export function setPlayerFootPosition(state, position) {
  const { playerCollider, playerRadius, playerCapsuleTop } = state;
  playerCollider.start.set(position.x, position.y + playerRadius, position.z);
  playerCollider.end.set(position.x, position.y + playerCapsuleTop, position.z);
}

export function getPlayerFootPosition(state, target) {
  return target.copy(state.playerCollider.start).addScaledVector(state.up, -state.playerRadius);
}

export function respawnPlayer(state, resetHealth = false, hp) {
  setPlayerFootPosition(state, state.playerSpawn);
  state.playerVelocity.set(0, 0, 0);
  return resetHealth ? state.maxHp : hp;
}

export function damagePlayer(state, hp, amount) {
  return THREE.MathUtils.clamp(hp - amount, 0, state.maxHp);
}

export function getForwardVector(state) {
  state.playerDirection.set(-Math.sin(state.yaw), 0, -Math.cos(state.yaw));
  return state.playerDirection;
}

export function getSideVector(state) {
  state.playerDirection.set(Math.cos(state.yaw), 0, -Math.sin(state.yaw));
  return state.playerDirection;
}

export function playerCollisions(state) {
  const result = state.worldOctree.capsuleIntersect(state.playerCollider);
  let playerOnFloor = false;

  if (result) {
    playerOnFloor = result.normal.y > 0;

    if (!playerOnFloor) {
      state.playerVelocity.addScaledVector(result.normal, -result.normal.dot(state.playerVelocity));
    }

    if (result.depth >= 1e-10) {
      state.playerCollider.translate(result.normal.multiplyScalar(result.depth));
    }
  }

  return playerOnFloor;
}

export function controls(state, deltaTime) {
  const sprinting = state.keyStates.ShiftLeft || state.keyStates.ShiftRight;
  const acceleration = sprinting ? state.sprintAcceleration : state.walkAcceleration;
  const airControl = state.playerOnFloor ? 1 : 0.35;
  const speedDelta = deltaTime * acceleration * airControl;

  if (state.keyStates.KeyW) {
    state.playerVelocity.add(getForwardVector(state).multiplyScalar(speedDelta));
  }

  if (state.keyStates.KeyS) {
    state.playerVelocity.add(getForwardVector(state).multiplyScalar(-speedDelta));
  }

  if (state.keyStates.KeyA) {
    state.playerVelocity.add(getSideVector(state).multiplyScalar(-speedDelta));
  }

  if (state.keyStates.KeyD) {
    state.playerVelocity.add(getSideVector(state).multiplyScalar(speedDelta));
  }

  if (state.playerOnFloor && state.keyStates.Space) {
    state.playerVelocity.y = state.jumpVelocity;
  }
}

export function updatePlayer(state, deltaTime) {
  let damping = Math.exp(-4 * deltaTime) - 1;

  if (!state.playerOnFloor) {
    state.playerVelocity.y -= state.gravity * deltaTime;
    damping *= 0.15;
  }

  state.playerVelocity.addScaledVector(state.playerVelocity, damping);
  state.playerCollider.translate(state.tempVectorA.copy(state.playerVelocity).multiplyScalar(deltaTime));
  return playerCollisions(state);
}

export function updatePlayerVisual(state) {
  state.playerVisual.position.copy(getPlayerFootPosition(state, state.tempVectorA));
  state.playerVisual.rotation.y = state.yaw;

  if (state.shouldHideGameplayAvatar?.()) {
    state.setAvatarVisibility(false);
    return;
  }

  const cameraDistance = state.camera.position.distanceTo(state.cameraTarget);
  state.setAvatarVisibility(cameraDistance > 1.1);
}

export function updateWeapon(state, deltaTime) {
  let {
    walkBob,
    recoilBack,
    recoilUp,
    recoilTwist,
    muzzleFlashTimer
  } = state;

  state.movementVelocity.set(state.playerVelocity.x, 0, state.playerVelocity.z);
  const groundedSpeed = state.movementVelocity.length();

  if (state.playerOnFloor && groundedSpeed > 0.4) {
    walkBob += deltaTime * groundedSpeed * 0.22;
  }

  const bobX = Math.sin(walkBob) * 0.04;
  const bobY = Math.abs(Math.cos(walkBob * 2)) * 0.028;
  const lookDamping = Math.exp(-12 * deltaTime);
  state.weaponLookSway.multiplyScalar(lookDamping);

  const swayTargetX = THREE.MathUtils.clamp(state.weaponLookSway.x * 0.75 + bobY, -0.16, 0.16);
  const swayTargetY = THREE.MathUtils.clamp(state.weaponLookSway.y * 0.75 + bobX, -0.16, 0.16);
  const swayLerp = 1 - Math.exp(-14 * deltaTime);

  state.weaponSway.x = THREE.MathUtils.lerp(state.weaponSway.x, swayTargetX, swayLerp);
  state.weaponSway.y = THREE.MathUtils.lerp(state.weaponSway.y, swayTargetY, swayLerp);

  recoilBack = THREE.MathUtils.lerp(recoilBack, 0, 1 - Math.exp(-18 * deltaTime));
  recoilUp = THREE.MathUtils.lerp(recoilUp, 0, 1 - Math.exp(-16 * deltaTime));
  recoilTwist = THREE.MathUtils.lerp(recoilTwist, 0, 1 - Math.exp(-14 * deltaTime));

  state.gunMount.position.set(
    state.gunBasePosition.x + state.weaponSway.y * 0.16,
    state.gunBasePosition.y + state.weaponSway.x * 0.1,
    state.gunBasePosition.z + recoilBack
  );

  state.gunMount.rotation.set(
    state.gunBaseRotation.x + state.weaponSway.x * 0.38 - recoilUp,
    state.gunBaseRotation.y + state.weaponSway.y * 0.55,
    state.gunBaseRotation.z - state.weaponSway.y * 0.32 + recoilTwist
  );

  if (muzzleFlashTimer > 0) {
    muzzleFlashTimer = Math.max(0, muzzleFlashTimer - deltaTime);
    const intensity = muzzleFlashTimer / Math.max(state.muzzleFlashDuration, 0.001);
    state.muzzleFlash.visible = true;
    state.muzzleFlash.intensity = 18 * intensity;
  } else {
    state.muzzleFlash.visible = false;
    state.muzzleFlash.intensity = 0;
  }

  return {
    walkBob,
    recoilBack,
    recoilUp,
    recoilTwist,
    muzzleFlashTimer
  };
}

export function updateCamera(state, deltaTime = 0) {
  let { orbitYaw, orbitPitch } = state;
  const fixedView = state.getFixedSceneViewConfig?.();
  const fixedCameraOverride = state.fixedCameraOverride;

  if (fixedView) {
    const fixedSceneCamera =
      (fixedView.cameraName
        ? state.currentWorldRoot?.getObjectByName(fixedView.cameraName)
        : null) ?? state.currentWorldRoot?.getObjectByProperty('isCamera', true);

    if (fixedSceneCamera?.isCamera) {
      fixedSceneCamera.updateWorldMatrix(true, false);
      fixedSceneCamera.getWorldPosition(state.desiredCameraPosition);
      fixedSceneCamera.getWorldQuaternion(tempWorldQuaternion);
      state.camera.position.copy(state.desiredCameraPosition);
      state.camera.quaternion.copy(tempWorldQuaternion);

      if (fixedSceneCamera.isPerspectiveCamera) {
        syncPerspectiveCameraProjection(
          state.camera,
          fixedSceneCamera.fov,
          fixedSceneCamera.near,
          fixedSceneCamera.far
        );
      }

      if (fixedCameraOverride?.enabled) {
        state.camera.position.copy(fixedCameraOverride.position);
        state.camera.quaternion.setFromEuler(fixedCameraOverride.rotation);
      }

      return { orbitYaw, orbitPitch };
    }

    const cameraAnchor = state.currentWorldRoot?.getObjectByName(
      fixedView.cameraAnchorName ?? 'MenuCameraAnchor'
    );
    const lookAnchor = state.currentWorldRoot?.getObjectByName(
      fixedView.lookAnchorName ?? 'MenuLookAnchor'
    );

    if (cameraAnchor && lookAnchor) {
      cameraAnchor.getWorldPosition(state.desiredCameraPosition);
      lookAnchor.getWorldPosition(state.cameraTarget);
      state.camera.position.copy(state.desiredCameraPosition);
      state.camera.lookAt(state.cameraTarget);

      if (fixedCameraOverride?.enabled) {
        state.camera.position.copy(fixedCameraOverride.position);
        state.camera.quaternion.setFromEuler(fixedCameraOverride.rotation);
      }

      return { orbitYaw, orbitPitch };
    }
  }

  if (!(state.keyStates.AltLeft || state.keyStates.AltRight)) {
    const settle = 1 - Math.exp(-10 * deltaTime);
    orbitYaw = THREE.MathUtils.lerp(orbitYaw, 0, settle);
    orbitPitch = THREE.MathUtils.lerp(orbitPitch, 0, settle);
  }

  if (state.gameplayCameraFov !== undefined) {
    syncPerspectiveCameraProjection(
      state.camera,
      state.gameplayCameraFov,
      state.gameplayCameraNear,
      state.gameplayCameraFar
    );
  }

  state.cameraTarget.copy(state.playerCollider.end).addScaledVector(state.up, -0.12);

  const cameraYaw = state.yaw + orbitYaw;
  const cameraPitch = THREE.MathUtils.clamp(state.pitch + orbitPitch, -1.05, 0.5);

  state.cameraEuler.set(cameraPitch, cameraYaw, 0);
  state.cameraQuaternion.setFromEuler(state.cameraEuler);
  state.desiredCameraPosition
    .copy(state.cameraOffset)
    .applyQuaternion(state.cameraQuaternion)
    .add(state.cameraTarget);

  state.cameraRayDirection.subVectors(state.desiredCameraPosition, state.cameraTarget);
  const desiredDistance = state.cameraRayDirection.length();
  state.cameraRayDirection.normalize();

  state.obstacleRaycaster.set(state.cameraTarget, state.cameraRayDirection);
  state.obstacleRaycaster.far = desiredDistance;

  const intersections = state.obstacleRaycaster.intersectObjects(state.worldMeshes, false);
  if (intersections.length > 0) {
    state.desiredCameraPosition.copy(state.cameraTarget).addScaledVector(
      state.cameraRayDirection,
      Math.max(1.1, intersections[0].distance - state.cameraCollisionPadding)
    );
  }

  state.camera.position.copy(state.desiredCameraPosition);
  state.camera.quaternion.copy(state.cameraQuaternion);

  return { orbitYaw, orbitPitch };
}
