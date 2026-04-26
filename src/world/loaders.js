import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

export function loadGLTF(url) {
  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}

export function loadFBX(url) {
  const loader = new FBXLoader();

  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}

export function loadTexture(url) {
  const loader = new THREE.TextureLoader();

  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}

export function prepareVoxelTexture(texture, maxAnisotropy) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function processMaterial(material, meshName, maxAnisotropy) {
  if (!material) {
    return;
  }

  material.needsUpdate = true;
  if (material.color) {
    material.color.multiplyScalar(0.62);
  }

  if (material.map) {
    material.map.anisotropy = maxAnisotropy;
    material.map.colorSpace = THREE.SRGBColorSpace;
  }

  if ('emissive' in material && meshName.includes('Emissive')) {
    material.emissive = new THREE.Color(0xffaa55);
    material.emissiveIntensity = 2;
  }
}

export function addWorldScene({ scene, renderer, worldMeshes, worldOctree, worldBounds }, root, collisionRoot = root) {
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

  root.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.castShadow = true;
    child.receiveShadow = true;
    if (!child.userData?.ignoreWorldCollision) {
      worldMeshes.push(child);
    }

    if (Array.isArray(child.material)) {
      child.material = child.material.map((material) => material?.clone?.() ?? material);
      child.material.forEach((material) => processMaterial(material, child.name, maxAnisotropy));
    } else if (child.material) {
      child.material = child.material.clone();
      processMaterial(child.material, child.name, maxAnisotropy);
    }
  });

  scene.add(root);
  root.updateMatrixWorld(true);
  collisionRoot.updateMatrixWorld(true);
  worldOctree.fromGraphNode(collisionRoot);
  worldBounds.setFromObject(collisionRoot);

  return {
    currentCollisionRoot: collisionRoot,
    worldFloor: worldBounds.min.y
  };
}
