import { collisionWorldUrl, enemyTestWorldUrl } from './assets.js';

export const MENU_SCENE_TWO_KEY = 'menuSceneTwo';

export const WORLD_SCENES = {
  [MENU_SCENE_TWO_KEY]: {
    label: 'Menu Scene 2',
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
      lightName: 'MenuSceneTwoTopLight',
      targetName: 'MenuSceneTwoTopLightTarget',
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
