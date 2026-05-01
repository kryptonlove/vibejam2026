import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
dracoLoader.setDecoderConfig({ type: 'wasm' });

const tempMatrix = new THREE.Matrix4();

function createCollisionMesh(geometry, matrixWorld) {
  const mesh = new THREE.Mesh(geometry.clone(), new THREE.MeshBasicMaterial());
  mesh.matrixAutoUpdate = false;
  mesh.matrix.copy(matrixWorld);
  mesh.matrixWorldNeedsUpdate = true;
  return mesh;
}

function createExpandedCollisionRoot(sourceRoot) {
  let hasInstancedMesh = false;
  sourceRoot.traverse((child) => {
    hasInstancedMesh ||= child.isInstancedMesh === true;
  });

  if (!hasInstancedMesh) {
    return sourceRoot;
  }

  const collisionRoot = new THREE.Group();
  collisionRoot.name = `${sourceRoot.name || 'World'}CollisionExpanded`;

  sourceRoot.updateWorldMatrix(true, true);
  sourceRoot.traverse((child) => {
    if (!child.isMesh || child.userData?.ignoreWorldCollision) {
      return;
    }

    if (child.isInstancedMesh) {
      for (let index = 0; index < child.count; index += 1) {
        child.getMatrixAt(index, tempMatrix);
        tempMatrix.premultiply(child.matrixWorld);
        collisionRoot.add(createCollisionMesh(child.geometry, tempMatrix));
      }
      return;
    }

    collisionRoot.add(createCollisionMesh(child.geometry, child.matrixWorld));
  });

  collisionRoot.updateWorldMatrix(true, true);
  return collisionRoot;
}

export function loadGLTF(url) {
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

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

    const invisibleCollisionProxy = child.userData?.invisibleCollisionProxy === true;
    child.castShadow = !invisibleCollisionProxy && child.userData?.disableShadowCasting !== true;
    child.receiveShadow = !invisibleCollisionProxy && child.userData?.disableShadowReceiving !== true;
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
  const resolvedCollisionRoot = createExpandedCollisionRoot(collisionRoot);
  resolvedCollisionRoot.updateMatrixWorld(true);
  worldOctree.fromGraphNode(resolvedCollisionRoot);
  worldBounds.setFromObject(resolvedCollisionRoot);

  return {
    currentCollisionRoot: resolvedCollisionRoot,
    worldFloor: worldBounds.min.y
  };
}
