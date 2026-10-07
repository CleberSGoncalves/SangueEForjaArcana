/**
 * src/engine/SaveManager.js - Persistência Completa de Dados no LocalStorage
 */

import { generateLootItem } from '../data/loot.js';

const STORAGE_KEY = 'sangue_forja_arcana_save_v1';

export class SaveManager {
  constructor() {
    this.data = this.load();
  }

  getDefaultData() {
    // Itens iniciais para começar com equipamentos funcionais
    const starterWeapon = generateLootItem('weapon', 'common', 1);
    starterWeapon.name = 'Espada da Forja Sagrada';
    starterWeapon.stats.damage = 18;

    const starterArmor = generateLootItem('armor', 'common', 1);
    starterArmor.name = 'Armadura de Ferro Temperado';
    starterArmor.stats.maxHp = 30;
    starterArmor.stats.armor = 10;

    return {
      selectedHero: 'ignis',
      unlockedHeroes: ['ignis'],
      heroLevels: { ignis: 1, valkyrie: 1, malakor: 1 },
      heroTalents: { ignis: {}, valkyrie: {}, malakor: {} },
      bloodCrystals: 150, // Moeda principal (Sangue Sagrado/Profano)
      arcaneMetal: 60,    // Material de forja
      inventory: [
        generateLootItem('ring', 'rare', 1),
        generateLootItem('amulet', 'rare', 1)
      ],
      equipped: {
        weapon: starterWeapon,
        armor: starterArmor,
        ring: null,
        amulet: null
      },
      runes: {
        ruby: 2,
        sapphire: 1,
        topaz: 1,
        emerald: 1,
        amethyst: 0
      },
      bestiaryKills: {},
      guild: 'forge_knights',
      guildRep: 75,
      achievements: ['first_blood'],
      hardcoreMode: false,
      highscores: {
        catacombs: 0,
        infernal_forge: 0,
        crimson_abyss: 0,
        endless: 0
      },
      stats: {
        totalKills: 0,
        totalBloodCollected: 0,
        runsPlayed: 0,
        bossesDefeated: 0,
        forgesCrafted: 0
      },
      settings: {
        sfx: true,
        bgm: true,
        screenShake: true
      }
    };
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...this.getDefaultData(), ...parsed };
      }
    } catch (e) {
      console.warn('Erro ao carregar save:', e);
    }
    const def = this.getDefaultData();
    this.save(def);
    return def;
  }

  save(data = null) {
    if (data) this.data = data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
    }
  }

  addBlood(amount) {
    this.data.bloodCrystals = (this.data.bloodCrystals || 0) + Math.round(amount);
    this.data.stats.totalBloodCollected = (this.data.stats.totalBloodCollected || 0) + Math.round(amount);
    this.save();
  }

  addMetal(amount) {
    this.data.arcaneMetal = (this.data.arcaneMetal || 0) + Math.round(amount);
    this.save();
  }

  equipItem(item) {
    if (!item || !item.slot) return;
    const old = this.data.equipped[item.slot];
    // Remove do inventário se lá estiver
    this.data.inventory = this.data.inventory.filter(i => i.uid !== item.uid);
    if (old) {
      this.data.inventory.push(old);
    }
    this.data.equipped[item.slot] = item;
    this.save();
  }

  unequipItem(slot) {
    const item = this.data.equipped[slot];
    if (item) {
      this.data.equipped[slot] = null;
      this.data.inventory.push(item);
      this.save();
    }
  }

  dismantleItem(uid) {
    const item = this.data.inventory.find(i => i.uid === uid);
    if (!item) return null;
    this.data.inventory = this.data.inventory.filter(i => i.uid !== uid);
    const metalYield = item.dismantleYield || 20;
    const bloodYield = Math.floor(metalYield * 0.5);
    this.data.arcaneMetal = (this.data.arcaneMetal || 0) + metalYield;
    this.data.bloodCrystals = (this.data.bloodCrystals || 0) + bloodYield;
    this.save();
    return { metal: metalYield, blood: bloodYield };
  }

  recordKill(mobId, isBoss = false) {
    this.data.bestiaryKills[mobId] = (this.data.bestiaryKills[mobId] || 0) + 1;
    this.data.stats.totalKills = (this.data.stats.totalKills || 0) + 1;
    if (isBoss) {
      this.data.stats.bossesDefeated = (this.data.stats.bossesDefeated || 0) + 1;
    }
    this.save();
  }

  recordScore(zoneId, wave) {
    if (wave > (this.data.highscores[zoneId] || 0)) {
      this.data.highscores[zoneId] = wave;
    }
    this.data.stats.runsPlayed = (this.data.stats.runsPlayed || 0) + 1;
    this.save();
  }
}

export const saveManager = new SaveManager();
