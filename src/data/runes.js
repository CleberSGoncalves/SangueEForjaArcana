/**
 * src/data/runes.js - Sistema de Runas e Gemas Arcanas para Encastoar em Itens
 */

export const RUNES = {
  ruby: {
    id: 'ruby',
    name: 'Rubi da Forja Carmesim',
    color: '#ff2d55',
    icon: '💎',
    desc: 'Encravado nas forjas profundas, imbuído em calor constante.',
    bonusText: '+15 Dano e 10% Chance de Incinerar inimigos',
    stats: { damage: 15, burnChance: 0.1 }
  },
  sapphire: {
    id: 'sapphire',
    name: 'Safira Glacial do Vazio',
    color: '#007aff',
    icon: '🔷',
    desc: 'Cristal que desacelera o próprio fluxo do tempo ao redor.',
    bonusText: '+12% Redução de Recarga e 15% Chance de Congelar',
    stats: { cdr: 0.12, freezeChance: 0.15 }
  },
  topaz: {
    id: 'topaz',
    name: 'Topázio Tempestuoso',
    color: '#ffcc00',
    icon: '⚡',
    desc: 'Acumula eletricidade estática das tempestades etéreas.',
    bonusText: '+20% Velocidade de Ataque e Faíscas Elétricas',
    stats: { attackSpeed: 0.2, sparkChance: 0.25 }
  },
  emerald: {
    id: 'emerald',
    name: 'Esmeralda da Vida Maldita',
    color: '#34c759',
    icon: '🟢',
    desc: 'Absorve o fluido vital dos caídos, regenerando o portador.',
    bonusText: '+8% Vampirismo e +3 HP por segundo',
    stats: { vampirism: 0.08, hpRegen: 3 }
  },
  amethyst: {
    id: 'amethyst',
    name: 'Ametista Abissal dos Ecos',
    color: '#af52de',
    icon: '🟣',
    desc: 'Ressoa com a assinatura mística das almas aprisionadas.',
    bonusText: '+40% Dano Crítico e +25% Sangue Coletado',
    stats: { critDamage: 0.4, bloodMultiplier: 0.25 }
  }
};
