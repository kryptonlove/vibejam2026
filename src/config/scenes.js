import {
  collisionWorldUrl,
  enemyTestWorldUrl,
  levelFourWorldUrl,
  levelOneWorldUrl,
  levelThreeWorldUrl,
  levelTwoWorldUrl
} from './assets.js';

export const INTRO_SCENE_KEY = 'introScene';

export const WORLD_SCENES = {
  [INTRO_SCENE_KEY]: {
    label: 'Intro Scene',
    meta: 'Blender-authored ruins entry view rebuilt from modular GLB assets',
    playable: false,
    useGlowCubes: false,
    menuExperience: 'storm',
    menuGlowCubeCount: 2,
    spawnNodeName: 'PlayerSpawn',
    preserveSpawnPosition: true,
    fixedView: {
      cameraName: 'BlenderSceneCamera',
      defaultCameraOverride: {
        position: [-21, -3.7, -7.9],
        rotationDegrees: [178, -63.57, -180]
      }
    },
    lightControls: {
      lightName: 'IntroSceneTopLight',
      targetName: 'IntroSceneTopLightTarget',
      defaultValues: {
        position: [-2.1, -0.1, 5.5],
        target: [-0.8, 1.7, 3.9],
        intensity: 1.7
      }
    },
    playerControls: {
      defaultValues: {
        position: [-1.5, -6.4, -1.3],
        rotationDegrees: 78,
        scale: 1.85
      }
    }
  },
  enemyTest: {
    label: 'Enemy Test',
    url: enemyTestWorldUrl,
    meta: 'Lightweight flat arena for enemy testing',
    useGlowCubes: false,
    spawnNodeName: 'PlayerSpawn'
  },
  levelOne: {
    label: 'Level 1',
    url: levelOneWorldUrl,
    meta: 'Draco-compressed platform arena for the first spiked-ball fight',
    useGlowCubes: true,
    glowCubeCount: 4,
    spawnPosition: [0.018, 2.57, 0]
  },
  levelTwo: {
    label: 'Level 2',
    url: levelTwoWorldUrl,
    meta: 'Draco-compressed platform arena for the mixed fire and spiked-ball fight',
    useGlowCubes: true,
    glowCubeCount: 4,
    spawnPosition: [-0.194, 0.761, -19.114],
    spawnLookAt: [0, 0.761, 0]
  },
  levelThree: {
    label: 'Level 3',
    url: levelThreeWorldUrl,
    meta: 'Draco-compressed multi-platform arena for spiked, fire, and lava enemies',
    useGlowCubes: true,
    glowCubeCount: 4,
    spawnPosition: [0, 0.55, 0]
  },
  levelFour: {
    label: 'Level 4',
    url: levelFourWorldUrl,
    meta: 'Draco-compressed multi-floor arena for the final lava fight',
    useGlowCubes: true,
    glowCubeCount: 5,
    spawnPosition: [-0.194, 0.761, -19.114],
    spawnLookAt: [0, 0.761, 0]
  },
  demo: {
    label: 'Demo',
    url: collisionWorldUrl,
    meta: 'Current FPS example arena',
    useGlowCubes: true
  }
};

export const PLAYABLE_WORLD_SCENE_ENTRIES = Object.entries(WORLD_SCENES).filter(
  ([, sceneConfig]) => sceneConfig.playable !== false
);
export const PLAYABLE_WORLD_SCENES = Object.fromEntries(PLAYABLE_WORLD_SCENE_ENTRIES);

export const DEFAULT_CAMPAIGN_SCENE_KEY = 'enemyTest';
export const DEFAULT_SCENE_KEY = DEFAULT_CAMPAIGN_SCENE_KEY;
export const DEFAULT_START_SCREEN_TAB = 'campaign';
