import * as THREE from 'three';

const LEVEL_SEED = 502026;
const TILE_SIZE = 2;
const PLATFORM_HEIGHT = 0.72;
const BARRIER_HEIGHT = 2.2;
const BARRIER_THICKNESS = 0.36;
const PILLAR_RADIUS = 0.46;
const PILLAR_HEIGHT = 3;
const MOSS_BASE_Y_OFFSET = 0.022;
const STAIRS_VISUAL_YAW_OFFSET = Math.PI;
const tempBox = new THREE.Box3();
const tempVectorA = new THREE.Vector3();
const tempVectorB = new THREE.Vector3();
const tempVectorC = new THREE.Vector3();
const tempQuaternion = new THREE.Quaternion();
const tempMatrix = new THREE.Matrix4();
const tempEuler = new THREE.Euler();

function createSeededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function randomRange(random, min, max) {
  return min + (max - min) * random();
}

function choose(random, values) {
  return values[Math.floor(random() * values.length)];
}

function configureTextureMap(texture) {
  const map = texture.clone();
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.minFilter = THREE.LinearMipmapLinearFilter;
  map.magFilter = THREE.LinearFilter;
  map.needsUpdate = true;
  return map;
}

function createBrickMaterials({ bricksTopTexture, bricksSideTexture }) {
  const sideMaterial = new THREE.MeshStandardMaterial({
    name: 'level-five-bricks-side',
    map: configureTextureMap(bricksSideTexture),
    roughness: 0.82,
    metalness: 0.02
  });
  const topMaterial = new THREE.MeshStandardMaterial({
    name: 'level-five-bricks-top',
    map: configureTextureMap(bricksTopTexture),
    roughness: 0.84,
    metalness: 0.02
  });
  return [sideMaterial, topMaterial];
}

function createInvisibleCollisionMaterial() {
  return new THREE.MeshBasicMaterial({
    colorWrite: false,
    depthWrite: false
  });
}

function addQuad(state, vertices, uvWidth, uvHeight, materialIndex) {
  const start = state.positions.length / 3;
  const [a, b, c, d] = vertices;
  const ordered = [a, b, c, a, c, d];
  const uvs = [
    0, 0,
    uvWidth / TILE_SIZE, 0,
    uvWidth / TILE_SIZE, uvHeight / TILE_SIZE,
    0, 0,
    uvWidth / TILE_SIZE, uvHeight / TILE_SIZE,
    0, uvHeight / TILE_SIZE
  ];

  for (const vertex of ordered) {
    state.positions.push(vertex[0], vertex[1], vertex[2]);
  }
  state.uvs.push(...uvs);
  state.groups.push({ start, count: 6, materialIndex });
}

function addTri(state, vertices, uvWidth, uvHeight, materialIndex) {
  const start = state.positions.length / 3;
  const uvs = [
    0, 0,
    uvWidth / TILE_SIZE, 0,
    uvWidth / TILE_SIZE, uvHeight / TILE_SIZE
  ];

  for (const vertex of vertices) {
    state.positions.push(vertex[0], vertex[1], vertex[2]);
  }
  state.uvs.push(...uvs);
  state.groups.push({ start, count: 3, materialIndex });
}

function finalizeGeometry(state) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(state.positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(state.uvs, 2));
  for (const group of state.groups) {
    geometry.addGroup(group.start, group.count, group.materialIndex);
  }
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.userData.disposeWithWorld = true;
  return geometry;
}

function createBrickBoxGeometry(width, height, depth) {
  const x = width / 2;
  const y = height / 2;
  const z = depth / 2;
  const state = { positions: [], uvs: [], groups: [] };

  addQuad(state, [[x, -y, -z], [x, y, -z], [x, y, z], [x, -y, z]], depth, height, 0);
  addQuad(state, [[-x, -y, -z], [-x, -y, z], [-x, y, z], [-x, y, -z]], depth, height, 0);
  addQuad(state, [[-x, y, -z], [-x, y, z], [x, y, z], [x, y, -z]], width, depth, 1);
  addQuad(state, [[-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z]], width, depth, 0);
  addQuad(state, [[-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]], width, height, 0);
  addQuad(state, [[-x, -y, -z], [-x, y, -z], [x, y, -z], [x, -y, -z]], width, height, 0);

  return finalizeGeometry(state);
}

function createBrickWedgeGeometry(width, height, depth) {
  const x = width / 2;
  const z = depth / 2;
  const slopeLength = Math.hypot(height, depth);
  const state = { positions: [], uvs: [], groups: [] };

  addQuad(state, [[-x, 0, -z], [-x, height, z], [x, height, z], [x, 0, -z]], width, slopeLength, 1);
  addQuad(state, [[-x, 0, -z], [x, 0, -z], [x, 0, z], [-x, 0, z]], width, depth, 0);
  addQuad(state, [[-x, 0, z], [x, 0, z], [x, height, z], [-x, height, z]], width, height, 0);
  addTri(state, [[-x, 0, -z], [-x, 0, z], [-x, height, z]], depth, height, 0);
  addTri(state, [[x, 0, -z], [x, height, z], [x, 0, z]], depth, height, 0);

  return finalizeGeometry(state);
}

function markGeneratedGeometry(mesh) {
  mesh.userData.disposeGeometry = true;
  return mesh;
}

function markCollisionProxy(mesh) {
  mesh.userData.invisibleCollisionProxy = true;
  mesh.userData.disposeGeometry = true;
  return mesh;
}

function markVisualOnly(object, { castShadow = true, receiveShadow = true } = {}) {
  object.traverse((child) => {
    if (!child.isMesh && !child.isSkinnedMesh && !child.isInstancedMesh) {
      return;
    }
    child.userData.ignoreWorldCollision = true;
    if (!castShadow) {
      child.userData.disableShadowCasting = true;
    }
    if (!receiveShadow) {
      child.userData.disableShadowReceiving = true;
    }
  });
  return object;
}

function createBrickBox(name, size, center, materials) {
  const mesh = new THREE.Mesh(createBrickBoxGeometry(size.x, size.y, size.z), materials);
  mesh.name = name;
  mesh.position.copy(center);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return markGeneratedGeometry(mesh);
}

function createBrickWedge(name, size, bottomCenter, yaw, materials) {
  const mesh = new THREE.Mesh(createBrickWedgeGeometry(size.x, size.y, size.z), materials);
  mesh.name = name;
  mesh.position.copy(bottomCenter);
  mesh.rotation.y = yaw;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return markGeneratedGeometry(mesh);
}

function createInvisibleBoxProxy(name, size, center, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), material);
  mesh.name = name;
  mesh.position.copy(center);
  return markCollisionProxy(mesh);
}

function createCylinderCollisionProxy({ name, radius, height, position, material }) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 18), material);
  mesh.name = name;
  mesh.position.copy(position);
  return markCollisionProxy(mesh);
}

function createFittedVisual(template, { name, bottomPosition, yaw = 0, size, visualOnly = true }) {
  const wrapper = new THREE.Group();
  wrapper.name = name;
  wrapper.position.copy(bottomPosition);
  wrapper.rotation.y = yaw;

  const clone = template.clone(true);
  clone.name = `${name}Visual`;
  clone.updateWorldMatrix(true, true);
  tempBox.setFromObject(clone);

  if (!tempBox.isEmpty()) {
    const sourceSize = tempBox.getSize(tempVectorA);
    const sourceCenter = tempBox.getCenter(tempVectorB);
    const sourceMinY = tempBox.min.y;
    clone.position.x -= sourceCenter.x;
    clone.position.y -= sourceMinY;
    clone.position.z -= sourceCenter.z;
    wrapper.scale.set(
      size.x / Math.max(sourceSize.x, 0.001),
      size.y / Math.max(sourceSize.y, 0.001),
      size.z / Math.max(sourceSize.z, 0.001)
    );
  }

  wrapper.add(clone);
  if (visualOnly) {
    markVisualOnly(wrapper);
  }
  return wrapper;
}

function addPlatform(collisionRoot, materials, platform) {
  const center = new THREE.Vector3(platform.x, platform.y - PLATFORM_HEIGHT / 2, platform.z);
  collisionRoot.add(
    createBrickBox(
      platform.name,
      new THREE.Vector3(platform.width, PLATFORM_HEIGHT, platform.depth),
      center,
      materials
    )
  );
}

function getSegments(min, max, openings = []) {
  const sortedOpenings = openings
    .map(([start, end]) => [Math.max(min, start), Math.min(max, end)])
    .filter(([start, end]) => end > start)
    .sort((a, b) => a[0] - b[0]);
  const segments = [];
  let cursor = min;

  for (const [start, end] of sortedOpenings) {
    if (start - cursor > 0.5) {
      segments.push([cursor, start]);
    }
    cursor = Math.max(cursor, end);
  }

  if (max - cursor > 0.5) {
    segments.push([cursor, max]);
  }

  return segments;
}

function addPlatformBarriers(collisionRoot, material, platform, openings = {}) {
  const minX = platform.x - platform.width / 2;
  const maxX = platform.x + platform.width / 2;
  const minZ = platform.z - platform.depth / 2;
  const maxZ = platform.z + platform.depth / 2;
  const y = platform.y + BARRIER_HEIGHT / 2;

  for (const [start, end] of getSegments(minX, maxX, openings.north)) {
    collisionRoot.add(
      createInvisibleBoxProxy(
        `${platform.name}NorthBarrier`,
        new THREE.Vector3(end - start, BARRIER_HEIGHT, BARRIER_THICKNESS),
        new THREE.Vector3((start + end) / 2, y, maxZ + BARRIER_THICKNESS / 2),
        material
      )
    );
  }

  for (const [start, end] of getSegments(minX, maxX, openings.south)) {
    collisionRoot.add(
      createInvisibleBoxProxy(
        `${platform.name}SouthBarrier`,
        new THREE.Vector3(end - start, BARRIER_HEIGHT, BARRIER_THICKNESS),
        new THREE.Vector3((start + end) / 2, y, minZ - BARRIER_THICKNESS / 2),
        material
      )
    );
  }

  for (const [start, end] of getSegments(minZ, maxZ, openings.east)) {
    collisionRoot.add(
      createInvisibleBoxProxy(
        `${platform.name}EastBarrier`,
        new THREE.Vector3(BARRIER_THICKNESS, BARRIER_HEIGHT, end - start),
        new THREE.Vector3(maxX + BARRIER_THICKNESS / 2, y, (start + end) / 2),
        material
      )
    );
  }

  for (const [start, end] of getSegments(minZ, maxZ, openings.west)) {
    collisionRoot.add(
      createInvisibleBoxProxy(
        `${platform.name}WestBarrier`,
        new THREE.Vector3(BARRIER_THICKNESS, BARRIER_HEIGHT, end - start),
        new THREE.Vector3(minX - BARRIER_THICKNESS / 2, y, (start + end) / 2),
        material
      )
    );
  }
}

function addBridgeSideBarriers(collisionRoot, material, { name, center, size, axis }) {
  const height = 1.4;
  const y = center.y + height / 2;
  const offset = size.z / 2 + BARRIER_THICKNESS / 2;

  if (axis === 'x') {
    collisionRoot.add(
      createInvisibleBoxProxy(
        `${name}NorthRailProxy`,
        new THREE.Vector3(size.x, height, BARRIER_THICKNESS),
        new THREE.Vector3(center.x, y, center.z + offset),
        material
      )
    );
    collisionRoot.add(
      createInvisibleBoxProxy(
        `${name}SouthRailProxy`,
        new THREE.Vector3(size.x, height, BARRIER_THICKNESS),
        new THREE.Vector3(center.x, y, center.z - offset),
        material
      )
    );
  }
}

function addStairSideBarriers(collisionRoot, material, { name, x, zStart, zEnd, yStart, yEnd, width = 3 }) {
  const height = Math.abs(yEnd - yStart) + 2.1;
  const centerY = (yStart + yEnd) / 2 + 1.05;
  const centerZ = (zStart + zEnd) / 2;
  const length = Math.abs(zEnd - zStart);
  const xOffset = width / 2 + BARRIER_THICKNESS / 2;

  collisionRoot.add(
    createInvisibleBoxProxy(
      `${name}LeftRailProxy`,
      new THREE.Vector3(BARRIER_THICKNESS, height, length),
      new THREE.Vector3(x - xOffset, centerY, centerZ),
      material
    )
  );
  collisionRoot.add(
    createInvisibleBoxProxy(
      `${name}RightRailProxy`,
      new THREE.Vector3(BARRIER_THICKNESS, height, length),
      new THREE.Vector3(x + xOffset, centerY, centerZ),
      material
    )
  );
}

function addStair(collisionRoot, visualRoot, materials, assetTemplates, { name, bottomPosition, yaw, size }) {
  collisionRoot.add(createBrickWedge(`${name}Collision`, size, bottomPosition, yaw, materials));
  visualRoot.add(
    createFittedVisual(assetTemplates.stairsMd, {
      name,
      bottomPosition,
      yaw: yaw + STAIRS_VISUAL_YAW_OFFSET,
      size,
      visualOnly: true
    })
  );
}

function addStartPodium(collisionRoot, visualRoot, materials, invisibleMaterial, assetTemplates) {
  const podiumSize = new THREE.Vector3(2.3, 1, 2.3);
  const podiumBottom = new THREE.Vector3(0, 0, 0);
  const podiumCenter = new THREE.Vector3(0, podiumSize.y / 2, 0);

  collisionRoot.add(createInvisibleBoxProxy('StartPodiumCollisionProxy', podiumSize, podiumCenter, invisibleMaterial));
  visualRoot.add(
    createFittedVisual(assetTemplates.blockNormalXl, {
      name: 'StartPodiumBlockNormalXL',
      bottomPosition: podiumBottom,
      size: podiumSize,
      visualOnly: true
    })
  );

  const stairSize = new THREE.Vector3(2, 1, 2);
  addStair(collisionRoot, visualRoot, materials, assetTemplates, {
    name: 'StartPodiumSouthStairsMD',
    bottomPosition: new THREE.Vector3(0, 0, -2.15),
    yaw: 0,
    size: stairSize
  });
  addStair(collisionRoot, visualRoot, materials, assetTemplates, {
    name: 'StartPodiumNorthStairsMD',
    bottomPosition: new THREE.Vector3(0, 0, 2.15),
    yaw: Math.PI,
    size: stairSize
  });
  addStair(collisionRoot, visualRoot, materials, assetTemplates, {
    name: 'StartPodiumEastStairsMD',
    bottomPosition: new THREE.Vector3(2.15, 0, 0),
    yaw: -Math.PI / 2,
    size: stairSize
  });
  addStair(collisionRoot, visualRoot, materials, assetTemplates, {
    name: 'StartPodiumWestStairsMD',
    bottomPosition: new THREE.Vector3(-2.15, 0, 0),
    yaw: Math.PI / 2,
    size: stairSize
  });
}

function addPillar(collisionRoot, visualRoot, material, assetTemplates, random, position, name) {
  const template = random() > 0.45 ? assetTemplates.pillarRound : assetTemplates.pillarRoundCut;
  const yaw = randomRange(random, 0, Math.PI * 2);

  visualRoot.add(
    createFittedVisual(template, {
      name,
      bottomPosition: position,
      yaw,
      size: new THREE.Vector3(1, PILLAR_HEIGHT, 1),
      visualOnly: true
    })
  );
  collisionRoot.add(
    createCylinderCollisionProxy({
      name: `${name}CollisionProxy`,
      radius: PILLAR_RADIUS,
      height: PILLAR_HEIGHT,
      position: new THREE.Vector3(position.x, position.y + PILLAR_HEIGHT / 2, position.z),
      material
    })
  );
}

function addPerimeterPillars(collisionRoot, visualRoot, invisibleMaterial, assetTemplates, random, platforms) {
  const pillarPoints = [
    [platforms[0], -10.2, -10.2], [platforms[0], -10.2, 10.2], [platforms[0], 10.2, -10.2], [platforms[0], 9.8, 10.2],
    [platforms[1], 19.6, -9.3], [platforms[1], 38.4, -9.3], [platforms[1], 38.4, 9.3],
    [platforms[2], 18.2, 18.6], [platforms[2], 39.8, 18.6], [platforms[2], 39.8, 35.4],
    [platforms[3], -9.4, 17.6], [platforms[3], -9.4, 36.4], [platforms[3], 9.6, 36.4]
  ];

  pillarPoints.forEach(([platform, x, z], index) => {
    addPillar(
      collisionRoot,
      visualRoot,
      invisibleMaterial,
      assetTemplates,
      random,
      new THREE.Vector3(x, platform.y, z),
      `LevelFivePerimeterPillar_${index + 1}`
    );
  });
}

function addSkullDecoration(collisionRoot, visualRoot, invisibleMaterial, assetTemplates, random, position, name) {
  const template = random() > 0.5 ? assetTemplates.skull : assetTemplates.skullCracked;
  const size = randomRange(random, 0.48, 0.78);
  visualRoot.add(
    createFittedVisual(template, {
      name,
      bottomPosition: position,
      yaw: randomRange(random, 0, Math.PI * 2),
      size: new THREE.Vector3(size, size, size),
      visualOnly: true
    })
  );
  collisionRoot.add(
    createInvisibleBoxProxy(
      `${name}CollisionProxy`,
      new THREE.Vector3(size * 0.72, size * 0.72, size * 0.72),
      new THREE.Vector3(position.x, position.y + size * 0.36, position.z),
      invisibleMaterial
    )
  );
}

function addDecorations(collisionRoot, visualRoot, invisibleMaterial, assetTemplates, random) {
  const points = [
    [-8.5, 0.02, -7.8],
    [8.8, 0.02, -8.5],
    [22.2, 0.02, 7.6],
    [36.4, 0.02, -6.2],
    [35.5, 4.02, 32.4],
    [21.2, 4.02, 20.4],
    [-7.2, 4.02, 34.2],
    [7.6, 4.02, 19.7]
  ];

  points.forEach((point, index) => {
    addSkullDecoration(
      collisionRoot,
      visualRoot,
      invisibleMaterial,
      assetTemplates,
      random,
      new THREE.Vector3(point[0], point[1], point[2]),
      `LevelFiveSkullDecoration_${index + 1}`
    );
  });
}

function collectMeshSources(template) {
  const sources = [];
  template.updateWorldMatrix(true, true);
  template.traverse((child) => {
    if (!child.isMesh || !child.geometry || !child.material) {
      return;
    }
    sources.push({
      geometry: child.geometry,
      material: child.material,
      matrix: child.matrixWorld.clone()
    });
  });
  return sources;
}

function addInstancedMossBatch(visualRoot, template, placements, name) {
  if (!template || placements.length === 0) {
    return;
  }

  const sources = collectMeshSources(template);
  for (let sourceIndex = 0; sourceIndex < sources.length; sourceIndex += 1) {
    const source = sources[sourceIndex];
    const material = Array.isArray(source.material)
      ? source.material.map((item) => item.clone())
      : source.material.clone();
    const batch = new THREE.InstancedMesh(source.geometry.clone(), material, placements.length);
    batch.name = `${name}_${sourceIndex + 1}`;
    batch.userData.disposeGeometry = true;
    markVisualOnly(batch, { castShadow: false, receiveShadow: true });

    for (let index = 0; index < placements.length; index += 1) {
      const placement = placements[index];
      tempEuler.set(0, placement.yaw, 0);
      tempQuaternion.setFromEuler(tempEuler);
      tempVectorA.setScalar(placement.scale);
      tempMatrix.compose(placement.position, tempQuaternion, tempVectorA);
      tempMatrix.multiply(source.matrix);
      batch.setMatrixAt(index, tempMatrix);
    }

    batch.instanceMatrix.needsUpdate = true;
    batch.computeBoundingSphere();
    batch.castShadow = false;
    batch.receiveShadow = true;
    visualRoot.add(batch);
  }
}

function pushMossPlacement(placementsByType, type, position, yaw, scale) {
  placementsByType[type].push({
    position,
    yaw,
    scale
  });
}

function isInsideOpening(value, openings = []) {
  return openings.some(([start, end]) => value >= start && value <= end);
}

function addMossAlongEdge(
  placementsByType,
  random,
  platform,
  edge,
  count,
  { openings = [], row = 0, scaleMultiplier = 1 } = {}
) {
  const minX = platform.x - platform.width / 2;
  const maxX = platform.x + platform.width / 2;
  const minZ = platform.z - platform.depth / 2;
  const maxZ = platform.z + platform.depth / 2;
  const typeWeights = ['groundMossXs', 'groundMossMd', 'groundMossXl'];
  const outwardMin = row === 0 ? 0.22 : 1.02;
  const outwardMax = row === 0 ? 1.05 : 2.05;

  for (let index = 0; index < count; index += 1) {
    const t = (index + random() * 0.7) / count;
    const outwardOffset = randomRange(random, outwardMin, outwardMax);
    const tangentJitter = randomRange(random, -0.5, 0.5);
    let x = platform.x;
    let z = platform.z;
    let yaw = 0;
    let openingCoordinate = 0;

    if (edge === 'north') {
      x = THREE.MathUtils.lerp(minX, maxX, t) + tangentJitter;
      z = maxZ + outwardOffset;
      yaw = Math.PI + randomRange(random, -0.45, 0.45);
      openingCoordinate = x;
    } else if (edge === 'south') {
      x = THREE.MathUtils.lerp(minX, maxX, t) + tangentJitter;
      z = minZ - outwardOffset;
      yaw = randomRange(random, -0.45, 0.45);
      openingCoordinate = x;
    } else if (edge === 'east') {
      x = maxX + outwardOffset;
      z = THREE.MathUtils.lerp(minZ, maxZ, t) + tangentJitter;
      yaw = -Math.PI / 2 + randomRange(random, -0.45, 0.45);
      openingCoordinate = z;
    } else {
      x = minX - outwardOffset;
      z = THREE.MathUtils.lerp(minZ, maxZ, t) + tangentJitter;
      yaw = Math.PI / 2 + randomRange(random, -0.45, 0.45);
      openingCoordinate = z;
    }

    if (isInsideOpening(openingCoordinate, openings)) {
      continue;
    }

    pushMossPlacement(
      placementsByType,
      choose(random, typeWeights),
      new THREE.Vector3(x, platform.y + MOSS_BASE_Y_OFFSET, z),
      yaw,
      randomRange(random, 0.72, 1.45) * scaleMultiplier
    );
  }
}

function addMossForPlatform(placementsByType, random, platform) {
  const northSouthCount = Math.max(8, Math.round(platform.width / 1.6));
  const eastWestCount = Math.max(8, Math.round(platform.depth / 1.6));
  const rows = [
    { row: 0, scaleMultiplier: 1, countMultiplier: 1 },
    { row: 1, scaleMultiplier: 2, countMultiplier: 0.7 }
  ];

  for (const rowConfig of rows) {
    const horizontalCount = Math.max(6, Math.round(northSouthCount * rowConfig.countMultiplier));
    const verticalCount = Math.max(6, Math.round(eastWestCount * rowConfig.countMultiplier));

    addMossAlongEdge(placementsByType, random, platform, 'north', horizontalCount, {
      openings: platform.mossOpenings?.north,
      row: rowConfig.row,
      scaleMultiplier: rowConfig.scaleMultiplier
    });
    addMossAlongEdge(placementsByType, random, platform, 'south', horizontalCount, {
      openings: platform.mossOpenings?.south,
      row: rowConfig.row,
      scaleMultiplier: rowConfig.scaleMultiplier
    });
    addMossAlongEdge(placementsByType, random, platform, 'east', verticalCount, {
      openings: platform.mossOpenings?.east,
      row: rowConfig.row,
      scaleMultiplier: rowConfig.scaleMultiplier
    });
    addMossAlongEdge(placementsByType, random, platform, 'west', verticalCount, {
      openings: platform.mossOpenings?.west,
      row: rowConfig.row,
      scaleMultiplier: rowConfig.scaleMultiplier
    });
  }
}

function addMossAlongBridgeEdges(placementsByType, random, { xStart, xEnd, y, z, width }) {
  const typeWeights = ['groundMossXs', 'groundMossMd', 'groundMossXl'];
  const count = Math.max(4, Math.round(Math.abs(xEnd - xStart) / 1.05));
  const rows = [
    { offset: 0.28, scaleMultiplier: 1, countMultiplier: 1 },
    { offset: 0.9, scaleMultiplier: 2, countMultiplier: 0.7 }
  ];

  for (const side of [-1, 1]) {
    for (const row of rows) {
      const rowCount = Math.max(3, Math.round(count * row.countMultiplier));
      for (let index = 0; index < rowCount; index += 1) {
        const t = (index + 0.5 + random() * 0.35) / rowCount;
        const x = THREE.MathUtils.lerp(xStart + 0.7, xEnd - 0.7, t) + randomRange(random, -0.18, 0.18);
        const sideZ = z + side * (width / 2 + row.offset + randomRange(random, 0, 0.32));
        pushMossPlacement(
          placementsByType,
          choose(random, typeWeights),
          new THREE.Vector3(x, y + MOSS_BASE_Y_OFFSET, sideZ),
          (side > 0 ? Math.PI : 0) + randomRange(random, -0.35, 0.35),
          randomRange(random, 0.7, 1.28) * row.scaleMultiplier
        );
      }
    }
  }
}

function addMossAlongStairsEdges(
  placementsByType,
  random,
  { x, zStart, zEnd, yStart, yEnd, width = 3, count = 7 }
) {
  const typeWeights = ['groundMossXs', 'groundMossMd', 'groundMossXl'];
  const rows = [
    { offset: 0.28, scaleMultiplier: 1, countMultiplier: 1 },
    { offset: 0.86, scaleMultiplier: 2, countMultiplier: 0.72 }
  ];

  for (const side of [-1, 1]) {
    for (const row of rows) {
      const rowCount = Math.max(3, Math.round(count * row.countMultiplier));
      for (let index = 0; index < rowCount; index += 1) {
        const t = (index + 0.5 + random() * 0.35) / rowCount;
        const z = THREE.MathUtils.lerp(zStart, zEnd, t);
        const y = THREE.MathUtils.lerp(yStart, yEnd, (z - zStart) / (zEnd - zStart));
        const sideX = x + side * (width / 2 + row.offset + randomRange(random, 0, 0.25));
        pushMossPlacement(
          placementsByType,
          choose(random, typeWeights),
          new THREE.Vector3(sideX, y + MOSS_BASE_Y_OFFSET, z + randomRange(random, -0.16, 0.16)),
          (side > 0 ? -Math.PI / 2 : Math.PI / 2) + randomRange(random, -0.35, 0.35),
          randomRange(random, 0.68, 1.22) * row.scaleMultiplier
        );
      }
    }
  }
}

function addInstancedMossBorder(visualRoot, assetTemplates, random, platforms, mossDetails = {}) {
  const placementsByType = {
    groundMossXs: [],
    groundMossMd: [],
    groundMossXl: []
  };

  for (const platform of platforms) {
    addMossForPlatform(placementsByType, random, platform);
  }

  const bridges = mossDetails.bridges ?? [
    { xStart: 12, xEnd: 18, y: 0, z: 0, width: 3 },
    { xStart: 11, xEnd: 17, y: 4, z: 27, width: 3 }
  ];
  const stairs = mossDetails.stairs ?? [
    { x: 29, zStart: 11.35, zEnd: 16.65, yStart: 0, yEnd: 4, width: 3, count: 7 }
  ];

  for (const bridge of bridges) {
    addMossAlongBridgeEdges(placementsByType, random, bridge);
  }

  for (const stairRun of stairs) {
    addMossAlongStairsEdges(placementsByType, random, stairRun);
  }

  addInstancedMossBatch(visualRoot, assetTemplates.groundMossXs, placementsByType.groundMossXs, 'LevelFiveGroundMossXS');
  addInstancedMossBatch(visualRoot, assetTemplates.groundMossMd, placementsByType.groundMossMd, 'LevelFiveGroundMossMD');
  addInstancedMossBatch(visualRoot, assetTemplates.groundMossXl, placementsByType.groundMossXl, 'LevelFiveGroundMossXL');
}

function addMarkers(root) {
  const playerSpawn = new THREE.Object3D();
  playerSpawn.name = 'PlayerSpawn';
  playerSpawn.position.set(0, 1.06, 0);
  root.add(playerSpawn);

  const teleport = new THREE.Object3D();
  teleport.name = 'Teleport';
  teleport.position.set(0, 4.08, 27);
  root.add(teleport);

  const enemyMarkers = [
    ['EnemySpawn_01', 29, 0.08, 0],
    ['EnemySpawn_02', 29, 4.08, 27],
    ['EnemySpawn_03', 0, 4.08, 27]
  ];

  for (const [name, x, y, z] of enemyMarkers) {
    const marker = new THREE.Object3D();
    marker.name = name;
    marker.position.set(x, y, z);
    root.add(marker);
  }
}

export function createLevelFiveSceneWorld({ assetTemplates, bricksTopTexture, bricksSideTexture }) {
  const random = createSeededRandom(LEVEL_SEED);
  const root = new THREE.Group();
  root.name = 'level-five-procedural-root';

  const collisionRoot = new THREE.Group();
  collisionRoot.name = 'level-five-collision-root';
  root.add(collisionRoot);
  root.userData.collisionRoot = collisionRoot;

  const visualRoot = new THREE.Group();
  visualRoot.name = 'level-five-visual-only-root';
  root.add(visualRoot);

  const materials = createBrickMaterials({ bricksTopTexture, bricksSideTexture });
  const invisibleMaterial = createInvisibleCollisionMaterial();
  const platforms = [
    {
      name: 'LevelFiveStartPlatform',
      x: 0,
      y: 0,
      z: 0,
      width: 24,
      depth: 24,
      mossOpenings: { east: [[-3, 3]] }
    },
    {
      name: 'LevelFiveLowerPlatform',
      x: 29,
      y: 0,
      z: 0,
      width: 22,
      depth: 22,
      mossOpenings: { west: [[-3, 3]], north: [[25.8, 32.2]] }
    },
    {
      name: 'LevelFiveUpperPlatformA',
      x: 29,
      y: 4,
      z: 27,
      width: 24,
      depth: 20,
      mossOpenings: { south: [[25.8, 32.2]], west: [[24, 30]] }
    },
    {
      name: 'LevelFiveUpperPlatformB',
      x: 0,
      y: 4,
      z: 27,
      width: 22,
      depth: 22,
      mossOpenings: { east: [[24, 30]] }
    }
  ];

  for (const platform of platforms) {
    addPlatform(collisionRoot, materials, platform);
  }

  const lowerBridge = {
    name: 'LevelFiveLowerBridge',
    center: new THREE.Vector3(15, -PLATFORM_HEIGHT / 2, 0),
    size: new THREE.Vector3(6, PLATFORM_HEIGHT, 3),
    axis: 'x'
  };
  collisionRoot.add(createBrickBox(lowerBridge.name, lowerBridge.size, lowerBridge.center, materials));
  addBridgeSideBarriers(collisionRoot, invisibleMaterial, {
    ...lowerBridge,
    center: new THREE.Vector3(lowerBridge.center.x, 0, lowerBridge.center.z)
  });

  const upperBridge = {
    name: 'LevelFiveUpperBridge',
    center: new THREE.Vector3(14, 4 - PLATFORM_HEIGHT / 2, 27),
    size: new THREE.Vector3(6, PLATFORM_HEIGHT, 3),
    axis: 'x'
  };
  collisionRoot.add(createBrickBox(upperBridge.name, upperBridge.size, upperBridge.center, materials));
  addBridgeSideBarriers(collisionRoot, invisibleMaterial, {
    ...upperBridge,
    center: new THREE.Vector3(upperBridge.center.x, 4, upperBridge.center.z)
  });

  addStartPodium(collisionRoot, visualRoot, materials, invisibleMaterial, assetTemplates);

  addStair(collisionRoot, visualRoot, materials, assetTemplates, {
    name: 'LevelFiveMainStairsLowerMD',
    bottomPosition: new THREE.Vector3(29, 0, 12.5),
    yaw: 0,
    size: new THREE.Vector3(3, 2, 3)
  });
  addStair(collisionRoot, visualRoot, materials, assetTemplates, {
    name: 'LevelFiveMainStairsUpperMD',
    bottomPosition: new THREE.Vector3(29, 2, 15.5),
    yaw: 0,
    size: new THREE.Vector3(3, 2, 3)
  });
  addStairSideBarriers(collisionRoot, invisibleMaterial, {
    name: 'LevelFiveMainStairs',
    x: 29,
    zStart: 11,
    zEnd: 17,
    yStart: 0,
    yEnd: 4,
    width: 3
  });

  addPlatformBarriers(collisionRoot, invisibleMaterial, platforms[0], {
    east: [[-2.2, 2.2]]
  });
  addPlatformBarriers(collisionRoot, invisibleMaterial, platforms[1], {
    west: [[-2.2, 2.2]],
    north: [[26.5, 31.5]]
  });
  addPlatformBarriers(collisionRoot, invisibleMaterial, platforms[2], {
    south: [[26.5, 31.5]],
    west: [[24.8, 29.2]]
  });
  addPlatformBarriers(collisionRoot, invisibleMaterial, platforms[3], {
    east: [[24.8, 29.2]]
  });

  addPerimeterPillars(collisionRoot, visualRoot, invisibleMaterial, assetTemplates, random, platforms);
  addDecorations(collisionRoot, visualRoot, invisibleMaterial, assetTemplates, random);
  addInstancedMossBorder(visualRoot, assetTemplates, random, platforms);
  addMarkers(root);

  return root;
}

export function createLevelSixSceneWorld({ assetTemplates, bricksTopTexture, bricksSideTexture }) {
  const random = createSeededRandom(LEVEL_SEED + 1000);
  const root = new THREE.Group();
  root.name = 'level-six-procedural-root';

  const collisionRoot = new THREE.Group();
  collisionRoot.name = 'level-six-collision-root';
  root.add(collisionRoot);
  root.userData.collisionRoot = collisionRoot;

  const visualRoot = new THREE.Group();
  visualRoot.name = 'level-six-visual-only-root';
  root.add(visualRoot);

  const materials = createBrickMaterials({ bricksTopTexture, bricksSideTexture });
  const invisibleMaterial = createInvisibleCollisionMaterial();
  const platforms = [
    {
      name: 'LevelSixStartPlatform',
      x: 0,
      y: 0,
      z: 0,
      width: 24,
      depth: 24,
      mossOpenings: { east: [[-3, 3]] }
    },
    {
      name: 'LevelSixLowerPlatform',
      x: 29,
      y: 0,
      z: 0,
      width: 22,
      depth: 22,
      mossOpenings: { west: [[-3, 3]], north: [[25.8, 32.2]] }
    },
    {
      name: 'LevelSixMidPlatformA',
      x: 29,
      y: 4,
      z: 27,
      width: 24,
      depth: 20,
      mossOpenings: { south: [[25.8, 32.2]], west: [[24, 30]], north: [[25.8, 32.2]] }
    },
    {
      name: 'LevelSixMidPlatformB',
      x: 0,
      y: 4,
      z: 27,
      width: 22,
      depth: 22,
      mossOpenings: { east: [[24, 30]] }
    },
    {
      name: 'LevelSixTopPlatform',
      x: 29,
      y: 8,
      z: 54,
      width: 24,
      depth: 20,
      mossOpenings: { south: [[25.8, 32.2]] }
    }
  ];

  for (const platform of platforms) {
    addPlatform(collisionRoot, materials, platform);
  }

  const lowerBridge = {
    name: 'LevelSixLowerBridge',
    center: new THREE.Vector3(15, -PLATFORM_HEIGHT / 2, 0),
    size: new THREE.Vector3(6, PLATFORM_HEIGHT, 3),
    axis: 'x'
  };
  collisionRoot.add(createBrickBox(lowerBridge.name, lowerBridge.size, lowerBridge.center, materials));
  addBridgeSideBarriers(collisionRoot, invisibleMaterial, {
    ...lowerBridge,
    center: new THREE.Vector3(lowerBridge.center.x, 0, lowerBridge.center.z)
  });

  const midBridge = {
    name: 'LevelSixMidBridge',
    center: new THREE.Vector3(14, 4 - PLATFORM_HEIGHT / 2, 27),
    size: new THREE.Vector3(6, PLATFORM_HEIGHT, 3),
    axis: 'x'
  };
  collisionRoot.add(createBrickBox(midBridge.name, midBridge.size, midBridge.center, materials));
  addBridgeSideBarriers(collisionRoot, invisibleMaterial, {
    ...midBridge,
    center: new THREE.Vector3(midBridge.center.x, 4, midBridge.center.z)
  });

  addStartPodium(collisionRoot, visualRoot, materials, invisibleMaterial, assetTemplates);

  addStair(collisionRoot, visualRoot, materials, assetTemplates, {
    name: 'LevelSixFloorOneStairsLowerMD',
    bottomPosition: new THREE.Vector3(29, 0, 12.5),
    yaw: 0,
    size: new THREE.Vector3(3, 2, 3)
  });
  addStair(collisionRoot, visualRoot, materials, assetTemplates, {
    name: 'LevelSixFloorOneStairsUpperMD',
    bottomPosition: new THREE.Vector3(29, 2, 15.5),
    yaw: 0,
    size: new THREE.Vector3(3, 2, 3)
  });
  addStairSideBarriers(collisionRoot, invisibleMaterial, {
    name: 'LevelSixFloorOneStairs',
    x: 29,
    zStart: 11,
    zEnd: 17,
    yStart: 0,
    yEnd: 4,
    width: 3
  });

  addStair(collisionRoot, visualRoot, materials, assetTemplates, {
    name: 'LevelSixFloorTwoStairsLowerMD',
    bottomPosition: new THREE.Vector3(29, 4, 39.5),
    yaw: 0,
    size: new THREE.Vector3(3, 2, 3)
  });
  addStair(collisionRoot, visualRoot, materials, assetTemplates, {
    name: 'LevelSixFloorTwoStairsUpperMD',
    bottomPosition: new THREE.Vector3(29, 6, 42.5),
    yaw: 0,
    size: new THREE.Vector3(3, 2, 3)
  });
  addStairSideBarriers(collisionRoot, invisibleMaterial, {
    name: 'LevelSixFloorTwoStairs',
    x: 29,
    zStart: 38,
    zEnd: 44,
    yStart: 4,
    yEnd: 8,
    width: 3
  });

  addPlatformBarriers(collisionRoot, invisibleMaterial, platforms[0], {
    east: [[-2.2, 2.2]]
  });
  addPlatformBarriers(collisionRoot, invisibleMaterial, platforms[1], {
    west: [[-2.2, 2.2]],
    north: [[26.5, 31.5]]
  });
  addPlatformBarriers(collisionRoot, invisibleMaterial, platforms[2], {
    south: [[26.5, 31.5]],
    west: [[24.8, 29.2]],
    north: [[26.5, 31.5]]
  });
  addPlatformBarriers(collisionRoot, invisibleMaterial, platforms[3], {
    east: [[24.8, 29.2]]
  });
  addPlatformBarriers(collisionRoot, invisibleMaterial, platforms[4], {
    south: [[26.5, 31.5]]
  });

  addPerimeterPillars(collisionRoot, visualRoot, invisibleMaterial, assetTemplates, random, platforms);
  [
    [18.2, 44.8],
    [39.8, 44.8],
    [18.2, 63.2],
    [39.8, 63.2]
  ].forEach(([x, z], index) => {
    addPillar(
      collisionRoot,
      visualRoot,
      invisibleMaterial,
      assetTemplates,
      random,
      new THREE.Vector3(x, platforms[4].y, z),
      `LevelSixTopPerimeterPillar_${index + 1}`
    );
  });

  addDecorations(collisionRoot, visualRoot, invisibleMaterial, assetTemplates, random);
  [
    [22.6, 8.02, 47.5],
    [36.8, 8.02, 51.2],
    [20.7, 8.02, 61.3],
    [37.2, 8.02, 61.8]
  ].forEach((point, index) => {
    addSkullDecoration(
      collisionRoot,
      visualRoot,
      invisibleMaterial,
      assetTemplates,
      random,
      new THREE.Vector3(point[0], point[1], point[2]),
      `LevelSixTopSkullDecoration_${index + 1}`
    );
  });

  addInstancedMossBorder(visualRoot, assetTemplates, random, platforms, {
    bridges: [
      { xStart: 12, xEnd: 18, y: 0, z: 0, width: 3 },
      { xStart: 11, xEnd: 17, y: 4, z: 27, width: 3 }
    ],
    stairs: [
      { x: 29, zStart: 11.35, zEnd: 16.65, yStart: 0, yEnd: 4, width: 3, count: 7 },
      { x: 29, zStart: 38.35, zEnd: 43.65, yStart: 4, yEnd: 8, width: 3, count: 7 }
    ]
  });

  const playerSpawn = new THREE.Object3D();
  playerSpawn.name = 'PlayerSpawn';
  playerSpawn.position.set(0, 1.06, 0);
  root.add(playerSpawn);

  const teleport = new THREE.Object3D();
  teleport.name = 'Teleport';
  teleport.position.set(29, 8.08, 54);
  root.add(teleport);

  return root;
}
