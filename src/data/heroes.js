/**
 * src/data/heroes.js - Definições dos Heróis Desbloqueáveis e Árvores de Talentos
 */

export const HEROES = {
  ignis: {
    id: 'ignis',
    name: 'Ignis, o Ferreiro Arcano',
    title: 'Guardião da Bigorna Rubra',
    description: 'Mestre na manipulação do metal primordial e fogo cósmico. Resiliente e devastador a curto alcance.',
    color: '#ff4500',
    secondaryColor: '#ffd700',
    unlocked: true,
    cost: 0,
    baseStats: {
      maxHp: 120,
      speed: 210,
      damage: 26,
      armor: 15,
      critChance: 0.12,
      critDamage: 1.6,
      pickupRadius: 130,
      bloodMultiplier: 1.2
    },
    passive: {
      name: 'Forja Térmica',
      description: '+20% de Dano de Fogo e +15% de Sangue Profano ao derrotar inimigos em chamas.'
    },
    activeSkill: {
      id: 'astral_anvil',
      name: 'Bigorna Astral',
      cooldown: 8.0,
      damage: 90,
      radius: 120,
      description: 'Esmaga o solo com uma bigorna arcana colossal, atordoando e causando dano maciço em área.'
    },
    ultimateSkill: {
      id: 'chaos_forge',
      name: 'Forja do Caos',
      cooldown: 25.0,
      duration: 6.0,
      description: 'Entra em estado de sobrecarga, liberando pulsações de magma que incineram todos os inimigos próximos.'
    },
    talents: [
      {
        tier: 1,
        title: 'Tier 1: Fundição Básica',
        options: [
          { id: 'ignis_t1_a', name: 'Martelo Pesado', desc: '+25% Dano da Bigorna Astral', stat: { skillDmg: 0.25 } },
          { id: 'ignis_t1_b', name: 'Armadura Forjada', desc: '+12 de Armadura base', stat: { armor: 12 } }
        ]
      },
      {
        tier: 2,
        title: 'Tier 2: Têmpera Sanguínea',
        options: [
          { id: 'ignis_t2_a', name: 'Sangue Metálico', desc: '+30% Raio de Coleta de Sangue', stat: { pickupRadius: 40 } },
          { id: 'ignis_t2_b', name: 'Faíscas da Forja', desc: 'Ataques criam fagulhas que ricocheteiam', stat: { chainSparks: true } }
        ]
      },
      {
        tier: 3,
        title: 'Tier 3: Maestria Titânica',
        options: [
          { id: 'ignis_t3_a', name: 'Cataclismo Ígneo', desc: 'Dobra o raio de explosão da Forja do Caos', stat: { ultRadius: 1.5 } },
          { id: 'ignis_t3_b', name: 'Imortalidade da Forja', desc: 'Ganha 3s de invulnerabilidade ao chegar a 15% de vida (1x por onda)', stat: { cheatDeath: true } }
        ]
      }
    ]
  },

  valkyrie: {
    id: 'valkyrie',
    name: 'Valquíria Carmesim',
    title: 'Colhedora de Almas',
    description: 'Guerreira veloz que drena a vitalidade dos demônios caídos em um balé sangrento de lâminas.',
    color: '#e60049',
    secondaryColor: '#ff758c',
    unlocked: false,
    cost: 500, // Custa Sangue Arcana
    baseStats: {
      maxHp: 95,
      speed: 250,
      damage: 22,
      armor: 8,
      critChance: 0.22,
      critDamage: 1.85,
      pickupRadius: 140,
      bloodMultiplier: 1.35
    },
    passive: {
      name: 'Vampirismo Ancestral',
      description: '14% do dano de ataques críticos é drenado diretamente como cura instantânea de vida.'
    },
    activeSkill: {
      id: 'blade_dance',
      name: 'Dança das Lâminas',
      cooldown: 6.0,
      damage: 75,
      radius: 110,
      description: 'Executa um rodopio cortante disparando 8 lâminas espectrais em espiral 360°.'
    },
    ultimateSkill: {
      id: 'blood_vortex',
      name: 'Vórtice Sanguíneo',
      cooldown: 22.0,
      duration: 5.0,
      description: 'Cria uma fenda gravitacional de sangue puro que puxa todos os monstros da arena e drena suas forças.'
    },
    talents: [
      {
        tier: 1,
        title: 'Tier 1: Agilidade Furtiva',
        options: [
          { id: 'valk_t1_a', name: 'Corte Veloz', desc: '+15% Velocidade de Movimento', stat: { speed: 35 } },
          { id: 'valk_t1_b', name: 'Gume Sedento', desc: '+8% Chance de Ataque Crítico', stat: { critChance: 0.08 } }
        ]
      },
      {
        tier: 2,
        title: 'Tier 2: Festim Escarlate',
        options: [
          { id: 'valk_t2_a', name: 'Lâminas Gêmeas', desc: 'Dança das Lâminas dispara 4 projéteis adicionais', stat: { bladeCount: 4 } },
          { id: 'valk_t2_b', name: 'Escudo Hemático', desc: 'Ao coletar 50 orbes de sangue, gera escudo temporário de 30 HP', stat: { bloodShield: true } }
        ]
      },
      {
        tier: 3,
        title: 'Tier 3: Ascensão da Ceifadora',
        options: [
          { id: 'valk_t3_a', name: 'Frenesi Vorpal', desc: 'Críticos reduzem recarga das habilidades ativas em 0.5s', stat: { cdReductionCrit: 0.5 } },
          { id: 'valk_t3_b', name: 'Tempestade Sangrenta', desc: 'Inimigos mortos durante o Vórtice explodem em sangue puro', stat: { bloodExplosion: true } }
        ]
      }
    ]
  },

  malakor: {
    id: 'malakor',
    name: 'Malakor, o Arquimago Rúnico',
    title: 'Mestre dos Selos Antigos',
    description: 'Erudito arcano capaz de projetar anéis glaciais, raios arcanos e desintegrar ondas inteiras à distância.',
    color: '#00f5ff',
    secondaryColor: '#7928ca',
    unlocked: false,
    cost: 1200,
    baseStats: {
      maxHp: 80,
      speed: 195,
      damage: 32,
      armor: 5,
      critChance: 0.15,
      critDamage: 1.7,
      pickupRadius: 150,
      bloodMultiplier: 1.15
    },
    passive: {
      name: 'Ressonância Rúnica',
      description: '+30% de Raio de Efeito em todas as magias e ataques, além de regenerar 2 HP por segundo.'
    },
    activeSkill: {
      id: 'frost_nova',
      name: 'Nova Glacial Rúnica',
      cooldown: 7.0,
      damage: 85,
      radius: 140,
      description: 'Expande uma onda congelante que paralisa os inimigos atingidos por 2.5 segundos.'
    },
    ultimateSkill: {
      id: 'arcane_cataclysm',
      name: 'Cataclismo Cósmico',
      cooldown: 28.0,
      duration: 6.0,
      description: 'Invoca uma tempestade de meteoros arcanos teleguiados que aniquilam as maiores ameaças na tela.'
    },
    talents: [
      {
        tier: 1,
        title: 'Tier 1: Inscrições Primárias',
        options: [
          { id: 'mal_t1_a', name: 'Glifo de Ampliação', desc: '+25% de Dano Mágico Global', stat: { damage: 8 } },
          { id: 'mal_t1_b', name: 'Eco Gélido', desc: 'Nova Glacial deixa o chão congelado por 4s', stat: { frostGround: true } }
        ]
      },
      {
        tier: 2,
        title: 'Tier 2: Transmutação Espectral',
        options: [
          { id: 'mal_t2_a', name: 'Barreira de Éter', desc: 'Absorve 20% do próximo dano sofrido', stat: { etherBarrier: 0.2 } },
          { id: 'mal_t2_b', name: 'Raio Conector', desc: 'Projéteis arcanos encadeiam em até 3 alvos secundários', stat: { chainLightning: 3 } }
        ]
      },
      {
        tier: 3,
        title: 'Tier 3: Singularidade Arcana',
        options: [
          { id: 'mal_t3_a', name: 'Meteoro do Apocalipse', desc: 'O último meteoro do Cataclismo causa dano triplicado', stat: { nukeFinisher: true } },
          { id: 'mal_t3_b', name: 'Tempo Rúnico', desc: 'Reduz o tempo de recarga de todas as habilidades em 25%', stat: { cdr: 0.25 } }
        ]
      }
    ]
  }
};
