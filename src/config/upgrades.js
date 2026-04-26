export const UPGRADES = {
  maxHpPlusOne: {
    id: 'maxHpPlusOne',
    title: 'Extra Heart',
    description: 'Increase maximum health by 1 life.',
    type: 'player',
    stat: 'maxHP',
    value: 1,
    icon: null
  },
  walkSpeedPlus: {
    id: 'walkSpeedPlus',
    title: 'Quick Boots',
    description: 'Increase walking speed by 10%.',
    type: 'player',
    stat: 'maxWalkSpeed',
    value: 0.1,
    icon: null
  },
  runBonusPlus: {
    id: 'runBonusPlus',
    title: 'Sprint Surge',
    description: 'Increase sprint bonus by 10%.',
    type: 'player',
    stat: 'running',
    value: 0.1,
    icon: null
  },
  jumpPlus: {
    id: 'jumpPlus',
    title: 'Spring Step',
    description: 'Increase jump height by 10%.',
    type: 'player',
    stat: 'jump',
    value: 0.1,
    icon: null
  },
  pistolDamagePlus: {
    id: 'pistolDamagePlus',
    title: 'Hot Rounds',
    description: 'Increase pistol bullet damage by 20%.',
    type: 'weapon',
    stat: 'damage',
    value: 0.2,
    icon: null
  },
  magazinePlusOne: {
    id: 'magazinePlusOne',
    title: 'Bigger Cell',
    description: 'Increase pistol magazine size by 1 bullet.',
    type: 'weapon',
    stat: 'magazine',
    value: 1,
    icon: null
  },
  fireRatePlus: {
    id: 'fireRatePlus',
    title: 'Fast Trigger',
    description: 'Reduce time between pistol shots by 15%.',
    type: 'weapon',
    stat: 'fireRate',
    value: -0.15,
    icon: null
  },
  reloadSpeedPlus: {
    id: 'reloadSpeedPlus',
    title: 'Energy Feed',
    description: 'Regenerate pistol bullets 20% faster.',
    type: 'weapon',
    stat: 'reloadSpeed',
    value: 0.2,
    icon: null
  },
  shockwaveUnlock: {
    id: 'shockwaveUnlock',
    title: 'Shockwave',
    description: 'Unlock a green radial blast on E.',
    type: 'ability',
    stat: 'shockwave',
    value: 1,
    icon: null
  },
  shockwaveCooldownPlus: {
    id: 'shockwaveCooldownPlus',
    title: 'Static Core',
    description: 'Reduce shockwave cooldown by 20%.',
    type: 'ability',
    stat: 'shockwaveCooldown',
    value: -0.2,
    icon: null
  }
};

export const UPGRADE_LIST = Object.values(UPGRADES);
