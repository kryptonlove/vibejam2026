import * as THREE from 'three';
import { INTRO_SCENE_LAYOUT } from './intro-scene-layout.js';

const blenderToThreeMatrix = new THREE.Matrix4().set(
  1, 0, 0, 0,
  0, 0, 1, 0,
  0, -1, 0, 0,
  0, 0, 0, 1
);
const threeToBlenderMatrix = blenderToThreeMatrix.clone().invert();
const tempPosition = new THREE.Vector3();
const tempScale = new THREE.Vector3();
const tempQuaternion = new THREE.Quaternion();
const tempEuler = new THREE.Euler(0, 0, 0, 'XYZ');
const tempMatrixA = new THREE.Matrix4();
const tempMatrixB = new THREE.Matrix4();
const tempBounds = new THREE.Box3();
const tempCenter = new THREE.Vector3();
const identityRotation = Object.freeze([0, 0, 0]);
const identityScale = Object.freeze([1, 1, 1]);

function applyBlenderTransform(object, transform) {
  tempPosition.fromArray(transform.position ?? [0, 0, 0]);
  tempScale.fromArray(transform.scale ?? identityScale);
  tempEuler.set(...(transform.rotation ?? identityRotation), 'XYZ');

  tempMatrixA.compose(tempPosition, tempQuaternion.setFromEuler(tempEuler), tempScale);
  tempMatrixB.copy(blenderToThreeMatrix).multiply(tempMatrixA).multiply(threeToBlenderMatrix);
  tempMatrixB.decompose(object.position, object.quaternion, object.scale);
}

function setPositionFromBlender(object, position) {
  object.position.fromArray(position).applyMatrix4(blenderToThreeMatrix);
}

function centerLayout(layoutRoot, collisionRoot) {
  collisionRoot.updateWorldMatrix(true, true);
  tempBounds.setFromObject(collisionRoot);
  if (tempBounds.isEmpty()) {
    return;
  }

  tempBounds.getCenter(tempCenter);
  layoutRoot.position.sub(tempCenter);
}

function prepareRenderable(root, { ignoreWorldCollision = false } = {}) {
  root.traverse((child) => {
    if (!child.isMesh && !child.isSkinnedMesh) {
      return;
    }

    child.castShadow = true;
    child.receiveShadow = true;
    child.userData.ignoreWorldCollision = ignoreWorldCollision;
  });
}

function createSceneCamera() {
  const { camera } = INTRO_SCENE_LAYOUT;
  const sceneCamera = new THREE.PerspectiveCamera(camera.fov, 16 / 9, camera.near, camera.far);
  sceneCamera.name = camera.name;
  applyBlenderTransform(sceneCamera, {
    position: camera.position,
    rotation: camera.rotation,
    scale: [1, 1, 1]
  });
  sceneCamera.updateProjectionMatrix();
  return sceneCamera;
}

function createSceneLights() {
  const lightsRoot = new THREE.Group();
  lightsRoot.name = 'IntroSceneLights';

  const ambientLight = new THREE.AmbientLight(
    INTRO_SCENE_LAYOUT.lighting.ambient.color,
    INTRO_SCENE_LAYOUT.lighting.ambient.intensity
  );
  ambientLight.name = 'IntroSceneAmbientLight';
  lightsRoot.add(ambientLight);

  const pointLight = new THREE.PointLight(
    new THREE.Color(...INTRO_SCENE_LAYOUT.lighting.point.color),
    INTRO_SCENE_LAYOUT.lighting.point.intensity,
    INTRO_SCENE_LAYOUT.lighting.point.distance,
    INTRO_SCENE_LAYOUT.lighting.point.decay
  );
  pointLight.name = 'IntroScenePointLight';
  setPositionFromBlender(pointLight, INTRO_SCENE_LAYOUT.lighting.point.position);
  pointLight.castShadow = false;
  lightsRoot.add(pointLight);

  const topLight = new THREE.DirectionalLight(0xffd26f, 2.1);
  topLight.name = 'IntroSceneTopLight';
  topLight.position.set(0, 18, 0);
  topLight.target.name = 'IntroSceneTopLightTarget';
  topLight.target.position.set(0, 0, 0);
  lightsRoot.add(topLight);
  lightsRoot.add(topLight.target);

  return lightsRoot;
}

export function createIntroSceneWorld(assetTemplates) {
  const root = new THREE.Group();
  root.name = 'intro-scene-root';

  const layoutRoot = new THREE.Group();
  layoutRoot.name = 'intro-scene-layout-root';
  root.add(layoutRoot);

  const collisionRoot = new THREE.Group();
  collisionRoot.name = 'intro-scene-collision-root';
  layoutRoot.add(collisionRoot);
  root.userData.collisionRoot = collisionRoot;

  for (const instance of INTRO_SCENE_LAYOUT.instances) {
    const template = assetTemplates[instance.assetKey];
    if (!template) {
      continue;
    }

    const clone = template.clone(true);
    clone.name = instance.name;
    applyBlenderTransform(clone, instance);
    prepareRenderable(clone);
    collisionRoot.add(clone);
  }

  const playerSpawn = new THREE.Object3D();
  playerSpawn.name = 'PlayerSpawn';
  setPositionFromBlender(playerSpawn, INTRO_SCENE_LAYOUT.playerSpawn.position);
  layoutRoot.add(playerSpawn);

  layoutRoot.add(createSceneCamera());
  layoutRoot.add(createSceneLights());
  root.updateMatrixWorld(true);
  centerLayout(layoutRoot, collisionRoot);
  root.updateMatrixWorld(true);
  return root;
}
