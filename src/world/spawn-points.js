import * as THREE from 'three';
import { Capsule } from 'three/addons/math/Capsule.js';

const raycaster = new THREE.Raycaster();
const down = new THREE.Vector3(0, -1, 0);
const up = new THREE.Vector3(0, 1, 0);
const tempVectorA = new THREE.Vector3();
const tempVectorB = new THREE.Vector3();
const tempVectorC = new THREE.Vector3();
const tempVectorD = new THREE.Vector3();
const tempNormalMatrix = new THREE.Matrix3();

export function findGroundPointAt({ worldBounds, worldMeshes, x, z, normalThreshold = 0.5 }) {
  if (worldBounds.isEmpty() || worldMeshes.length === 0) {
    return null;
  }

  const topY = worldBounds.max.y + 20;
  raycaster.set(tempVectorA.set(x, topY, z), down);
  raycaster.far = topY - worldBounds.min.y + 40;

  const intersections = raycaster.intersectObjects(worldMeshes, false);

  for (let i = intersections.length - 1; i >= 0; i -= 1) {
    const hit = intersections[i];
    if (!hit.face) {
      continue;
    }

    tempNormalMatrix.getNormalMatrix(hit.object.matrixWorld);
    tempVectorB.copy(hit.face.normal).applyMatrix3(tempNormalMatrix).normalize();

    if (tempVectorB.y > normalThreshold) {
      return hit.point.clone().addScaledVector(up, 0.04);
    }
  }

  return null;
}

export function findSpawnPoint({ worldBounds, worldMeshes, worldOctree, playerRadius, playerCapsuleTop }) {
  if (!worldBounds.isEmpty() && worldMeshes.length > 0) {
    const margin = 0.9;
    const samples = [];
    const gridSize = 9;
    const minX = worldBounds.min.x + margin;
    const maxX = worldBounds.max.x - margin;
    const minZ = worldBounds.min.z + margin;
    const maxZ = worldBounds.max.z - margin;
    const topY = worldBounds.max.y + 20;

    for (let ix = 0; ix < gridSize; ix += 1) {
      for (let iz = 0; iz < gridSize; iz += 1) {
        const x = THREE.MathUtils.lerp(minX, maxX, ix / (gridSize - 1));
        const z = THREE.MathUtils.lerp(minZ, maxZ, iz / (gridSize - 1));

        raycaster.set(tempVectorA.set(x, topY, z), down);
        raycaster.far = topY - worldBounds.min.y + 40;

        const intersections = raycaster.intersectObjects(worldMeshes, false);
        let groundHit = null;

        for (let i = intersections.length - 1; i >= 0; i -= 1) {
          const hit = intersections[i];
          if (!hit.face) {
            continue;
          }

          tempNormalMatrix.getNormalMatrix(hit.object.matrixWorld);
          tempVectorB.copy(hit.face.normal).applyMatrix3(tempNormalMatrix).normalize();

          if (tempVectorB.y > 0.5) {
            groundHit = hit;
            break;
          }
        }

        if (!groundHit) {
          continue;
        }

        samples.push(groundHit.point.clone());
      }
    }

    if (samples.length > 0) {
      samples.sort((a, b) => a.y - b.y);
      const preferredIndex = Math.floor(samples.length * 0.38);
      const orderedIndices = [preferredIndex];

      for (let offset = 1; offset < samples.length; offset += 1) {
        if (preferredIndex + offset < samples.length) {
          orderedIndices.push(preferredIndex + offset);
        }

        if (preferredIndex - offset >= 0) {
          orderedIndices.push(preferredIndex - offset);
        }
      }

      for (const index of orderedIndices) {
        const sample = samples[index];
        const candidate = tempVectorC.copy(sample).addScaledVector(up, 0.04);
        const capsule = new Capsule(
          tempVectorD.set(candidate.x, candidate.y + playerRadius, candidate.z),
          tempVectorA.set(candidate.x, candidate.y + playerCapsuleTop, candidate.z),
          playerRadius
        );

        const collision = worldOctree.capsuleIntersect(capsule);
        if (!collision || collision.depth < 0.15) {
          return candidate.clone();
        }
      }
    }
  }

  return new THREE.Vector3(0, 2, 0);
}

export function getSceneSpawnPoint({
  sceneKey,
  worldScenes,
  currentWorldRoot,
  worldBounds,
  worldMeshes,
  worldOctree,
  playerRadius,
  playerCapsuleTop
}) {
  const sceneConfig = worldScenes[sceneKey];
  const spawnNodeName = sceneConfig?.spawnNodeName;

  if (spawnNodeName && currentWorldRoot) {
    const spawnNode = currentWorldRoot.getObjectByName(spawnNodeName);
    if (spawnNode) {
      const spawnPosition = spawnNode.getWorldPosition(new THREE.Vector3());
      if (sceneConfig?.preserveSpawnPosition) {
        return spawnPosition;
      }
      const grounded = findGroundPointAt({
        worldBounds,
        worldMeshes,
        x: spawnPosition.x,
        z: spawnPosition.z,
        normalThreshold: 0.4
      });
      return grounded ?? spawnPosition;
    }
  }

  return findSpawnPoint({
    worldBounds,
    worldMeshes,
    worldOctree,
    playerRadius,
    playerCapsuleTop
  });
}
