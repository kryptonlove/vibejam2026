import * as THREE from 'three';

export const ENEMY_PREVIEW_WIDTH = 188;
export const ENEMY_PREVIEW_HEIGHT = 128;
export const FIRE_SUN_BLOOM_STRENGTH = 1.15;
export const FIRE_SUN_BLOOM_RADIUS = 0.68;
export const FIRE_SUN_BLOOM_THRESHOLD = 0.58;
export const FIRE_SUN_FLOAT_HEIGHT = 0.22;
export const LAVA_BALL_BLOOM_STRENGTH = 0.98;
export const LAVA_BALL_BLOOM_RADIUS = 0.5;
export const LAVA_BALL_BLOOM_THRESHOLD = 0.48;
export const MAGIC_BALL_BLOOM_STRENGTH = 0.575;
export const MAGIC_BALL_BLOOM_RADIUS = 0.68;
export const MAGIC_BALL_BLOOM_THRESHOLD = 0.58;
export const ELECTRIC_BALL_BLOOM_STRENGTH = 0.41;
export const ELECTRIC_BALL_BLOOM_RADIUS = 0.56;
export const ELECTRIC_BALL_BLOOM_THRESHOLD = 0.54;
export const CRYSTAL_BALL_BLOOM_STRENGTH = 0.34;
export const CRYSTAL_BALL_BLOOM_RADIUS = 0.5;
export const CRYSTAL_BALL_BLOOM_THRESHOLD = 0.6;
export const MENU_PILLAR_TARGET_HEIGHT = 3.65;
export const MENU_FIRE_TARGET_HEIGHT = 0.6;
export const MENU_MUSIC_VOLUME = 0.42;
export const MENU_THUNDER_ONE_VOLUME = 0.78;
export const MENU_THUNDER_TWO_VOLUME = 0.82;
export const MENU_STORM_FLASH_DURATION = 0.52;
export const MENU_STORM_SEQUENCE_DURATION = 16;
export const MENU_GLOW_CUBE_COUNT = 18;
export const MENU_GLOW_CUBE_COLORS = [
  0xff6b6b,
  0xff9f68,
  0xffd166,
  0xb8ff6c,
  0x6cf0ff,
  0x6da8ff,
  0xc58cff,
  0xff7de1,
  0xffffff
];

export const GRAVITY = 30;
export const STEPS_PER_FRAME = 5;

export const PLAYER_RADIUS = 0.35;
export const PLAYER_CAPSULE_TOP = 1.55;
export const CHARACTER_TARGET_HEIGHT = 1.42;
export const GAMEPLAY_CAMERA_FOV = 70;
export const GAMEPLAY_CAMERA_NEAR = 0.1;
export const GAMEPLAY_CAMERA_FAR = 1000;
export const DEFAULT_GAMEPLAY_PITCH = -0.06;
export const CAMERA_OFFSET = new THREE.Vector3(0.56, 0.35, 3.45);
export const CAMERA_COLLISION_PADDING = 0.22;

export const WALK_ACCELERATION = 18;
export const SPRINT_ACCELERATION = 29;
export const JUMP_VELOCITY = 12.5;

export const MAX_HP = 100;
export const MAX_AMMO = 100;
export const AMMO_PER_SHOT = 6;
export const AMMO_RECHARGE_RATE = 18;
export const AMMO_RECHARGE_DELAY = 0.3;
export const SHOT_INTERVAL = 0.12;

export const BULLET_SPEED = 48;
export const BULLET_LIFETIME = 3;
export const BULLET_RADIUS = 0.09;
export const SPIKED_ENEMY_TARGET_DIAMETER = 1.45;
export const SPIKED_ENEMY_COUNT = 3;
export const SPIKED_ENEMY_MAX_HP = 5;
export const SPIKED_ENEMY_PATROL_RADIUS = 4.5;
export const SPIKED_ENEMY_PATROL_SPEED = 2.4;
export const SPIKED_ENEMY_CHASE_RADIUS = 12;
export const SPIKED_ENEMY_CHASE_SPEED = 3.35;
export const SPIKED_ENEMY_ACCELERATION = 7.5;
export const SPIKED_ENEMY_GRAVITY = 22;
export const SPIKED_ENEMY_CONTACT_DAMAGE = 20;
export const SPIKED_ENEMY_CONTACT_PUSH = 9.5;
export const SPIKED_ENEMY_BOUNCE_SPEED = 6.25;
export const SPIKED_ENEMY_HIT_COOLDOWN = 0.9;
export const SPIKED_ENEMY_MIN_SPAWN_DISTANCE = 8;
export const EXPLOSION_DURATION = 0.65;
export const EXPLOSION_PARTICLE_COUNT = 18;

export const DOWN = new THREE.Vector3(0, -1, 0);
export const UP = new THREE.Vector3(0, 1, 0);
export const BULLET_FORWARD = new THREE.Vector3(0, 0, 1);
export const EXAMPLE_SKY = 0x05070c;
export const GLOW_CUBE_COUNT = 10;
export const GLOW_CUBE_COLORS = [0xffd166, 0xff9f68, 0x7ad7ff, 0xcba6ff, 0x8affb6];
