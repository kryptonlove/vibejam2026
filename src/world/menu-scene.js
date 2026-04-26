import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { MENU_FIRE_TARGET_HEIGHT, MENU_PILLAR_TARGET_HEIGHT } from '../config/constants.js';

const tempBox = new THREE.Box3();
const tempVectorA = new THREE.Vector3();

function enhanceMenuFireVisual(root) {
  root.traverse((child) => {
    if (!child.isMesh && !child.isSkinnedMesh) {
      return;
    }

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      if (!material) {
        continue;
      }

      material.color?.multiplyScalar(1.3);
      if ('emissive' in material) {
        material.emissive = new THREE.Color(0xff8a3d);
        material.emissiveIntensity = 1.5;
      }
      material.needsUpdate = true;
    }
  });
}

function scaleRootToHeight(root, targetHeight) {
  root.updateMatrixWorld(true);
  tempBox.setFromObject(root);
  const size = tempBox.getSize(tempVectorA);
  const height = Math.max(size.y, 1e-5);
  root.scale.multiplyScalar(targetHeight / height);
  root.updateMatrixWorld(true);
}

function scaleRootToMaxDimension(root, targetDimension) {
  root.updateMatrixWorld(true);
  tempBox.setFromObject(root);
  const size = tempBox.getSize(tempVectorA);
  const maxDimension = Math.max(size.x, size.y, size.z, 1e-5);
  root.scale.multiplyScalar(targetDimension / maxDimension);
  root.updateMatrixWorld(true);
}

function placeRootOnGround(root, x, z, groundY) {
  root.position.set(x, groundY, z);
  root.updateMatrixWorld(true);
  tempBox.setFromObject(root);
  root.position.y += groundY - tempBox.min.y;
  root.updateMatrixWorld(true);
}

export function clearMenuSceneEffects(menuSceneFireEffects) {
  menuSceneFireEffects.length = 0;
}

export function setupMenuSceneEffects({ currentWorldRoot, enabled, menuSceneFireEffects }) {
  clearMenuSceneEffects(menuSceneFireEffects);

  if (!currentWorldRoot || !enabled) {
    return;
  }

  currentWorldRoot.traverse((child) => {
    if (!child.userData?.menuFireRoot) {
      return;
    }

    enhanceMenuFireVisual(child);

    const mixer = new THREE.AnimationMixer(child);
    for (const clip of child.animations ?? []) {
      mixer.clipAction(clip).play();
    }

    const light = new THREE.PointLight(0xffac5d, 2.8, 6.5, 2);
    light.position.set(0, 0.42, 0);
    light.castShadow = false;
    child.add(light);

    menuSceneFireEffects.push({
      mixer,
      light,
      baseIntensity: 2.6 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2
    });
  });
}

export function createMenuSceneWorld(baseWorldTemplate, pillarTemplate, fireTemplate, fireAnimations, propTemplates) {
  const root = baseWorldTemplate.clone(true);
  root.name = 'menu-scene-root';
  root.updateMatrixWorld(true);

  tempBox.setFromObject(root);
  const groundY = tempBox.min.y;
  const spawnNode = root.getObjectByName('PlayerSpawn');
  const center = spawnNode
    ? spawnNode.getWorldPosition(new THREE.Vector3())
    : new THREE.Vector3(0, groundY, 0);
  const platformSurfaceY = spawnNode ? center.y : groundY;

  const pillarOffsets = [
    new THREE.Vector3(-2.55, 0, -0.3),
    new THREE.Vector3(2.55, 0, -0.3)
  ];

  for (const [index, offset] of pillarOffsets.entries()) {
    const pillar = pillarTemplate.clone(true);
    scaleRootToHeight(pillar, MENU_PILLAR_TARGET_HEIGHT);
    pillar.rotation.y = index === 0 ? Math.PI * 0.1 : -Math.PI * 0.1;
    placeRootOnGround(pillar, center.x + offset.x, center.z + offset.z, platformSurfaceY);
    root.add(pillar);

    const fireRoot = cloneSkinned(fireTemplate);
    fireRoot.animations = fireAnimations;
    fireRoot.userData.menuFireRoot = true;
    scaleRootToHeight(fireRoot, MENU_FIRE_TARGET_HEIGHT);
    fireRoot.position.set(pillar.position.x, pillar.position.y, pillar.position.z);
    fireRoot.updateMatrixWorld(true);
    tempBox.setFromObject(pillar);
    fireRoot.position.y = tempBox.max.y + 0.12;
    fireRoot.position.z += 0.06;
    fireRoot.updateMatrixWorld(true);
    root.add(fireRoot);
  }

  const propPlacementSets = [
    {
      template: propTemplates.groundMossXl,
      placements: [
        { x: -4.15, z: 2.55, rotation: 0.25, size: 1.62 },
        { x: 4.08, z: 2.3, rotation: -0.38, size: 1.56 },
        { x: -3.68, z: -2.78, rotation: 1.15, size: 1.5 },
        { x: 3.74, z: -2.92, rotation: -1.12, size: 1.58 }
      ]
    },
    {
      template: propTemplates.groundMossMd,
      placements: [
        { x: -2.24, z: 1.88, rotation: 0.4, size: 1.12 },
        { x: 2.3, z: 1.62, rotation: -0.24, size: 1.08 },
        { x: -1.72, z: -2.22, rotation: 0.92, size: 1.14 },
        { x: 1.92, z: -2.08, rotation: -0.78, size: 1.1 }
      ]
    },
    {
      template: propTemplates.groundMossXs,
      placements: [
        { x: -0.92, z: 2.28, rotation: 0.68, size: 0.76 },
        { x: 0.98, z: 2.18, rotation: -0.52, size: 0.72 },
        { x: -0.86, z: -2.58, rotation: 1.4, size: 0.74 },
        { x: 0.9, z: -2.66, rotation: -1.2, size: 0.7 }
      ]
    },
    {
      template: propTemplates.skull,
      placements: [
        { x: -2.68, z: 0.96, rotation: 1.12, size: 0.48 },
        { x: 2.74, z: 0.82, rotation: -0.88, size: 0.5 }
      ]
    },
    {
      template: propTemplates.skullCracked,
      placements: [
        { x: -2.18, z: -0.74, rotation: 0.52, size: 0.52 },
        { x: 2.04, z: -0.88, rotation: -0.64, size: 0.54 }
      ]
    },
    {
      template: propTemplates.vase,
      placements: [{ x: 0.12, z: -1.44, rotation: 0.18, size: 0.82 }]
    }
  ];

  for (const { template, placements } of propPlacementSets) {
    for (const placement of placements) {
      const prop = template.clone(true);
      scaleRootToMaxDimension(prop, placement.size);
      prop.rotation.y = placement.rotation;
      placeRootOnGround(prop, center.x + placement.x, center.z + placement.z, platformSurfaceY);
      root.add(prop);
    }
  }

  const cameraAnchor = new THREE.Object3D();
  cameraAnchor.name = 'MenuCameraAnchor';
  cameraAnchor.position.set(center.x, platformSurfaceY + 2.2, center.z + 5.35);
  root.add(cameraAnchor);

  const lookAnchor = new THREE.Object3D();
  lookAnchor.name = 'MenuLookAnchor';
  lookAnchor.position.set(center.x, platformSurfaceY + 1.18, center.z);
  root.add(lookAnchor);

  root.updateMatrixWorld(true);
  return root;
}
