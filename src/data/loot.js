/**
 * src/data/loot.js - Sistema Completo de Loot, Equipamentos e Raridades ARPG
 */

export const RARITIES = {
  common: { name: 'Comum', color: '#e2e8f0', mult: 1.0, sockets: 0, dismantleYield: 15 },
  rare: { name: 'Raro', color: '#38bdf8', mult: 1.35, sockets: 1, dismantleYield: 40 },
  epic: { name: 'Épico', color: '#c084fc', mult: 1.8, sockets: 2, dismantleYield: 90 },
  legendary: { name: 'Lendário', color: '#fb923c', mult: 2.4, sockets: 2, dismantleYield: 220 },
  mythic: { name: 'Mítico', color: '#f43f5e', mult: 3.2, sockets: 3, dismantleYield: 500 }
};

export const BASE_ITEMS = {
  weapon: [
    { baseId: 'sword_forge', name: 'Espada da Forja', baseDamage: 14, icon: '⚔️', desc: 'Lâmina equilibrada temperada nas brasas eternas.' },
    { baseId: 'blood_scythe', name: 'Foice Carmesim', baseDamage: 18, icon: '🪓', desc: 'Arma pesada que ceifa grupos inteiros de demônios.' },
    { baseId: 'rune_staff', name: 'Cajado Rúnico', baseDamage: 16, icon: '🪄', desc: 'Canalizador mágico que amplifica o alcance de projeção.' },
    { baseId: 'hammer_titan', name: 'Martelo Titânico', baseDamage: 22, icon: '🔨', desc: 'Arma de impacto massivo com alta chance de golpe atordoante.' }
  ],
  armor: [
    { baseId: 'plate_sacred', name: 'Placa Sagrada', baseHp: 45, baseArmor: 14, icon: '🛡️', desc: 'Armadura pesada forjada com runas de proteção.' },
    { baseId: 'robe_arcane', name: 'Túnica do Éter', baseHp: 30, baseArmor: 6, icon: '🥋', desc: 'Manto leve que acelera a movimentação e esquiva.' },
    { baseId: 'blood_mail', name: 'Cota de Sangue', baseHp: 55, baseArmor: 10, icon: '🦺', desc: 'Armadura simbiótica que pulsa com cada gota coletada.' }
  ],
  ring: [
    { baseId: 'ring_crit', name: 'Anel da Fúria', baseCrit: 0.08, icon: '💍', desc: 'Aumenta consideravelmente a chance de acertos críticos.' },
    { baseId: 'ring_vamp', name: 'Selo Vampírico', baseVamp: 0.05, icon: '🩸', desc: 'Transmuta o sangue dos feridos em vigor físico.' },
    { baseId: 'ring_swift', name: 'Aliança do Vento', baseSpeed: 25, icon: '🌀', desc: 'Garante agilidade sobre-humana perante o perigo.' }
  ],
  amulet: [
    { baseId: 'amulet_forge', name: 'Amuleto da Bigorna', baseBloodBonus: 0.25, icon: '📿', desc: 'Atrai sangue a distâncias maiores e amplifica forjas.' },
    { baseId: 'amulet_arcane', name: 'Olho de Malphas', baseDamageBonus: 0.18, icon: '🧿', desc: 'Relíquia obscura que converte dor em dano arcano.' },
    { baseId: 'amulet_heart', name: 'Coração Carmesim', baseHp: 40, icon: '❤️', desc: 'Pulsar eterno que regenera vida com o tempo.' }
  ]
};

const PREFIXES = [
  { name: 'Sagrado', stat: 'damage', val: 6 },
  { name: 'Brutal', stat: 'critDamage', val: 0.35 },
  { name: 'Vorpal', stat: 'critChance', val: 0.07 },
  { name: 'Titânico', stat: 'maxHp', val: 35 },
  { name: 'Célere', stat: 'speed', val: 20 }
];

const SUFFIXES = [
  { name: 'do Ferreiro', stat: 'armor', val: 8 },
  { name: 'do Abismo', stat: 'damage', val: 8 },
  { name: 'da Sede Eterna', stat: 'bloodMultiplier', val: 0.2 },
  { name: 'do Éter', stat: 'pickupRadius', val: 35 }
];

export function generateLootItem(slot = null, forcedRarity = null, zoneLevel = 1) {
  const slots = ['weapon', 'armor', 'ring', 'amulet'];
  const chosenSlot = slot || slots[Math.floor(Math.random() * slots.length)];
  const basePool = BASE_ITEMS[chosenSlot];
  const base = basePool[Math.floor(Math.random() * basePool.length)];

  // Sorteio de Raridade
  let rarityKey = forcedRarity;
  if (!rarityKey) {
    const roll = Math.random();
    if (roll < 0.45) rarityKey = 'common';
    else if (roll < 0.75) rarityKey = 'rare';
    else if (roll < 0.90) rarityKey = 'epic';
    else if (roll < 0.98) rarityKey = 'legendary';
    else rarityKey = 'mythic';
  }

  const rarityInfo = RARITIES[rarityKey];
  const levelMult = 1 + (zoneLevel - 1) * 0.25;
  const mult = rarityInfo.mult * levelMult;

  // Afixos aleatórios para itens Raros ou superiores
  const prefix = (rarityKey !== 'common' && Math.random() < 0.7) ? PREFIXES[Math.floor(Math.random() * PREFIXES.length)] : null;
  const suffix = (rarityKey !== 'common' && Math.random() < 0.6) ? SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)] : null;

  let fullName = base.name;
  if (prefix) fullName = `${prefix.name} ${fullName}`;
  if (suffix) fullName = `${fullName} ${suffix.name}`;

  const item = {
    uid: 'loot_' + Math.random().toString(36).substr(2, 9),
    slot: chosenSlot,
    baseId: base.baseId,
    name: fullName,
    icon: base.icon,
    rarity: rarityKey,
    rarityName: rarityInfo.name,
    color: rarityInfo.color,
    desc: base.desc,
    stats: {},
    sockets: new Array(rarityInfo.sockets).fill(null),
    maxSockets: rarityInfo.sockets,
    dismantleYield: Math.floor(rarityInfo.dismantleYield * levelMult)
  };

  // Aplica estatísticas do base multiplicadas
  if (base.baseDamage) item.stats.damage = Math.round(base.baseDamage * mult);
  if (base.baseHp) item.stats.maxHp = Math.round(base.baseHp * mult);
  if (base.baseArmor) item.stats.armor = Math.round(base.baseArmor * mult);
  if (base.baseCrit) item.stats.critChance = Number((base.baseCrit * (1 + (mult - 1) * 0.3)).toFixed(2));
  if (base.baseVamp) item.stats.vampirism = Number((base.baseVamp * (1 + (mult - 1) * 0.3)).toFixed(2));
  if (base.baseSpeed) item.stats.speed = Math.round(base.baseSpeed * (1 + (mult - 1) * 0.2));
  if (base.baseBloodBonus) item.stats.bloodMultiplier = Number((base.baseBloodBonus * mult).toFixed(2));
  if (base.baseDamageBonus) item.stats.damageBonus = Number((base.baseDamageBonus * mult).toFixed(2));

  // Aplica afixos
  if (prefix) {
    item.stats[prefix.stat] = (item.stats[prefix.stat] || 0) + (typeof prefix.val === 'number' ? Math.round(prefix.val * levelMult) : prefix.val);
  }
  if (suffix) {
    item.stats[suffix.stat] = (item.stats[suffix.stat] || 0) + (typeof suffix.val === 'number' ? Math.round(suffix.val * levelMult) : suffix.val);
  }

  return item;
}
