/**
 * src/data/guilds.js - Sistema de Guildas / Clãs com Bênçãos Ativas e Progressão
 */

export const GUILDS = {
  forge_knights: {
    id: 'forge_knights',
    name: 'Cavaleiros da Forja Sagrada',
    banner: '🛡️⚔️',
    motto: 'No fogo forjamos nossa redenção, no aço sepultamos o abismo.',
    color: '#f59e0b',
    perkText: '+15 de Armadura base e +20% de Dano nas Forjas em Tempo Real.',
    bonuses: {
      armor: 15,
      inRunForgeDmg: 0.2
    },
    ranks: [
      { rank: 1, title: 'Iniciado da Forja', reqRep: 0 },
      { rank: 2, title: 'Escudeiro de Metal', reqRep: 300 },
      { rank: 3, title: 'Mestre da Bigorna Sagrada', reqRep: 900 }
    ]
  },

  crimson_covenant: {
    id: 'crimson_covenant',
    name: 'Aliança do Sangue Eterno',
    banner: '🩸🦇',
    motto: 'O sangue dos monstros não é imundície, é o elixir de nossa vitória.',
    color: '#ef4444',
    perkText: '+8% de Vampirismo global e +25% de Sangue Profano coletado de todos os inimigos.',
    bonuses: {
      vampirism: 0.08,
      bloodMultiplier: 0.25
    },
    ranks: [
      { rank: 1, title: 'Acólito Carmesim', reqRep: 0 },
      { rank: 2, title: 'Ceifador do Icor', reqRep: 300 },
      { rank: 3, title: 'Senhor da Lua Escarlate', reqRep: 900 }
    ]
  },

  rune_scholars: {
    id: 'rune_scholars',
    name: 'Ordem dos Arquimagos Rúnicos',
    banner: '🔮⚡',
    motto: 'Quem domina as runas primordiais reescreve as leis da própria batalha.',
    color: '#06b6d4',
    perkText: '+30% de Raio de Explosão em todas as habilidades e +15% de Redução de Recarga.',
    bonuses: {
      skillRadius: 0.3,
      cdr: 0.15
    },
    ranks: [
      { rank: 1, title: 'Estudante dos Selos', reqRep: 0 },
      { rank: 2, title: 'Invocador de Tempestades', reqRep: 300 },
      { rank: 3, title: 'Grão-Mestre do Éter', reqRep: 900 }
    ]
  }
};
