/**
 * src/engine/InRunForge.js - Mecânica de Forja em Tempo Real (In-Run Blood Forge)
 * Permite temperar armas e forjar relíquias temporárias durante a corrida usando o sangue coletado.
 */

import { audio } from '../audio.js';

export const FORGE_RECIPES = [
  {
    id: 'temper_blade',
    name: 'Têmpera da Lâmina Escarlate',
    icon: '⚔️🔥',
    cost: 40,
    desc: '+15% de Dano Base e projéteis deixam rastros flamejantes.',
    apply: (hero) => {
      hero.damageMult = (hero.damageMult || 1) + 0.15;
      hero.hasFireTrails = true;
    }
  },
  {
    id: 'hematic_barrier',
    name: 'Barreira Hemática',
    icon: '🩸🛡️',
    cost: 50,
    desc: '+30 de Vida Máxima e recupera 40 HP imediatamente.',
    apply: (hero) => {
      hero.maxHp += 30;
      hero.hp = Math.min(hero.maxHp, hero.hp + 40);
    }
  },
  {
    id: 'twin_projectiles',
    name: 'Gêmeos de Sangue',
    icon: '✨🪓',
    cost: 65,
    desc: '+1 Projétil / Lâmina adicional disparado a cada ataque.',
    apply: (hero) => {
      hero.extraProjectiles = (hero.extraProjectiles || 0) + 1;
    }
  },
  {
    id: 'blood_vacuum',
    name: 'Ímã de Sangue Profano',
    icon: '🧲🩸',
    cost: 35,
    desc: '+60 de Raio de Atração para absorver sangue e itens distantes.',
    apply: (hero) => {
      hero.pickupRadius += 60;
    }
  },
  {
    id: 'boiling_rage',
    name: 'Fervor Carmesim',
    icon: '⚡🩸',
    cost: 55,
    desc: '+15% Velocidade de Movimento e +6% de Vampirismo.',
    apply: (hero) => {
      hero.speedMult = (hero.speedMult || 1) + 0.15;
      hero.vampirism = (hero.vampirism || 0) + 0.06;
    }
  },
  {
    id: 'celestial_lightning',
    name: 'Descarga da Bigorna Etérea',
    icon: '⚡🔨',
    cost: 70,
    desc: 'Golpes possuem 30% de chance de conjurar um relâmpago arcano no alvo.',
    apply: (hero) => {
      hero.hasLightningProc = true;
    }
  }
];

export class InRunForgeManager {
  constructor(scene) {
    this.scene = scene;
    this.forgeCount = 0;
  }

  getRandomRecipes(count = 3) {
    const shuffled = [...FORGE_RECIPES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  craft(recipe, currentBlood, hero) {
    if (currentBlood < recipe.cost) return false;
    audio.playForgeHammer();
    recipe.apply(hero);
    this.forgeCount++;
    return true;
  }
}
