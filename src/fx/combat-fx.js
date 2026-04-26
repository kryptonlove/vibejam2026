import * as THREE from 'three';

const AIM_DISTANCE = 240;
const ENEMY_AIM_RADIUS_MULTIPLIER = 1.3;
const tempAimSphere = new THREE.Sphere();
const tempAimPoint = new THREE.Vector3();

export function createCombatFxResources() {
  return {
    bulletGeometry: new THREE.BoxGeometry(0.08, 0.08, 0.18),
    bulletMaterial: new THREE.MeshStandardMaterial({
      color: 0x97f7ff,
      emissive: 0x48dcff,
      emissiveIntensity: 2.4,
      roughness: 0.22,
      metalness: 0.05
    }),
    explosionParticleGeometry: new THREE.BoxGeometry(0.14, 0.14, 0.14)
  };
}

export function clearBullets({ bullets, scene }) {
  for (const bullet of bullets) {
    scene.remove(bullet.mesh);
  }

  bullets.length = 0;
}

export function clearExplosionEffects({ explosionEffects, scene }) {
  while (explosionEffects.length > 0) {
    const explosion = explosionEffects.pop();

    for (const particle of explosion.particles) {
      particle.mesh.material.dispose();
      explosion.root.remove(particle.mesh);
    }

    scene.remove(explosion.root);
  }
}

export function spawnExplosion(
  { scene, explosionEffects, explosionParticleGeometry, explosionParticleCount, explosionDuration },
  position
) {
  const root = new THREE.Group();
  root.position.copy(position);

  const light = new THREE.PointLight(0xffb15d, 11, 8.5, 2);
  root.add(light);

  const particles = [];
  for (let i = 0; i < explosionParticleCount; i += 1) {
    const material = new THREE.MeshStandardMaterial({
      color: 0xffd28a,
      emissive: 0xff8f45,
      emissiveIntensity: 2.8,
      roughness: 0.28,
      metalness: 0.04,
      transparent: true
    });
    const mesh = new THREE.Mesh(explosionParticleGeometry, material);
    mesh.position.set(
      THREE.MathUtils.randFloatSpread(0.25),
      THREE.MathUtils.randFloatSpread(0.25),
      THREE.MathUtils.randFloatSpread(0.25)
    );
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    root.add(mesh);

    particles.push({
      mesh,
      velocity: new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(1),
        Math.random() * 1.3 + 0.1,
        THREE.MathUtils.randFloatSpread(1)
      ).normalize().multiplyScalar(THREE.MathUtils.randFloat(3.8, 8.2))
    });
  }

  scene.add(root);
  explosionEffects.push({
    root,
    light,
    particles,
    age: 0,
    lifetime: explosionDuration
  });
}

export function updateExplosionEffects({ explosionEffects, scene }, deltaTime) {
  for (let i = explosionEffects.length - 1; i >= 0; i -= 1) {
    const explosion = explosionEffects[i];
    explosion.age += deltaTime;
    const progress = THREE.MathUtils.clamp(explosion.age / explosion.lifetime, 0, 1);

    if (progress >= 1) {
      for (const particle of explosion.particles) {
        particle.mesh.material.dispose();
        explosion.root.remove(particle.mesh);
      }

      scene.remove(explosion.root);
      explosionEffects.splice(i, 1);
      continue;
    }

    explosion.light.intensity = (1 - progress) * 11;

    for (const particle of explosion.particles) {
      particle.mesh.position.addScaledVector(particle.velocity, deltaTime);
      particle.velocity.multiplyScalar(1 - deltaTime * 1.9);
      particle.velocity.y -= 6 * deltaTime;
      particle.mesh.rotation.x += deltaTime * 8;
      particle.mesh.rotation.y += deltaTime * 6;
      particle.mesh.scale.setScalar(1 - progress * 0.7);
      particle.mesh.material.opacity = 1 - progress;
    }
  }
}

function removeBullet({ bullets, scene }, index) {
  const bullet = bullets[index];
  if (!bullet) {
    return false;
  }

  scene.remove(bullet.mesh);
  bullets.splice(index, 1);
  return true;
}

export function updateBullets(
  {
    bullets,
    scene,
    worldOctree,
    spikedEnemies,
    sphereIntersectsSphere,
    damageSpikedEnemy
  },
  deltaTime
) {
  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const bullet = bullets[i];
    if (!bullet) {
      continue;
    }

    bullet.age += deltaTime;

    if (bullet.age >= bullet.lifetime) {
      removeBullet({ bullets, scene }, i);
      continue;
    }

    bullet.collider.center.addScaledVector(bullet.velocity, deltaTime);

    let hitEnemy = null;

    for (const enemyInstance of spikedEnemies) {
      if (!enemyInstance.alive) {
        continue;
      }

      if (sphereIntersectsSphere(bullet.collider, enemyInstance.collider)) {
        hitEnemy = enemyInstance;
        break;
      }
    }

    if (hitEnemy) {
      removeBullet({ bullets, scene }, i);
      damageSpikedEnemy(hitEnemy, bullet.collider.center, bullet.damage);
      continue;
    }

    const hit = worldOctree.sphereIntersect(bullet.collider);
    if (hit) {
      removeBullet({ bullets, scene }, i);
      continue;
    }

    bullet.mesh.position.copy(bullet.collider.center);
    bullet.mesh.children[0].intensity = 1.6 + Math.sin(bullet.age * 30) * 0.25;
  }
}

export function tryFire(
  {
    sceneReady,
    ammo,
    ammoPerShot,
    shotInterval,
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
    bulletRadius,
    bulletGeometry,
    bulletMaterial,
    bullets,
    scene,
    bulletForward,
    bulletLifetime,
    bulletSpeed,
    recoilBack,
    recoilUp,
    recoilTwist,
    damage,
    onShotFired
  },
  now
) {
  if (!sceneReady || ammo < ammoPerShot || now - lastShotAt < shotInterval) {
    return null;
  }

  const nextAmmo = Math.max(0, ammo - ammoPerShot);
  const nextLastShotAt = now;

  getAnchorWorldPosition(muzzleAnchor, tempVectorA);
  camera.getWorldDirection(tempVectorB);
  aimRaycaster.set(camera.position, tempVectorB);
  aimRaycaster.far = AIM_DISTANCE;

  let hasAimTarget = false;
  let closestAimDistance = Infinity;

  for (const enemyInstance of spikedEnemies ?? []) {
    if (!enemyInstance.alive || !enemyInstance.collider) {
      continue;
    }

    tempAimSphere.copy(enemyInstance.collider);
    tempAimSphere.radius *= ENEMY_AIM_RADIUS_MULTIPLIER;

    if (!aimRaycaster.ray.intersectSphere(tempAimSphere, tempAimPoint)) {
      continue;
    }

    const aimDistance = camera.position.distanceTo(tempAimPoint);
    if (aimDistance < closestAimDistance) {
      closestAimDistance = aimDistance;
      tempVectorC.copy(tempAimPoint);
      hasAimTarget = true;
    }
  }

  const aimIntersections = aimRaycaster.intersectObjects(worldMeshes, false);
  if (aimIntersections.length > 0 && aimIntersections[0].distance < closestAimDistance) {
    tempVectorC.copy(aimIntersections[0].point);
    hasAimTarget = true;
  }

  if (!hasAimTarget) {
    tempVectorC.copy(camera.position).addScaledVector(tempVectorB, AIM_DISTANCE);
  }

  tempVectorD.subVectors(tempVectorC, tempVectorA).normalize();
  tempVectorA.addScaledVector(tempVectorD, bulletRadius * 1.4);

  const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
  bulletMesh.castShadow = true;
  bulletMesh.receiveShadow = false;
  bulletMesh.position.copy(tempVectorA);
  bulletMesh.quaternion.setFromUnitVectors(bulletForward, tempVectorD);

  const bulletLight = new THREE.PointLight(0x6de9ff, 1.8, 4.6, 2);
  bulletMesh.add(bulletLight);

  bullets.push({
    mesh: bulletMesh,
    collider: new THREE.Sphere(tempVectorA.clone(), bulletRadius),
    velocity: tempVectorD.clone().multiplyScalar(bulletSpeed),
    damage,
    age: 0,
    lifetime: bulletLifetime
  });

  scene.add(bulletMesh);
  onShotFired?.();

  const nextMuzzleFlashDuration = 0.05 + Math.random() * 0.05;

  return {
    ammo: nextAmmo,
    lastShotAt: nextLastShotAt,
    recoilBack: Math.min(recoilBack + 0.17, 0.34),
    recoilUp: Math.min(recoilUp + 0.08, 0.26),
    recoilTwist: recoilTwist + (Math.random() - 0.5) * 0.08,
    muzzleFlashDuration: nextMuzzleFlashDuration,
    muzzleFlashTimer: nextMuzzleFlashDuration,
    shootActionTimer: 0.18
  };
}

export function rechargeAmmo(
  { ammo, maxAmmo, lastShotAt, ammoRechargeDelay, ammoRechargeRate },
  deltaTime,
  now
) {
  if (now - lastShotAt <= ammoRechargeDelay) {
    return ammo;
  }

  return Math.min(maxAmmo, ammo + ammoRechargeRate * deltaTime);
}
