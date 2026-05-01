import {
  crystalBallLightningUrl,
  combatMusicUrl,
  destroyMusicUrl,
  electricBallUrl,
  fireSunUrl,
  lavaBallUrl,
  magicBallUrl,
  roundCornersMusicUrl,
  speedMusicUrl,
  spikedBallUrl
} from './assets.js';

export const ENEMY_TEMPLATE_URLS = {
  spikedBall: spikedBallUrl,
  fireSun: fireSunUrl,
  lavaBall: lavaBallUrl,
  magicBall: magicBallUrl,
  electricBall: electricBallUrl,
  crystalBallLightning: crystalBallLightningUrl
};

const LEVEL_ONE_SPIKED_POSITIONS = [
  [-3.5, 2.57, 30],
  [3.5, 2.57, 34]
];

const LEVEL_TWO_ENEMY_CONFIGS = [
  {
    id: 'spiked-1',
    type: 'spiked',
    enemyKey: 'spikedBall',
    position: [-0.192, 1.479, 16.956],
    hp: 100,
    damage: 1,
    detectionRadius: 11,
    speed: 2.15,
    attackSpeed: 3.35
  },
  {
    id: 'spiked-2',
    type: 'spiked',
    enemyKey: 'spikedBall',
    position: [6.808, 1.358, 12.092],
    hp: 100,
    damage: 1,
    detectionRadius: 11,
    speed: 2.15,
    attackSpeed: 3.35
  },
  {
    id: 'fire-1',
    type: 'fire',
    enemyKey: 'fireSun',
    position: [27, 6.368, 0],
    hp: 100,
    damage: 1,
    projectileDamage: 1,
    detectionRadius: 18,
    speed: 1.8,
    attackSpeed: 2.5,
    fireRate: 0.72,
    projectileCount: 1,
    projectileSpeed: 14,
    preferHighest: true
  }
];

const LEVEL_THREE_ENEMY_CONFIGS = [
  {
    id: 'spiked-1',
    type: 'spiked',
    enemyKey: 'spikedBall',
    position: [-4.5, 0.55, 4.5],
    hp: 100,
    damage: 1,
    detectionRadius: 11,
    speed: 2.15,
    attackSpeed: 3.35
  },
  {
    id: 'spiked-2',
    type: 'spiked',
    enemyKey: 'spikedBall',
    position: [4.2, 0.55, 30.1],
    hp: 100,
    damage: 1,
    detectionRadius: 11,
    speed: 2.15,
    attackSpeed: 3.35
  },
  {
    id: 'fire-1',
    type: 'fire',
    enemyKey: 'fireSun',
    position: [0, 0.55, 30.138],
    hp: 100,
    damage: 1,
    projectileDamage: 1,
    detectionRadius: 18,
    speed: 1.8,
    attackSpeed: 2.5,
    fireRate: 0.72,
    projectileCount: 1,
    projectileSpeed: 14
  },
  {
    id: 'lava-1',
    type: 'lava',
    enemyKey: 'lavaBall',
    position: [-32.75, 0.55, 30.1],
    hp: 120,
    damage: 1,
    projectileDamage: 1,
    detectionRadius: 10.5,
    speed: 2.0,
    attackSpeed: 3.0,
    lavaBurstInterval: 1.85,
    projectileRadius: 0.64,
    projectileLifetime: 12
  }
];

const LEVEL_FOUR_ENEMY_CONFIGS = [
  {
    id: 'spiked-1',
    type: 'spiked',
    enemyKey: 'spikedBall',
    position: [-0.192, 1.479, 16.956],
    hp: 100,
    damage: 1,
    detectionRadius: 12,
    speed: 2.2,
    attackSpeed: 3.45,
    preferHighest: true
  },
  {
    id: 'spiked-2',
    type: 'spiked',
    enemyKey: 'spikedBall',
    position: [6.808, 1.358, 12.092],
    hp: 100,
    damage: 1,
    detectionRadius: 12,
    speed: 2.2,
    attackSpeed: 3.45,
    preferHighest: true
  },
  {
    id: 'fire-1',
    type: 'fire',
    enemyKey: 'fireSun',
    position: [27, 6.368, 0],
    hp: 100,
    damage: 1,
    projectileDamage: 1,
    detectionRadius: 19,
    speed: 2.0,
    attackSpeed: 2.7,
    fireRate: 0.7,
    projectileCount: 1,
    projectileSpeed: 14.5,
    preferHighest: true
  },
  {
    id: 'lava-1',
    type: 'lava',
    enemyKey: 'lavaBall',
    position: [20, 5.2, 8],
    hp: 120,
    damage: 1,
    projectileDamage: 1,
    detectionRadius: 12,
    speed: 2.05,
    attackSpeed: 3.1,
    lavaBurstInterval: 1.85,
    projectileRadius: 0.64,
    projectileLifetime: 12,
    preferHighest: true
  },
  {
    id: 'lava-2',
    type: 'lava',
    enemyKey: 'lavaBall',
    position: [17.6, 10, 30],
    hp: 130,
    damage: 1,
    projectileDamage: 1,
    detectionRadius: 13,
    speed: 2.1,
    attackSpeed: 3.2,
    lavaBurstInterval: 1.95,
    projectileRadius: 0.64,
    projectileLifetime: 12,
    preferHighest: true
  }
];

function createSpikedConfig(id, position, overrides = {}) {
  return {
    id,
    type: 'spiked',
    enemyKey: 'spikedBall',
    position,
    hp: overrides.hp ?? 110,
    damage: overrides.damage ?? 1,
    detectionRadius: overrides.detectionRadius ?? 12,
    speed: overrides.speed ?? 2.25,
    attackSpeed: overrides.attackSpeed ?? 3.5,
    preferHighest: overrides.preferHighest
  };
}

function createFireConfig(id, position, overrides = {}) {
  return {
    id,
    type: 'fire',
    enemyKey: 'fireSun',
    position,
    hp: overrides.hp ?? 110,
    damage: overrides.damage ?? 1,
    projectileDamage: overrides.projectileDamage ?? 1,
    detectionRadius: overrides.detectionRadius ?? 20,
    speed: overrides.speed ?? 2,
    attackSpeed: overrides.attackSpeed ?? 2.8,
    fireRate: overrides.fireRate ?? 0.68,
    projectileCount: 1,
    projectileSpeed: overrides.projectileSpeed ?? 15,
    preferHighest: overrides.preferHighest
  };
}

function createLavaConfig(id, position, overrides = {}) {
  return {
    id,
    type: 'lava',
    enemyKey: 'lavaBall',
    position,
    hp: overrides.hp ?? 130,
    damage: overrides.damage ?? 1,
    projectileDamage: overrides.projectileDamage ?? 1,
    detectionRadius: overrides.detectionRadius ?? 13,
    speed: overrides.speed ?? 2.12,
    attackSpeed: overrides.attackSpeed ?? 3.25,
    lavaBurstInterval: overrides.lavaBurstInterval ?? 1.95,
    projectileRadius: overrides.projectileRadius ?? 0.64,
    projectileLifetime: overrides.projectileLifetime ?? 12,
    preferHighest: overrides.preferHighest
  };
}

const LEVEL_FIVE_ENEMY_CONFIGS = [
  createSpikedConfig('p1-spiked-1', [-6.4, 0.08, -6.2]),
  createSpikedConfig('p1-spiked-2', [6.2, 0.08, 6.5]),
  createFireConfig('p2-fire-1', [29, 0.08, 5.2]),
  createSpikedConfig('p2-spiked-1', [35, 0.08, -5.8]),
  createSpikedConfig('p3-spiked-1', [23.5, 4.08, 27], { preferHighest: true }),
  createLavaConfig('p3-lava-1', [35.2, 4.08, 31.2], { preferHighest: true }),
  createFireConfig('p4-fire-1', [-5.8, 4.08, 26.5], { preferHighest: true }),
  createLavaConfig('p4-lava-1', [6.4, 4.08, 31.8], { preferHighest: true })
];

const LEVEL_SIX_ENEMY_CONFIGS = [
  createSpikedConfig('f1-p1-spiked-1', [-6.4, 0.08, -6.2], { hp: 115 }),
  createSpikedConfig('f1-p1-spiked-2', [6.2, 0.08, 6.5], { hp: 115 }),
  createFireConfig('f1-p2-fire-1', [29, 0.08, 5.2], { hp: 115 }),
  createSpikedConfig('f1-p2-spiked-1', [35, 0.08, -5.8], { hp: 115 }),
  createSpikedConfig('f2-p3-spiked-1', [23.5, 4.08, 27], { hp: 120, preferHighest: true }),
  createLavaConfig('f2-p3-lava-1', [35.2, 4.08, 31.2], { hp: 135, preferHighest: true }),
  createFireConfig('f2-p4-fire-1', [-5.8, 4.08, 26.5], { hp: 120, preferHighest: true }),
  createLavaConfig('f2-p4-lava-1', [6.4, 4.08, 31.8], { hp: 135, preferHighest: true }),
  createFireConfig('f3-p5-fire-1', [23.5, 8.08, 53], { hp: 125, preferHighest: true }),
  createSpikedConfig('f3-p5-spiked-1', [29, 8.08, 59.2], { hp: 125, preferHighest: true }),
  createLavaConfig('f3-p5-lava-1', [35.2, 8.08, 51.2], { hp: 145, preferHighest: true })
];

export const LEVEL_CONFIGS = [
  {
    number: 1,
    label: 'Level 1',
    enemyKey: 'spikedBall',
    enemyLabel: 'Spiked Ball',
    enemyPluralLabel: 'Spiked Balls',
    cutsceneText: [
      { text: 'Long time ago, everything was square… but  ' },
      { text: 'roundies', tone: 'yellow' },
      { text: ' came and proclaimed the world is a sphere. Eliminate all ' },
      { text: 'round objects', tone: 'yellow' },
      { text: '. Good luck, ' },
      { text: 'Square Dude', tone: 'pink' },
      { text: '.' }
    ],
    sceneKey: 'levelOne',
    portalPosition: [0.01, 2.57, 0.066],
    vibeJamPortalPosition: [0, 2.57, 36],
    soundtrack: roundCornersMusicUrl,
    enemies: LEVEL_ONE_SPIKED_POSITIONS.map((position, index) => ({
      id: `spiked-${index + 1}`,
      type: 'spiked',
      enemyKey: 'spikedBall',
      position,
      hp: 100,
      damage: 1,
      detectionRadius: 11,
      speed: 2.15,
      attackSpeed: 3.35
    })),
    availableUpgrades: ['maxHpPlusOne', 'magazinePlusOne']
  },
  {
    number: 2,
    label: 'Level 2',
    enemyKey: 'fireSun',
    enemyLabel: 'Fire Sun',
    enemyPluralLabel: 'Fire Suns',
    cutsceneText: [
      { text: 'The Square world relies on you ' },
      { text: 'Square Dude', tone: 'pink' },
      { text: '. We need this world square' }
    ],
    sceneKey: 'levelTwo',
    portalPosition: [30.392, 5.033, 0],
    vibeJamPortalPosition: [30.392, 5.033, 0],
    soundtrack: destroyMusicUrl,
    enemies: LEVEL_TWO_ENEMY_CONFIGS,
    availableUpgrades: ['pistolDamagePlus', 'fireRatePlus']
  },
  {
    number: 3,
    label: 'Level 3',
    enemyKey: 'lavaBall',
    enemyLabel: 'Lava Ball',
    enemyPluralLabel: 'Lava Balls',
    cutsceneText: [
      { text: 'You still believe the world is round? You have never heard of ' },
      { text: 'Artemis-2', tone: 'yellow' },
      { text: ' recently mission?' }
    ],
    sceneKey: 'levelThree',
    portalPosition: [0, 0.55, 0],
    vibeJamPortalPosition: [0, 0.55, 30.138],
    soundtrack: combatMusicUrl,
    enemies: LEVEL_THREE_ENEMY_CONFIGS,
    availableUpgrades: ['reloadSpeedPlus', 'jumpPlus']
  },
  {
    number: 4,
    label: 'Level 4',
    enemyKey: 'lavaBall',
    enemyLabel: 'Lava Ball',
    enemyPluralLabel: 'Mixed Roundies',
    cutsceneText: [
      { text: 'Look at them how they roll! In the name of squareness! It’s hip to be square!' }
    ],
    sceneKey: 'levelFour',
    portalPosition: [17.6, 10, 30],
    vibeJamPortalPosition: [17.6, 10, 30],
    soundtrack: speedMusicUrl,
    enemies: LEVEL_FOUR_ENEMY_CONFIGS,
    availableUpgrades: ['fireRatePlus', 'runBonusPlus']
  },
  {
    number: 5,
    label: 'Level 5',
    enemyKey: 'lavaBall',
    enemyLabel: 'Mixed Roundie',
    enemyPluralLabel: 'Mixed Roundies',
    cutsceneText: [
      { text: 'Do you know the area of a circle? Right! PI*R*SQUARED!', strong: true }
    ],
    sceneKey: 'levelFive',
    portalPosition: [0, 4.08, 27],
    vibeJamPortalPosition: [0, 4.08, 27],
    soundtrack: roundCornersMusicUrl,
    enemies: LEVEL_FIVE_ENEMY_CONFIGS,
    availableUpgrades: ['walkSpeedPlus', 'magazinePlusOne']
  },
  {
    number: 6,
    label: 'Level 6',
    enemyKey: 'lavaBall',
    enemyLabel: 'Mixed Roundie',
    enemyPluralLabel: 'Mixed Roundies',
    cutsceneText: [
      { text: 'The final is here, ' },
      { text: 'Square Dude', tone: 'pink' },
      { text: '.' }
    ],
    sceneKey: 'levelSix',
    portalPosition: [29, 8.08, 54],
    vibeJamPortalPosition: [29, 8.08, 54],
    soundtrack: roundCornersMusicUrl,
    enemies: LEVEL_SIX_ENEMY_CONFIGS,
    availableUpgrades: ['maxHpPlusOne', 'pistolDamagePlus']
  }
];

export const ENEMY_LEVELS = LEVEL_CONFIGS.slice(0, 6);
export const DEFAULT_LEVEL_INDEX = 0;
