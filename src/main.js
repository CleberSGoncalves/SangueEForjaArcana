/**
 * src/main.js - Inicializador Mestre do Jogo Sangue e Forja Arcana
 * Orquestra FluidCleb Splash, Lore Cinematic, Hub da Forja e Phaser 3 GameScene.
 */

import Phaser from 'phaser';
import { FluidClebSplash } from './scenes/FluidClebSplash.js';
import { LoreCinematic } from './scenes/LoreCinematic.js';
import { HubScene } from './scenes/HubScene.js';
import { GameScene } from './scenes/GameScene.js';
import { crazyGames } from './crazygames.js';
import { audio } from './audio.js';

let phaserGame = null;

async function bootstrap() {
  console.log('[Sangue e Forja Arcana] Inicializando...');

  // Inicializa o CrazyGames SDK v3
  await crazyGames.init();

  const appContainer = document.getElementById('app');

  // Inicializa áudio no primeiro clique/touch do usuário
  const userInteractionHandler = () => {
    audio.init();
    window.removeEventListener('pointerdown', userInteractionHandler);
    window.removeEventListener('keydown', userInteractionHandler);
  };
  window.addEventListener('pointerdown', userInteractionHandler);
  window.addEventListener('keydown', userInteractionHandler);

  // 1. Splash Screen Procedural Obrigatória FluidCleb Interactive (0.0s a 2.8s)
  new FluidClebSplash(() => {
    console.log('[FluidCleb Splash] Finalizado.');

    // 2. Apresentação em Animação Realista da Lore (a partir de 2.8s)
    new LoreCinematic(() => {
      console.log('[Lore Cinematic] Finalizado.');
      showHub();
    });
  });

  function showHub() {
    if (phaserGame) {
      phaserGame.destroy(true);
      phaserGame = null;
    }
    appContainer.innerHTML = '';
    audio.startGothicBgm('hub');

    new HubScene(appContainer, (battleConfig) => {
      startBattle(battleConfig);
    });
  }

  function startBattle(battleConfig) {
    appContainer.innerHTML = '';

    const config = {
      type: Phaser.AUTO,
      parent: 'app',
      width: window.innerWidth,
      height: window.innerHeight,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: [GameScene]
    };

    phaserGame = new Phaser.Game(config);
    phaserGame.scene.start('GameScene', battleConfig);
  }

  // Listener para retornar da batalha ao Hub
  window.addEventListener('return_to_hub', () => {
    showHub();
  });
}

window.addEventListener('DOMContentLoaded', bootstrap);
