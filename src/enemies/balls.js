import * as THREE from 'three';

function createSpikedEnemyInstance(scene, index, targetDiameter, maxHp) {
  const root = new THREE.Group();
  const visualRoot = new THREE.Group();
  root.name = `spikedEnemy-${index}`;
  root.visible = false;
  root.add(visualRoot);
  scene.add(root);

  return {
    id: index,
    root,
    visualRoot,
    collider: new THREE.Sphere(new THREE.Vector3(0, -100 - index * 4, 0), targetDiameter * 0.5),
    velocity: new THREE.Vector3(),
    spawnCenter: new THREE.Vector3(),
    patrolTarget: new THREE.Vector3(),
    alive: false,
    grounded: false,
    hp: maxHp,
    maxHp,
    type: 'spiked',
    enemyKey: 'spikedBall',
    config: null,
    attackTimer: Math.random() * 0.5,
    dodgeTimer: 0,
    hitCooldown: 0,
    healthHudTimer: 0
  };
}

function getEnemyConfig(enemyInstance) {
  return enemyInstance.config ?? {};
}

export function createSpikedEnemies({ scene, count, targetDiameter, maxHp }) {
  return Array.from({ length: count }, (_, index) =>
    createSpikedEnemyInstance(scene, index, targetDiameter, maxHp)
  );
}

export function hideSpikedEnemies(spikedEnemies) {
  for (const enemyInstance of spikedEnemies) {
    enemyInstance.alive = false;
    enemyInstance.root.visible = false;
    enemyInstance.healthHudTimer = 0;
    enemyInstance.velocity.set(0, 0, 0);
    enemyInstance.dodgeTimer = 0;
  }

  return null;
}

export function prepareEnemyTemplate({
  renderer,
  root,
  tempBox,
  tempVectorA,
  tempVectorB,
  tempVectorC,
  targetDiameter,
  spikedEnemies
}) {
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

  root.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.castShadow = true;
    child.receiveShadow = true;
    child.frustumCulled = false;

    if (Array.isArray(child.material)) {
      child.material = child.material.map((material) => material?.clone?.() ?? material);

      for (const material of child.material) {
        material.color?.multiplyScalar(0.92);
        material.emissive?.multiplyScalar?.(0.5);
        if (material.map) {
          material.map.anisotropy = maxAnisotropy;
          material.map.colorSpace = THREE.SRGBColorSpace;
        }
      }
    } else if (child.material?.clone) {
      child.material = child.material.clone();
      child.material.color?.multiplyScalar(0.92);
      child.material.emissive?.multiplyScalar?.(0.5);
      if (child.material.map) {
        child.material.map.anisotropy = maxAnisotropy;
        child.material.map.colorSpace = THREE.SRGBColorSpace;
      }
    }
  });

  tempBox.setFromObject(root);
  const initialSize = tempBox.getSize(tempVectorA);
  const maxDimension = Math.max(initialSize.x, initialSize.y, initialSize.z) || 1;
  const scale = targetDiameter / maxDimension;
  root.scale.setScalar(scale);
  root.updateMatrixWorld(true);

  tempBox.setFromObject(root);
  const centeredSize = tempBox.getSize(tempVectorB);
  const center = tempBox.getCenter(tempVectorC);
  root.position.set(-center.x, -center.y, -center.z);
  root.updateMatrixWorld(true);

  const spikedEnemyVisualRadius = Math.max(centeredSize.x, centeredSize.y, centeredSize.z) * 0.5;
  for (const enemyInstance of spikedEnemies) {
    enemyInstance.collider.radius = spikedEnemyVisualRadius;
  }

  return spikedEnemyVisualRadius;
}

export function createSpikedEnemyModels({
  spikedEnemies,
  enemyTemplate,
  enemyTemplates = {},
  levelEnemies = [],
  enemyKey,
  configureEnemyRuntimeVisual
}) {
  for (const enemyInstance of spikedEnemies) {
    enemyInstance.visualRoot.clear();
    const enemyConfig = levelEnemies[enemyInstance.id];
    const resolvedEnemyKey = enemyConfig?.enemyKey ?? enemyKey;
    const template = enemyTemplates[resolvedEnemyKey] ?? enemyTemplate;

    if (!template) {
      enemyInstance.root.visible = false;
      enemyInstance.alive = false;
      continue;
    }

    const model = template.clone(true);
    configureEnemyRuntimeVisual(model, resolvedEnemyKey);
    enemyInstance.visualRoot.add(model);
    enemyInstance.root.visible = false;
    enemyInstance.alive = false;
  }
}

export function sphereIntersectsSphere(a, b) {
  const radius = a.radius + b.radius;
  return a.center.distanceToSquared(b.center) <= radius * radius;
}

function sphereIntersectsPlayer(state, sphere) {
  state.playerCapsuleLine.start.copy(state.playerCollider.start);
  state.playerCapsuleLine.end.copy(state.playerCollider.end);
  state.playerCapsuleLine.closestPointToPoint(sphere.center, true, state.tempVectorA);
  const radius = state.playerCollider.radius + sphere.radius;
  return state.tempVectorA.distanceToSquared(sphere.center) <= radius * radius;
}

function getEnemyCenterFromGroundPoint(target, groundPoint, up, spikedEnemyVisualRadius) {
  return target.copy(groundPoint).addScaledVector(up, spikedEnemyVisualRadius);
}

function chooseSpikedEnemyPatrolTarget(state, enemyInstance) {
  const groundPoint = state.sampleFlatGroundPoint({
    around: enemyInstance.spawnCenter,
    radius: state.spikedEnemyPatrolRadius,
    normalThreshold: 0.58,
    attempts: 90
  });

  if (groundPoint) {
    enemyInstance.patrolTarget.copy(
      getEnemyCenterFromGroundPoint(state.tempVectorA, groundPoint, state.up, state.spikedEnemyVisualRadius)
    );
  } else {
    enemyInstance.patrolTarget.copy(enemyInstance.spawnCenter);
  }
}

export function resetSpikedEnemies(state) {
  const { enemyTemplate, spikedEnemies } = state;
  const levelEnemies = state.levelEnemies ?? [];
  if (!enemyTemplate) {
    for (const enemyInstance of spikedEnemies) {
      enemyInstance.alive = false;
      enemyInstance.root.visible = false;
      enemyInstance.healthHudTimer = 0;
    }
    return null;
  }

  const occupiedCenters = [];

  for (const enemyInstance of spikedEnemies) {
    const enemyConfig = levelEnemies[enemyInstance.id];
    if (!enemyConfig) {
      enemyInstance.alive = false;
      enemyInstance.root.visible = false;
      enemyInstance.healthHudTimer = 0;
      enemyInstance.velocity.set(0, 0, 0);
      enemyInstance.dodgeTimer = 0;
      enemyInstance.collider.center.set(0, -100 - enemyInstance.id * 4, 0);
      continue;
    }

    let groundPoint = null;

    if (Array.isArray(enemyConfig.position)) {
      groundPoint = state.findGroundPointAt(
        enemyConfig.position[0],
        enemyConfig.position[2],
        0.45,
        enemyConfig.preferHighest ?? (enemyConfig.position[1] ?? 0) > 1
      ) || new THREE.Vector3(enemyConfig.position[0], enemyConfig.position[1] ?? 0.04, enemyConfig.position[2]);
    }

    for (let attempt = 0; attempt < 140 && !groundPoint; attempt += 1) {
      const candidate = state.sampleFlatGroundPoint({
        minDistanceFrom: state.playerSpawn,
        minDistanceSquared: state.spikedEnemyMinSpawnDistance * state.spikedEnemyMinSpawnDistance,
        normalThreshold: 0.58,
        attempts: 1
      });

      if (!candidate) {
        continue;
      }

      getEnemyCenterFromGroundPoint(
        state.tempVectorA,
        candidate,
        state.up,
        state.spikedEnemyVisualRadius
      );
      const overlapsExisting = occupiedCenters.some(
        (center) => center.distanceToSquared(state.tempVectorA) < (state.spikedEnemyVisualRadius * 4) ** 2
      );

      if (!overlapsExisting) {
        groundPoint = candidate.clone();
      }
    }

    groundPoint ||= state.findGroundPointAt(
      4 + enemyInstance.id * 2.2,
      -4 - enemyInstance.id * 2.2,
      0.45
    ) || new THREE.Vector3(4 + enemyInstance.id * 2.2, 0.04, -4 - enemyInstance.id * 2.2);

    const enemyVisualRadius =
      state.enemyVisualRadii?.[enemyConfig.enemyKey ?? state.currentLevelConfig.enemyKey] ??
      state.spikedEnemyVisualRadius;
    enemyInstance.collider.radius = enemyVisualRadius;

    getEnemyCenterFromGroundPoint(
      state.tempVectorA,
      groundPoint,
      state.up,
      enemyVisualRadius
    );
    enemyInstance.collider.center.copy(state.tempVectorA);
    enemyInstance.spawnCenter.copy(state.tempVectorA);
    enemyInstance.patrolTarget.copy(state.tempVectorA);
    enemyInstance.velocity.set(0, 0, 0);
    enemyInstance.type = enemyConfig.type ?? 'spiked';
    enemyInstance.enemyKey = enemyConfig.enemyKey ?? state.currentLevelConfig.enemyKey;
    enemyInstance.config = enemyConfig;
    enemyInstance.maxHp = enemyConfig.hp ?? state.spikedEnemyMaxHp;
    enemyInstance.hp = enemyInstance.maxHp;
    enemyInstance.grounded = false;
    enemyInstance.hitCooldown = 0;
    enemyInstance.dodgeTimer = 0;
    enemyInstance.attackTimer = Math.random() * 0.5;
    enemyInstance.healthHudTimer = 0;
    enemyInstance.visualRoot.rotation.set(
      Math.random() * 0.1,
      Math.random() * Math.PI * 2,
      Math.random() * 0.1
    );
    enemyInstance.root.position.copy(enemyInstance.collider.center);
    enemyInstance.root.visible = true;
    enemyInstance.alive = true;
    occupiedCenters.push(enemyInstance.collider.center.clone());
    chooseSpikedEnemyPatrolTarget(state, enemyInstance);
  }

  return null;
}

function killSpikedEnemy(state, enemyInstance, position = enemyInstance.collider.center) {
  if (!enemyInstance.alive) {
    return state.activeEnemyHudTarget;
  }

  state.spawnExplosion(position);
  enemyInstance.alive = false;
  enemyInstance.root.visible = false;
  enemyInstance.hp = 0;
  enemyInstance.hitCooldown = 0;
  enemyInstance.healthHudTimer = 0;
  enemyInstance.velocity.set(0, 0, 0);

  let activeEnemyHudTarget = state.activeEnemyHudTarget;
  if (activeEnemyHudTarget === enemyInstance) {
    activeEnemyHudTarget = null;
  }

  if (state.spikedEnemies.every((candidate) => !candidate.alive)) {
    state.completeLevel(position.clone());
  }

  return activeEnemyHudTarget;
}

export function damageSpikedEnemy(state, enemyInstance, impactPoint, damage = 1) {
  if (!enemyInstance.alive) {
    return state.activeEnemyHudTarget;
  }

  enemyInstance.hp = Math.max(0, enemyInstance.hp - damage);
  enemyInstance.healthHudTimer = 2.4;
  let activeEnemyHudTarget = enemyInstance;

  state.tempVectorA.subVectors(enemyInstance.collider.center, impactPoint);
  state.tempVectorA.y = 0;

  if (state.tempVectorA.lengthSq() < 0.0001) {
    state.tempVectorA.set(THREE.MathUtils.randFloatSpread(1), 0, THREE.MathUtils.randFloatSpread(1));
  }

  state.tempVectorA.normalize();
  enemyInstance.velocity.addScaledVector(state.tempVectorA, 2.7);
  enemyInstance.velocity.y = Math.max(enemyInstance.velocity.y, 2.2);

  const enemyConfig = getEnemyConfig(enemyInstance);
  const enemyType = enemyConfig.type ?? enemyInstance.type ?? 'spiked';
  if (enemyType === 'fire') {
    state.tempVectorB.copy(state.tempVectorA);
    state.tempVectorC.set(-state.tempVectorB.z, 0, state.tempVectorB.x).normalize();
    if (Math.random() < 0.5) {
      state.tempVectorC.multiplyScalar(-1);
    }

    enemyInstance.velocity.addScaledVector(state.tempVectorB, 3.4);
    enemyInstance.velocity.addScaledVector(state.tempVectorC, 5.2);
    enemyInstance.velocity.y = 0;
    enemyInstance.dodgeTimer = 0.42;
  }

  if (enemyInstance.hp <= 0) {
    activeEnemyHudTarget = killSpikedEnemy(state, enemyInstance, enemyInstance.collider.center.clone());
  }

  return activeEnemyHudTarget;
}

function updateSpikedEnemy(state, enemyInstance, deltaTime) {
  enemyInstance.healthHudTimer = Math.max(0, enemyInstance.healthHudTimer - deltaTime);
  enemyInstance.hitCooldown = Math.max(0, enemyInstance.hitCooldown - deltaTime);
  enemyInstance.attackTimer = Math.max(0, enemyInstance.attackTimer - deltaTime);
  enemyInstance.dodgeTimer = Math.max(0, enemyInstance.dodgeTimer - deltaTime);

  if (!enemyInstance.alive || state.gameState !== 'playing') {
    return state.activeEnemyHudTarget;
  }

  const enemyConfig = getEnemyConfig(enemyInstance);
  const enemyType = enemyConfig.type ?? enemyInstance.type ?? 'spiked';
  const detectionRadius = enemyConfig.detectionRadius ?? state.spikedEnemyChaseRadius;
  const patrolSpeed = enemyConfig.speed ?? state.spikedEnemyPatrolSpeed;
  const attackSpeed = enemyConfig.attackSpeed ?? state.spikedEnemyChaseSpeed;
  state.tempVectorE.copy(enemyInstance.collider.center);

  const playerFoot = state.getPlayerFootPosition(state.tempVectorA);
  state.tempVectorB.subVectors(playerFoot, enemyInstance.collider.center);
  state.tempVectorB.y = 0;
  const playerDistance = state.tempVectorB.length();

  let targetSpeed = 0;

  const detectedPlayer = playerDistance <= detectionRadius && playerDistance > 0.001;

  if (detectedPlayer) {
    state.tempVectorC.copy(state.tempVectorB).normalize();
    targetSpeed = enemyType === 'fire' ? patrolSpeed : attackSpeed;
  } else {
    state.tempVectorC.subVectors(enemyInstance.patrolTarget, enemyInstance.collider.center);
    state.tempVectorC.y = 0;

    if (state.tempVectorC.lengthSq() <= 0.4 * 0.4) {
      chooseSpikedEnemyPatrolTarget(state, enemyInstance);
      state.tempVectorC.subVectors(enemyInstance.patrolTarget, enemyInstance.collider.center);
      state.tempVectorC.y = 0;
    }

    if (state.tempVectorC.lengthSq() > 0.001) {
      state.tempVectorC.normalize();
      targetSpeed = patrolSpeed;
    } else {
      state.tempVectorC.set(0, 0, 0);
    }
  }

  state.movementVelocity.set(enemyInstance.velocity.x, 0, enemyInstance.velocity.z);
  state.tempVectorD.copy(state.tempVectorC).multiplyScalar(targetSpeed);
  const steeringAcceleration =
    enemyInstance.dodgeTimer > 0 ? state.spikedEnemyAcceleration * 0.24 : state.spikedEnemyAcceleration;
  state.movementVelocity.lerp(
    state.tempVectorD,
    1 - Math.exp(-steeringAcceleration * deltaTime)
  );
  enemyInstance.velocity.x = state.movementVelocity.x;
  enemyInstance.velocity.z = state.movementVelocity.z;

  const flyingEnemy = enemyType === 'fire';

  if (flyingEnemy) {
    enemyInstance.velocity.y = 0;
  } else if (!enemyInstance.grounded) {
    enemyInstance.velocity.y -= state.spikedEnemyGravity * deltaTime;
  } else {
    enemyInstance.velocity.y = Math.max(enemyInstance.velocity.y, -2);
  }

  enemyInstance.collider.center.addScaledVector(enemyInstance.velocity, deltaTime);

  const collision = state.worldOctree.sphereIntersect(enemyInstance.collider);
  enemyInstance.grounded = false;

  if (collision) {
    if (collision.depth > 1e-10) {
      enemyInstance.collider.center.addScaledVector(collision.normal, collision.depth);
    }

    if (!flyingEnemy && collision.normal.y > 0.35) {
      enemyInstance.grounded = true;
      if (enemyInstance.velocity.y < 0) {
        enemyInstance.velocity.y = 0;
      }
    }

    const velocityIntoSurface = collision.normal.dot(enemyInstance.velocity);
    if (velocityIntoSurface < 0) {
      enemyInstance.velocity.addScaledVector(collision.normal, -velocityIntoSurface);
    }
  }

  const groundPoint = state.findGroundPointAt(
    enemyInstance.collider.center.x,
    enemyInstance.collider.center.z,
    0.45
  );

  if (groundPoint) {
    const hoverLift = flyingEnemy ? state.fireSunFloatHeight + 1.15 : 0;
    const desiredY = groundPoint.y + state.spikedEnemyVisualRadius + hoverLift;
    if (flyingEnemy || (enemyInstance.collider.center.y <= desiredY + 0.28 && enemyInstance.velocity.y <= 0)) {
      enemyInstance.collider.center.y = THREE.MathUtils.lerp(
        enemyInstance.collider.center.y,
        desiredY,
        1 - Math.exp(-18 * deltaTime)
      );

      if (Math.abs(enemyInstance.collider.center.y - desiredY) < 0.025) {
        enemyInstance.collider.center.y = desiredY;
      }

      enemyInstance.velocity.y = 0;
      enemyInstance.grounded = !flyingEnemy;
    }
  }

  if (detectedPlayer && enemyType === 'fire' && enemyInstance.attackTimer <= 0) {
    enemyInstance.attackTimer = enemyConfig.fireRate ?? 0.8;
    const projectileCount = enemyConfig.projectileCount ?? 1;
    const projectileSpread = enemyConfig.projectileSpread ?? 0.16;
    state.tempVectorD.copy(state.playerCollider.start).lerp(state.playerCollider.end, 0.56);

    for (let i = 0; i < projectileCount; i += 1) {
      let projectileTarget = state.tempVectorD;
      let projectileDirection = null;

      if (projectileCount > 1) {
        const spreadOffset = (i - (projectileCount - 1) * 0.5) * projectileSpread;
        state.tempVectorA.subVectors(state.tempVectorD, enemyInstance.collider.center).normalize();
        state.tempVectorB.copy(state.tempVectorA).applyAxisAngle(state.up, spreadOffset).normalize();
        projectileTarget = null;
        projectileDirection = state.tempVectorB;
      }

      state.spawnEnemyProjectile?.({
        type: 'fire',
        position: enemyInstance.collider.center,
        target: projectileTarget,
        direction: projectileDirection,
        damage: enemyConfig.projectileDamage ?? 1,
        speed: enemyConfig.projectileSpeed ?? 14,
        radius: enemyConfig.projectileRadius ?? 0.18
      });
    }
  }

  if (
    detectedPlayer &&
    enemyType === 'lava' &&
    enemyInstance.attackTimer <= 0 &&
    !state.hasActiveEnemyProjectiles?.('lava')
  ) {
    enemyInstance.attackTimer = enemyConfig.lavaBurstInterval ?? 2.1;
    for (let i = 0; i < 6; i += 1) {
      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.28;
      state.tempVectorA.set(Math.cos(angle), 0, Math.sin(angle)).normalize();
      state.spawnEnemyProjectile?.({
        type: 'lava',
        position: enemyInstance.collider.center,
        direction: state.tempVectorA,
        damage: enemyConfig.projectileDamage ?? 1,
        speed: enemyConfig.projectileSpeed ?? 5.8,
        radius: enemyConfig.projectileRadius ?? 0.64,
        lifetime: enemyConfig.projectileLifetime ?? 12
      });
    }
  }

  enemyInstance.root.position.copy(enemyInstance.collider.center);
  const enemyKey = enemyInstance.enemyKey ?? state.currentLevelConfig.enemyKey;
  const runtimeModel = enemyInstance.visualRoot.children[0] ?? null;
  if (enemyType === 'fire' || enemyKey === 'fireSun') {
    state.updateEnemyRuntimeVisual(runtimeModel, enemyKey, state.simulationTime, deltaTime);
  } else {
    if (runtimeModel) {
      runtimeModel.position.y = 0;
    }

    state.tempVectorD.subVectors(enemyInstance.collider.center, state.tempVectorE);
    const traveled = state.tempVectorD.length();
    if (traveled > 0.0001) {
      state.tempVectorD.normalize();
      state.tempVectorB.set(state.tempVectorD.z, 0, -state.tempVectorD.x).normalize();
      enemyInstance.visualRoot.rotateOnAxis(
        state.tempVectorB,
        traveled / Math.max(state.spikedEnemyVisualRadius, 0.001)
      );
    }

    state.updateEnemyRuntimeVisual(runtimeModel, enemyKey, state.simulationTime, deltaTime);
  }

  if (sphereIntersectsPlayer(state, enemyInstance.collider) && enemyInstance.hitCooldown <= 0) {
    enemyInstance.hitCooldown = state.spikedEnemyHitCooldown;
    const nextHp = state.onPlayerDamaged(enemyConfig.damage ?? state.spikedEnemyContactDamage);

    state.getPlayerFootPosition(state.tempVectorA);
    state.tempVectorB.subVectors(state.tempVectorA, enemyInstance.collider.center);
    state.tempVectorB.y = 0;
    if (state.tempVectorB.lengthSq() < 0.0001) {
      state.tempVectorB.set(0, 0, 1);
    }
    state.tempVectorB.normalize();

    state.playerVelocity.addScaledVector(state.tempVectorB, state.spikedEnemyContactPush);
    state.playerVelocity.y = Math.max(state.playerVelocity.y, 5.8);
    enemyInstance.velocity.addScaledVector(state.tempVectorB, -state.spikedEnemyBounceSpeed);
    enemyInstance.velocity.y = Math.max(enemyInstance.velocity.y, 3.8);

    if (nextHp <= 0) {
      state.killPlayer();
    }
  }

  return state.activeEnemyHudTarget;
}

function resolveSpikedEnemyOverlaps(state) {
  for (let i = 0; i < state.spikedEnemies.length; i += 1) {
    const enemyA = state.spikedEnemies[i];
    if (!enemyA.alive) {
      continue;
    }

    for (let j = i + 1; j < state.spikedEnemies.length; j += 1) {
      const enemyB = state.spikedEnemies[j];
      if (!enemyB.alive) {
        continue;
      }

      state.tempVectorA.subVectors(enemyA.collider.center, enemyB.collider.center);
      state.tempVectorA.y = 0;
      const distance = state.tempVectorA.length();
      const minDistance = enemyA.collider.radius + enemyB.collider.radius + 0.08;

      if (distance <= 0.0001 || distance >= minDistance) {
        continue;
      }

      state.tempVectorA.normalize();
      const push = (minDistance - distance) * 0.5;
      enemyA.collider.center.addScaledVector(state.tempVectorA, push);
      enemyB.collider.center.addScaledVector(state.tempVectorA, -push);
      enemyA.root.position.copy(enemyA.collider.center);
      enemyB.root.position.copy(enemyB.collider.center);
    }
  }
}

export function updateSpikedEnemies(state, deltaTime) {
  let activeEnemyHudTarget = state.activeEnemyHudTarget;

  for (const enemyInstance of state.spikedEnemies) {
    activeEnemyHudTarget = updateSpikedEnemy(
      { ...state, activeEnemyHudTarget },
      enemyInstance,
      deltaTime
    );
  }

  resolveSpikedEnemyOverlaps(state);
  return activeEnemyHudTarget;
}
