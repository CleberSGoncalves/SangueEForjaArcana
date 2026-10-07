/**
 * src/data/events.js - Eventos Sazonais e Desafios Temporários da Forja
 */

export const SEASONAL_EVENTS = [
  {
    id: 'crimson_eclipse',
    title: 'Eclipse Carmesim',
    badge: '🌙🩸 ATIVO',
    desc: 'A lua escarlate tinge o céu. Todos os inimigos soltam +50% de Sangue Profano e a chance de itens Lendários é dobrada.',
    bonusBloodMultiplier: 0.5,
    lootBonusChance: 0.2,
    endsInDays: 6
  },
  {
    id: 'ancient_forge_awakening',
    title: 'O Despertar da Forja Antiga',
    badge: '🔥 ANUNCIADO',
    desc: 'O fogo sagrado atinge calor máximo. Custos de forja em tempo real reduzidos em 30% e bigornas espectrais caem a cada 40 segundos.',
    forgeDiscount: 0.3,
    endsInDays: 14
  }
];
