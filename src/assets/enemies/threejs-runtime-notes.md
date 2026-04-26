# Enemy Ball Runtime Notes

These GLBs are built as lightweight node hierarchies for `GLTFLoader`.
The materials are simple glTF materials with emissive colors, not Blender-only procedural shaders.
For runtime animation, drive node transforms and emissive intensity in Three.js.

## Files

- `spiked-ball.glb`
- `fire-sun.glb`
- `lava-ball.glb`
- `magic-ball.glb`
- `electric-ball.glb`
- `crystal-ball-lightning.glb`

## Node Names

### `fire-sun.glb`

- `FireSun`
- `FireSun_Core`
- `FireSun_Dots`

### `lava-ball.glb`

- `LavaBall`
- `LavaBall_Core`
- `LavaBall_Crust`
- `LavaBall_Cinders`

### `magic-ball.glb`

- `MagicBall`
- `MagicBall_Core`
- `MagicBall_SwirlA`
- `MagicBall_SwirlB`
- `MagicBall_SwirlC`
- `MagicBall_Particles`

### `electric-ball.glb`

- `ElectricBall`
- `ElectricBall_Core`
- `ElectricBall_Bolts`
- `ElectricBall_Sparks`

### `crystal-ball-lightning.glb`

- `CrystalBallLightning`
- `CrystalBallLightning_Core`
- `CrystalBallLightning_Particles`

## Loader Pattern

```js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const enemyUrls = {
  spikedBall: new URL('./assets/enemies/spiked-ball.glb', import.meta.url).href,
  fireSun: new URL('./assets/enemies/fire-sun.glb', import.meta.url).href,
  lavaBall: new URL('./assets/enemies/lava-ball.glb', import.meta.url).href,
  magicBall: new URL('./assets/enemies/magic-ball.glb', import.meta.url).href,
  electricBall: new URL('./assets/enemies/electric-ball.glb', import.meta.url).href,
  crystalBallLightning: new URL('./assets/enemies/crystal-ball-lightning.glb', import.meta.url).href
};

const loader = new GLTFLoader();

async function loadEnemy(url) {
  const gltf = await loader.loadAsync(url);
  const root = gltf.scene;

  root.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.castShadow = true;
    obj.receiveShadow = false;
    if (obj.material) {
      obj.material = obj.material.clone();
      obj.material.toneMapped = false;
      if ('emissiveIntensity' in obj.material) {
        obj.material.emissiveIntensity = obj.material.emissiveIntensity || 1;
      }
    }
  });

  return root;
}
```

## Runtime Animation Model

These effects do not need a custom shader to work.
The core loop is:

1. Float the whole enemy up and down with a slow sine wave.
2. Rotate shell parts, rings, sparks, bolts, or embers as separate nodes.
3. Pulse emissive intensity on bright parts.
4. Add Unreal Bloom or another postprocessing bloom pass so emissive parts read as glow.

Use shaders only if you want extra surface distortion, scrolling lava, or fresnel rims.

## Animation Snippet

```js
function findNode(root, name) {
  return root.getObjectByName(name);
}

function pulseMaterial(node, base, amp, time, speed) {
  if (!node || !node.isMesh || !node.material || !('emissiveIntensity' in node.material)) return;
  node.material.emissiveIntensity = base + Math.sin(time * speed) * amp;
}

function animateEnemy(enemy, time) {
  enemy.position.y = enemy.userData.baseY + Math.sin(time * 1.6 + enemy.userData.phase) * 0.08;
  enemy.rotation.y += enemy.userData.spinSpeed * enemy.userData.delta;

  switch (enemy.userData.kind) {
    case 'fireSun': {
      const core = findNode(enemy, 'FireSun_Core');
      const dots = findNode(enemy, 'FireSun_Dots');

      const pulse = 1 + Math.sin(time * 2.8 + enemy.userData.phase) * 0.035;
      enemy.scale.setScalar(enemy.userData.baseScale * pulse);

      if (dots) {
        dots.rotation.y += 1.45 * enemy.userData.delta;
        dots.rotation.z += 0.25 * enemy.userData.delta;
        dots.position.y = Math.sin(time * 3.3 + enemy.userData.phase) * 0.028;
      }

      pulseMaterial(core, 3.0, 0.6, time, 9.0);
      pulseMaterial(dots, 4.0, 0.7, time, 11.0);
      break;
    }

    case 'lavaBall': {
      const core = findNode(enemy, 'LavaBall_Core');
      const crust = findNode(enemy, 'LavaBall_Crust');
      const cinders = findNode(enemy, 'LavaBall_Cinders');
      if (crust) {
        crust.rotation.y += 0.35 * enemy.userData.delta;
        crust.rotation.z += 0.12 * enemy.userData.delta;
      }
      if (cinders) cinders.rotation.y -= 1.2 * enemy.userData.delta;
      pulseMaterial(core, 2.2, 0.35, time, 5.0);
      break;
    }

    case 'magicBall': {
      const core = findNode(enemy, 'MagicBall_Core');
      const swirlA = findNode(enemy, 'MagicBall_SwirlA');
      const swirlB = findNode(enemy, 'MagicBall_SwirlB');
      const swirlC = findNode(enemy, 'MagicBall_SwirlC');
      const particles = findNode(enemy, 'MagicBall_Particles');
      if (swirlA) swirlA.rotation.z += 1.0 * enemy.userData.delta;
      if (swirlB) swirlB.rotation.x -= 1.4 * enemy.userData.delta;
      if (swirlC) swirlC.rotation.y += 1.8 * enemy.userData.delta;
      if (particles) {
        particles.rotation.y += 2.4 * enemy.userData.delta;
        particles.position.y = Math.sin(time * 3.0 + enemy.userData.phase) * 0.04;
      }
      pulseMaterial(core, 1.7, 0.5, time, 6.5);
      break;
    }

    case 'electricBall': {
      const core = findNode(enemy, 'ElectricBall_Core');
      const bolts = findNode(enemy, 'ElectricBall_Bolts');
      const sparks = findNode(enemy, 'ElectricBall_Sparks');
      if (bolts) {
        bolts.rotation.y += 1.9 * enemy.userData.delta;
        bolts.visible = Math.sin(time * 28.0 + enemy.userData.phase) > -0.15;
      }
      if (sparks) {
        sparks.rotation.x += 1.5 * enemy.userData.delta;
        sparks.rotation.z -= 1.8 * enemy.userData.delta;
      }
      pulseMaterial(core, 2.0, 0.7, time, 14.0);
      break;
    }

    case 'crystalBallLightning': {
      const core = findNode(enemy, 'CrystalBallLightning_Core');
      const shards = findNode(enemy, 'CrystalBallLightning_Shards');
      const ring = findNode(enemy, 'CrystalBallLightning_Ring');
      const bolts = findNode(enemy, 'CrystalBallLightning_Bolts');
      if (shards) shards.rotation.y += 0.55 * enemy.userData.delta;
      if (ring) {
        ring.rotation.z += 1.0 * enemy.userData.delta;
        ring.rotation.x += 0.35 * enemy.userData.delta;
      }
      if (bolts) {
        bolts.rotation.y -= 1.5 * enemy.userData.delta;
        bolts.visible = Math.sin(time * 18.0 + enemy.userData.phase) > -0.25;
      }
      pulseMaterial(core, 1.9, 0.55, time, 7.0);
      break;
    }
  }
}
```

## Spawn Setup

```js
function initEnemy(root, kind) {
  root.userData.kind = kind;
  root.userData.phase = Math.random() * Math.PI * 2;
  root.userData.spinSpeed = 0.2 + Math.random() * 0.15;
  root.userData.baseY = root.position.y;
  root.userData.baseScale = root.scale.x;
  root.userData.delta = 0;
  return root;
}

function updateEnemies(enemies, delta, elapsedTime) {
  for (const enemy of enemies) {
    enemy.userData.delta = delta;
    animateEnemy(enemy, elapsedTime);
  }
}
```

## Notes

- `magic-ball.glb` is the heaviest of the new assets because of the extra swirl rings and orbit particles.
- `crystal-ball-lightning.glb` is intentionally a bit larger than the others.
- If you want stronger glow, add a bloom pass in Three.js. The GLBs already carry emissive materials.
- If you later want true shader-driven lava flow or electric distortion, keep these same node names and layer the shader effect on the core mesh only.

## Fire Sun Plasma Shader

Use this only if you want the Fire Sun surface to feel more like drifting plasma instead of just rotating shells.
Apply it to `FireSun_Core` or `FireSun_Plasma`.

```js
function attachFireSunPlasmaDrift(mesh) {
  if (!mesh?.isMesh || !mesh.material) return;

  const material = mesh.material.clone();
  material.toneMapped = false;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    material.userData.shader = shader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      float plasmaWave =
        sin(position.y * 16.0 + uTime * 2.8) * 0.015 +
        cos(position.x * 13.0 - uTime * 2.2) * 0.012 +
        sin((position.z + position.x) * 11.0 + uTime * 3.1) * 0.01;
      transformed += normal * plasmaWave;
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      `
      #include <emissivemap_fragment>
      float glowWave =
        0.65 +
        sin(vViewPosition.x * 0.04 + uTime * 6.0) * 0.12 +
        cos(vViewPosition.y * 0.05 - uTime * 4.0) * 0.1;
      totalEmissiveRadiance *= glowWave;
      `
    );
  };

  material.needsUpdate = true;
  mesh.material = material;
}

function updateFireSunShader(mesh, elapsedTime) {
  const shader = mesh?.material?.userData?.shader;
  if (shader) shader.uniforms.uTime.value = elapsedTime;
}
```
