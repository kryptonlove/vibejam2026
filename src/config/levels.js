import {
  crystalBallLightningUrl,
  electricBallUrl,
  fireSunUrl,
  lavaBallUrl,
  magicBallUrl,
  roundCornersMusicUrl,
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

const COMMON_ARENA_POSITIONS = [
  [-4.8, 0, -4.2],
  [4.8, 0, -3.8],
  [0, 0, 5.2]
];

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
    detectionRadius: 13,
    speed: 1.8,
    attackSpeed: 2.5,
    fireRate: 1.45,
    projectileCount: 2,
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
    detectionRadius: 13,
    speed: 1.8,
    attackSpeed: 2.5,
    fireRate: 1.45,
    projectileCount: 2
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

function createEnemyConfigs(type, enemyKey, overrides = {}) {
  return COMMON_ARENA_POSITIONS.map((position, index) => ({
    id: `${type}-${index + 1}`,
    type,
    enemyKey,
    position,
    hp: overrides.hp ?? 100,
    damage: overrides.damage ?? 1,
    detectionRadius: overrides.detectionRadius ?? 10,
    speed: overrides.speed ?? 2.2,
    attackSpeed: overrides.attackSpeed ?? 3.2,
    projectileDamage: overrides.projectileDamage ?? 1,
    fireRate: overrides.fireRate ?? 1.6,
    lavaBurstInterval: overrides.lavaBurstInterval ?? 2.1
  }));
}

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
    soundtrack: roundCornersMusicUrl,
    enemies: LEVEL_TWO_ENEMY_CONFIGS,
    availableUpgrades: ['pistolDamagePlus', 'shockwaveUnlock']
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
    soundtrack: roundCornersMusicUrl,
    enemies: LEVEL_THREE_ENEMY_CONFIGS,
    availableUpgrades: ['reloadSpeedPlus', 'jumpPlus']
  },
  {
    number: 4,
    label: 'Level 4',
    enemyKey: 'magicBall',
    enemyLabel: 'Magic Ball',
    enemyPluralLabel: 'Magic Balls',
    cutsceneText: [
      { text: 'Look at them how they roll! In the name of squareness! It’s hip to be square!' }
    ],
    sceneKey: 'enemyTest',
    soundtrack: roundCornersMusicUrl,
    enemies: createEnemyConfigs('magic', 'magicBall', {
      hp: 130,
      damage: 1,
      detectionRadius: 11.5,
      speed: 2.25,
      attackSpeed: 3.35
    }),
    availableUpgrades: ['fireRatePlus', 'runBonusPlus']
  },
  {
    number: 5,
    label: 'Level 5',
    enemyKey: 'electricBall',
    enemyLabel: 'Electric Ball',
    enemyPluralLabel: 'Electric Balls',
    cutsceneText: [
      { text: 'Do you know the area of a circle? Right! PI*R*SQUARED!', strong: true }
    ],
    sceneKey: 'enemyTest',
    soundtrack: roundCornersMusicUrl,
    enemies: createEnemyConfigs('electric', 'electricBall', {
      hp: 150,
      damage: 1,
      detectionRadius: 12,
      speed: 2.35,
      attackSpeed: 3.55
    }),
    availableUpgrades: ['walkSpeedPlus', 'shockwaveCooldownPlus']
  },
  {
    number: 6,
    label: 'Level 6',
    enemyKey: 'crystalBallLightning',
    enemyLabel: 'Crystal Ball Lightning',
    enemyPluralLabel: 'Crystal Ball Lightning Orbs',
    cutsceneText: [
      { text: 'The final is here, ' },
      { text: 'Square Dude', tone: 'pink' },
      { text: '.' }
    ],
    sceneKey: 'enemyTest',
    soundtrack: roundCornersMusicUrl,
    enemies: createEnemyConfigs('crystal', 'crystalBallLightning', {
      hp: 170,
      damage: 1,
      detectionRadius: 12,
      speed: 2.45,
      attackSpeed: 3.65
    }),
    availableUpgrades: ['maxHpPlusOne', 'pistolDamagePlus']
  }
];

export const ENEMY_LEVELS = LEVEL_CONFIGS.slice(0, 3);
export const DEFAULT_LEVEL_INDEX = 0;
