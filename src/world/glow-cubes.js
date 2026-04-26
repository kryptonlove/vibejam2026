import * as THREE from 'three';

const raycaster = new THREE.Raycaster();
const tempSize = new THREE.Vector3();
const tempOrigin = new THREE.Vector3();
const tempNormal = new THREE.Vector3();
const tempNormalMatrix = new THREE.Matrix3();

export function createGlowCube({ scene, glowCubes, glowCubeGeometry }, position, colorHex) {
  const color = new THREE.Color(colorHex);
  const material = new THREE.MeshStandardMaterial({
    color: color.clone().multiplyScalar(0.22),
    emissive: color,
    emissiveIntensity: 1.8,
    roughness: 0.28,
    metalness: 0.02
  });

  const cube = new THREE.Mesh(glowCubeGeometry, material);
  cube.position.copy(position);
  cube.castShadow = false;
  cube.receiveShadow = false;
  cube.rotation.set(
    Math.random() * 0.35,
    Math.random() * Math.PI * 2,
    Math.random() * 0.35
  );

  const light = new THREE.PointLight(color, 2.4, 8.5, 2);
  light.castShadow = false;
  cube.add(light);

  scene.add(cube);

  glowCubes.push({
    mesh: cube,
    light,
    baseIntensity: 2 + Math.random() * 1.1,
    baseEmissiveIntensity: 1.5 + Math.random() * 0.8,
    phase: Math.random() * Math.PI * 2
  });
}

export function updateGlowCubes(glowCubes, time) {
  for (const glowCube of glowCubes) {
    const flicker =
      0.86 +
      Math.sin(time * 1.9 + glowCube.phase) * 0.1 +
      Math.sin(time * 7.4 + glowCube.phase * 0.7) * 0.04;

    glowCube.light.intensity = glowCube.baseIntensity * flicker;
    glowCube.mesh.material.emissiveIntensity = glowCube.baseEmissiveIntensity * flicker;
  }
}

export function clearGlowCubes({ glowCubes, scene }) {
  for (const glowCube of glowCubes) {
    glowCube.mesh.material.dispose();
    scene.remove(glowCube.mesh);
  }

  glowCubes.length = 0;
}

export function addMenuSceneGlowCubes({ worldBounds, playerSpawn, count, colors, createGlowCube }) {
  if (worldBounds.isEmpty()) {
    return;
  }

  const ringCenter = playerSpawn.clone();
  const size = worldBounds.getSize(tempSize);
  const baseY = ringCenter.y + 0.14;
  const outerRadiusX = Math.max(size.x * 0.28, 2.8);
  const outerRadiusZ = Math.max(size.z * 0.28, 2.8);
  const innerRadiusX = Math.max(size.x * 0.18, 1.8);
  const innerRadiusZ = Math.max(size.z * 0.18, 1.8);

  for (let index = 0; index < count; index += 1) {
    const innerRing = index >= Math.ceil(count * 0.55);
    const ringIndex = innerRing ? index - Math.ceil(count * 0.55) : index;
    const ringCount = innerRing
      ? count - Math.ceil(count * 0.55)
      : Math.ceil(count * 0.55);
    const angle = (ringIndex / ringCount) * Math.PI * 2 + (innerRing ? Math.PI / ringCount : Math.PI * 0.08);
    const radiusX = innerRing ? innerRadiusX : outerRadiusX;
    const radiusZ = innerRing ? innerRadiusZ : outerRadiusZ;
    const position = new THREE.Vector3(
      ringCenter.x + Math.cos(angle) * radiusX,
      baseY,
      ringCenter.z + Math.sin(angle) * radiusZ
    );

    createGlowCube(position, colors[index % colors.length]);
  }
}

export function addGlowCubesToWorld({ worldBounds, worldMeshes, playerSpawn, count, colors, createGlowCube }) {
  if (worldBounds.isEmpty() || worldMeshes.length === 0) {
    return;
  }

  const topY = worldBounds.max.y + 20;
  const minX = worldBounds.min.x + 0.8;
  const maxX = worldBounds.max.x - 0.8;
  const minZ = worldBounds.min.z + 0.8;
  const maxZ = worldBounds.max.z - 0.8;
  const placedPositions = [];
  let createdCount = 0;

  for (let attempt = 0; createdCount < count && attempt < count * 80; attempt += 1) {
    const x = THREE.MathUtils.randFloat(minX, maxX);
    const z = THREE.MathUtils.randFloat(minZ, maxZ);

    raycaster.set(tempOrigin.set(x, topY, z), new THREE.Vector3(0, -1, 0));
    raycaster.far = topY - worldBounds.min.y + 40;

    const intersections = raycaster.intersectObjects(worldMeshes, false);
    let groundHit = null;

    for (const hit of intersections) {
      if (!hit.face) {
        continue;
      }

      tempNormalMatrix.getNormalMatrix(hit.object.matrixWorld);
      tempNormal.copy(hit.face.normal).applyMatrix3(tempNormalMatrix).normalize();

      if (tempNormal.y > 0.72) {
        groundHit = hit;
        break;
      }
    }

    if (!groundHit) {
      continue;
    }

    const candidate = groundHit.point.clone().addScaledVector(new THREE.Vector3(0, 1, 0), 0.2);

    if (candidate.distanceToSquared(playerSpawn) < 16) {
      continue;
    }

    if (placedPositions.some((position) => position.distanceToSquared(candidate) < 9)) {
      continue;
    }

    placedPositions.push(candidate);
    createGlowCube(candidate, colors[createdCount % colors.length]);
    createdCount += 1;
  }
}
