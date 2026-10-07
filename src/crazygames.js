/**
 * src/crazygames.js - Integração Oficial CrazyGames SDK v3
 * Trata ciclo de vida do jogo, Rewarded Ads, Midgame Ads e fallback gracioso.
 */

export class CrazyGamesBridge {
  constructor() {
    this.sdk = null;
    this.initialized = false;
    this.adInProgress = false;
    this.lastMidgameTime = 0;
    this.MIDGAME_COOLDOWN = 180000; // 3 minutos entre midgame ads automáticos
  }

  async init() {
    if (this.initialized) return;

    if (typeof window !== 'undefined' && window.CrazyGames && window.CrazyGames.SDK) {
      try {
        this.sdk = window.CrazyGames.SDK;
        await this.sdk.init();
        this.initialized = true;
        console.log('[CrazyGames SDK v3] Inicializado com sucesso.');
      } catch (err) {
        console.warn('[CrazyGames SDK v3] Erro ao inicializar SDK:', err);
      }
    } else {
      console.log('[CrazyGames SDK v3] Ambiente local ou SDK ausente, modo simulado ativo.');
    }
  }

  gameplayStart() {
    console.log('[CrazyGames] Evento: gameplayStart');
    if (this.sdk && this.sdk.game) {
      try {
        this.sdk.game.gameplayStart();
      } catch (e) {
        console.warn('[CrazyGames] Erro ao invocar gameplayStart:', e);
      }
    }
  }

  gameplayStop() {
    console.log('[CrazyGames] Evento: gameplayStop');
    if (this.sdk && this.sdk.game) {
      try {
        this.sdk.game.gameplayStop();
      } catch (e) {
        console.warn('[CrazyGames] Erro ao invocar gameplayStop:', e);
      }
    }
  }

  /**
   * Rewarded Ad com callbacks robustos
   * @param {string} rewardType - 'revive' | 'double_rewards' | 'rare_forge'
   * @param {Function} onReward - Chamado quando o anúncio termina e recompensa é concedida
   * @param {Function} onError - Chamado se usuário fechar ou erro
   */
  async showRewardedAd(rewardType, onReward, onError) {
    if (this.adInProgress) return;
    this.adInProgress = true;
    this.gameplayStop();

    // Notifica áudio para mutar
    window.dispatchEvent(new CustomEvent('crazygames_ad_start'));

    if (this.sdk && this.sdk.ad) {
      try {
        await this.sdk.ad.requestAd('rewarded', {
          adStarted: () => {
            console.log(`[CrazyGames] Rewarded Ad (${rewardType}) iniciado.`);
          },
          adFinished: () => {
            console.log(`[CrazyGames] Rewarded Ad (${rewardType}) concluído. Recompensa concedida.`);
            this.adInProgress = false;
            window.dispatchEvent(new CustomEvent('crazygames_ad_end'));
            if (onReward) onReward();
          },
          adError: (err) => {
            console.warn(`[CrazyGames] Rewarded Ad (${rewardType}) erro:`, err);
            this.adInProgress = false;
            window.dispatchEvent(new CustomEvent('crazygames_ad_end'));
            // Em caso de erro de rede ou preenchimento de ad, concede fallback para não frustrar jogador
            if (onReward) onReward();
          }
        });
      } catch (e) {
        console.warn('[CrazyGames] Exceção ao chamar requestAd rewarded:', e);
        this.adInProgress = false;
        window.dispatchEvent(new CustomEvent('crazygames_ad_end'));
        if (onReward) onReward();
      }
    } else {
      // Simulação em ambiente de desenvolvimento / teste local
      console.log(`[CrazyGames Simulado] Concedendo recompensa rewarded: ${rewardType}`);
      setTimeout(() => {
        this.adInProgress = false;
        window.dispatchEvent(new CustomEvent('crazygames_ad_end'));
        if (onReward) onReward();
      }, 500);
    }
  }

  /**
   * Midgame Ad entre transições de zonas ou telas de vitória/derrota
   */
  async showMidgameAd(onFinished) {
    const now = Date.now();
    if (now - this.lastMidgameTime < this.MIDGAME_COOLDOWN) {
      if (onFinished) onFinished();
      return;
    }

    if (this.adInProgress) {
      if (onFinished) onFinished();
      return;
    }

    this.adInProgress = true;
    this.gameplayStop();
    window.dispatchEvent(new CustomEvent('crazygames_ad_start'));

    if (this.sdk && this.sdk.ad) {
      try {
        await this.sdk.ad.requestAd('midgame', {
          adStarted: () => console.log('[CrazyGames] Midgame Ad iniciado.'),
          adFinished: () => {
            this.lastMidgameTime = Date.now();
            this.adInProgress = false;
            window.dispatchEvent(new CustomEvent('crazygames_ad_end'));
            if (onFinished) onFinished();
          },
          adError: (err) => {
            console.warn('[CrazyGames] Midgame Ad erro:', err);
            this.lastMidgameTime = Date.now();
            this.adInProgress = false;
            window.dispatchEvent(new CustomEvent('crazygames_ad_end'));
            if (onFinished) onFinished();
          }
        });
      } catch (e) {
        this.adInProgress = false;
        window.dispatchEvent(new CustomEvent('crazygames_ad_end'));
        if (onFinished) onFinished();
      }
    } else {
      this.lastMidgameTime = Date.now();
      this.adInProgress = false;
      window.dispatchEvent(new CustomEvent('crazygames_ad_end'));
      if (onFinished) onFinished();
    }
  }
}

export const crazyGames = new CrazyGamesBridge();
