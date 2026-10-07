/**
 * src/data/zones.js - Definição das Zonas de Caça, Ondas e Chefes Épicos
 */

export const ZONES = {
  catacombs: {
    id: 'catacombs',
    name: 'Catacumbas Esquecidas',
    subtitle: 'Nível 1 - Cripta Profanada',
    description: 'Antigas catacumbas onde as primeiras hordas demoníacas se ergueram alimentadas pelo sangue dos reis caídos.',
    ambientColor: 0x120a1c,
    gridColor: 0x2d1838,
    requiredLevel: 1,
    wavesCount: 5,
    enemies: [
      { id: 'blood_ghoul', name: 'Carniçal de Sangue', hp: 28, speed: 85, dmg: 10, color: 0x9b111e, radius: 12, xp: 5, blood: 2 },
      { id: 'bone_stalker', name: 'Esqueleto Blindado', hp: 55, speed: 65, dmg: 16, color: 0xd8d8d8, radius: 14, xp: 8, blood: 4 },
      { id: 'shadow_fiend', name: 'Assombração Noturna', hp: 40, speed: 110, dmg: 12, color: 0x6a0dad, radius: 11, xp: 7, blood: 3 }
    ],
    boss: {
      id: 'gorgoroth',
      name: 'Gorgoroth, o Carniceiro Abissal',
      title: 'Devorador da Primeira Forja',
      hp: 1400,
      speed: 60,
      damage: 35,
      color: 0x800020,
      radius: 36,
      xp: 150,
      bloodDrop: 120,
      attacks: ['shockwave', 'blood_charge', 'summon_minions'],
      dialogue: 'O sangue de vocês saciará a fome eterna dos abismos!'
    }
  },

  infernal_forge: {
    id: 'infernal_forge',
    name: 'A Forja Infernal',
    subtitle: 'Nível 2 - Bastidor de Magma',
    description: 'Antiga forja onde o fogo divino foi corrompido em enxofre e ódio eterno. O calor derrete a carne dos imprudentes.',
    ambientColor: 0x1c0905,
    gridColor: 0x3d170b,
    requiredLevel: 3,
    wavesCount: 6,
    enemies: [
      { id: 'magma_imp', name: 'Diabrete de Magma', hp: 45, speed: 120, dmg: 14, color: 0xff4500, radius: 11, xp: 9, blood: 4 },
      { id: 'hell_knight', name: 'Cavaleiro de Enxofre', hp: 90, speed: 70, dmg: 22, color: 0xb22222, radius: 16, xp: 14, blood: 6 },
      { id: 'flame_bat', name: 'Gárgula de Lava', hp: 60, speed: 135, dmg: 18, color: 0xffa500, radius: 12, xp: 11, blood: 5 }
    ],
    boss: {
      id: 'ignarix',
      name: 'Ignarix, o Titã das Cinzas',
      title: 'Lorde do Fogo Profano',
      hp: 2600,
      speed: 55,
      damage: 48,
      color: 0xdc143c,
      radius: 40,
      xp: 300,
      bloodDrop: 240,
      attacks: ['flame_ring', 'meteor_strike', 'magma_burst'],
      dialogue: 'Toda forja voltará ao pó e às cinzas perante minha chama!'
    }
  },

  crimson_abyss: {
    id: 'crimson_abyss',
    name: 'Abismo Carmesim',
    subtitle: 'Nível 3 - O Coração do Mal',
    description: 'O epicentro da calamidade, onde rios de sangue vivo correm alimentando a própria besta que ameaça toda a existência.',
    ambientColor: 0x17040d,
    gridColor: 0x3b0b23,
    requiredLevel: 5,
    wavesCount: 7,
    enemies: [
      { id: 'abyss_crawler', name: 'Rastejante do Sangue', hp: 75, speed: 105, dmg: 22, color: 0x8b0000, radius: 14, xp: 16, blood: 7 },
      { id: 'void_behemoth', name: 'Colosso do Vazio', hp: 170, speed: 55, dmg: 38, color: 0x480656, radius: 22, xp: 26, blood: 12 },
      { id: 'blood_witch', name: 'Feiticeira Carmesim', hp: 95, speed: 90, dmg: 28, color: 0xc71585, radius: 13, xp: 20, blood: 9 }
    ],
    boss: {
      id: 'malphas',
      name: 'Malphas, o Lorde da Corrupção',
      title: 'Imperador do Sangue Vazio',
      hp: 4200,
      speed: 70,
      damage: 60,
      color: 0x580018,
      radius: 44,
      xp: 600,
      bloodDrop: 500,
      attacks: ['void_beam', 'blood_whirlpool', 'shadow_nova'],
      dialogue: 'Vocês pensam que forjam armas? Estão apenas alimentando meu trono!'
    }
  },

  endless_challenge: {
    id: 'endless_challenge',
    name: 'Desafio Sem Fim da Forja',
    subtitle: 'Modo Infinito - Glória & Sangue',
    description: 'Sobreviva a ondas progressivas sem fim. A cada 3 ondas um chefe emerge com força multiplicada. Registre seu recorde no placar!',
    ambientColor: 0x0d0b14,
    gridColor: 0x221833,
    requiredLevel: 2,
    wavesCount: 999, // Infinito
    enemies: [
      { id: 'blood_ghoul', name: 'Carniçal de Sangue', hp: 35, speed: 90, dmg: 12, color: 0x9b111e, radius: 12, xp: 6, blood: 3 },
      { id: 'magma_imp', name: 'Diabrete de Magma', hp: 50, speed: 115, dmg: 15, color: 0xff4500, radius: 11, xp: 9, blood: 4 },
      { id: 'void_behemoth', name: 'Colosso do Vazio', hp: 140, speed: 60, dmg: 30, color: 0x480656, radius: 20, xp: 22, blood: 10 }
    ],
    boss: {
      id: 'endless_titan',
      name: 'Arauto do Fim',
      title: 'Titã Eterno',
      hp: 2000,
      speed: 65,
      damage: 40,
      color: 0xa00020,
      radius: 38,
      xp: 250,
      bloodDrop: 200,
      attacks: ['shockwave', 'flame_ring', 'void_beam']
    }
  }
};
