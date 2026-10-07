/**
 * src/data/bestiary.js - Bestiário & Lore Completa dos Inimigos e Chefes
 */

export const BESTIARY = {
  blood_ghoul: {
    id: 'blood_ghoul',
    name: 'Carniçal de Sangue',
    category: 'Maldito',
    icon: '🩸',
    lore: 'Criaturas necróticas reanimadas quando o primeiro sangue profano vazou da forja sagrada. Movem-se em grupos vorazes buscando carne viva.',
    weakness: 'Fogo Arcano & Bigornas Pesadas',
    drops: 'Sangue Profano, Fragmentos de Osso',
    hp: 28,
    speed: 85,
    threat: 'Baixa'
  },
  bone_stalker: {
    id: 'bone_stalker',
    name: 'Esqueleto Blindado',
    category: 'Espectral',
    icon: '💀',
    lore: 'Sentinelas do antigo império, suas armaduras foram fundidas aos próprios ossos por fogo herético.',
    weakness: 'Esmagamento & Lâminas Críticas',
    drops: 'Metal Arcano, Sangue Profano',
    hp: 55,
    speed: 65,
    threat: 'Média'
  },
  shadow_fiend: {
    id: 'shadow_fiend',
    name: 'Assombração Noturna',
    category: 'Etéreo',
    icon: '👻',
    lore: 'Manifestações de pura angústia que viajam nas sombras dos túmulos. Avançam em alta velocidade quando pressentem fraqueza.',
    weakness: 'Explosões de Luz Rúnica',
    drops: 'Essência Noturna, Gemas Raras',
    hp: 40,
    speed: 110,
    threat: 'Média'
  },
  magma_imp: {
    id: 'magma_imp',
    category: 'Demônio',
    icon: '🔥',
    lore: 'Nascidos no calor escaldante da Forja Infernal. Seu corpo é rocha em fusão capaz de explodir ao morrer.',
    weakness: 'Gelo Rúnico',
    drops: 'Brasas Vivas, Sangue Profano',
    hp: 45,
    speed: 120,
    threat: 'Média'
  },
  hell_knight: {
    id: 'hell_knight',
    name: 'Cavaleiro de Enxofre',
    category: 'Demônio',
    icon: '⚔️',
    lore: 'Comandantes da legião do fogo, portam espadas pesadas embebidas em óleo infernal. Resistência brutal a dano frontal.',
    weakness: 'Ataques em Área pelas Costas',
    drops: 'Lingote de Enxofre, Armaduras Raras',
    hp: 90,
    speed: 70,
    threat: 'Alta'
  },
  flame_bat: {
    id: 'flame_bat',
    name: 'Gárgula de Lava',
    category: 'Alado',
    icon: '🦇',
    lore: 'Alados incrustados de obsidiana quente que sobrevoam em mergulhos rasantes devastadores.',
    weakness: 'Projéteis Teleguiados do Corvo Pet',
    drops: 'Asas de Cinza, Sangue Concentrado',
    hp: 60,
    speed: 135,
    threat: 'Alta'
  },
  abyss_crawler: {
    id: 'abyss_crawler',
    name: 'Rastejante do Sangue',
    category: 'Abominação',
    icon: '🕷️',
    lore: 'Aberração com múltiplas patas feita inteiramente de tentáculos e sangue coagulado do Abismo Carmesim.',
    weakness: 'Cataclismo e Congelamento',
    drops: 'Icor Corrompido, Anéis Raros',
    hp: 75,
    speed: 105,
    threat: 'Alta'
  },
  void_behemoth: {
    id: 'void_behemoth',
    name: 'Colosso do Vazio',
    category: 'Titã',
    icon: '🗿',
    lore: 'Muralhas vivas de pedra negra que servem como guardas pretorianos do Lorde Malphas. Dano devastador a curta distância.',
    weakness: 'Vampirismo Rápido & Críticos Sequenciais',
    drops: 'Coração do Vazio, Itens Épicos',
    hp: 170,
    speed: 55,
    threat: 'Muito Alta'
  },
  blood_witch: {
    id: 'blood_witch',
    name: 'Feiticeira Carmesim',
    category: 'Cultista',
    icon: '🧙‍♀️',
    lore: 'Antigas sacerdotisas da forja que venderam suas almas para dominar a alquimia proibida do sangue.',
    weakness: 'Silenciamento e Ataque Rápido',
    drops: 'Runas Antigas, Amuletos Místicos',
    hp: 95,
    speed: 90,
    threat: 'Alta'
  },
  gorgoroth: {
    id: 'gorgoroth',
    name: 'Gorgoroth, o Carniceiro Abissal',
    category: 'CHEFE ÉPICO',
    icon: '👹',
    lore: 'O primeiro dos generais demoníacos a romper as muralhas da Forja Sagrada. Empunha um cutelo colossal que despedaça rocha e aço com a mesma facilidade.',
    weakness: 'Mobilidade constante para desviar das ondas de choque',
    drops: 'Núcleo de Gorgoroth, Arma Lendária Garantida',
    hp: 1400,
    speed: 60,
    threat: 'EXTREMA'
  },
  ignarix: {
    id: 'ignarix',
    name: 'Ignarix, o Titã das Cinzas',
    category: 'CHEFE ÉPICO',
    icon: '🌋',
    lore: 'Forjado no coração de um vulcão corrompido, Ignarix incinera a própria atmosfera com ondas de magma em 360° e chuvas de meteoros infernais.',
    weakness: 'Habilidades de Congelamento e Esquivas no Momento do Golpe',
    drops: 'Chama Eterna de Ignarix, Armadura Lendária',
    hp: 2600,
    speed: 55,
    threat: 'EXTREMA'
  },
  malphas: {
    id: 'malphas',
    name: 'Malphas, o Lorde da Corrupção',
    category: 'CHEFE SUPREMO',
    icon: '👑',
    lore: 'A própria mente por trás do cerco à Forja Sagrada. Capaz de conjurar feixes de energia do vazio e criar vórtices que puxam a realidade para dentro de si.',
    weakness: 'Destruir seus pontos focais e manter sinergia máxima de runas',
    drops: 'Selo do Imperador Caído, Itens Míticos',
    hp: 4200,
    speed: 70,
    threat: 'CATACLÍSMICA'
  }
};
