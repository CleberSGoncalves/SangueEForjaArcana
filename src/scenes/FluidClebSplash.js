/**
 * src/scenes/FluidClebSplash.js - Splash Screen Procedural Obrigatória FluidCleb Interactive
 * Duração exata: 0.0s a 2.8s
 * Orbes cósmicos (#00f5ff, #38bdf8, #0284c7), fusão em 0.7s, emblema da gota d'água metálica,
 * tipografia em neon ciano 'FLUIDCLEB' (38px) e 'INTERACTIVE' (13px), e áudio procedural sintético.
 */

import { audio } from '../audio.js';

export class FluidClebSplash {
  constructor(onFinish) {
    this.onFinish = onFinish;
    this.canvas = null;
    this.ctx = null;
    this.container = null;
    this.startTime = null;
    this.finished = false;
    this.sound1Played = false;
    this.sound2Played = false;
    this.sound3Played = false;
    this.DURATION = 2800; // 2.8 segundos

    this.init();
  }

  init() {
    this.container = document.createElement('div');
    this.container.id = 'fluidcleb-splash-overlay';
    this.container.style.position = 'fixed';
    this.container.style.inset = '0';
    this.container.style.zIndex = '99999';
    this.container.style.backgroundColor = '#020617';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.justifyContent = 'center';
    this.container.style.alignItems = 'center';
    this.container.style.transition = 'opacity 0.4s ease-out';

    this.canvas = document.createElement('canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.display = 'block';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Barra de progresso inferior
    this.progressBar = document.createElement('div');
    this.progressBar.style.position = 'absolute';
    this.progressBar.style.bottom = '24px';
    this.progressBar.style.width = '240px';
    this.progressBar.style.height = '4px';
    this.progressBar.style.backgroundColor = 'rgba(255,255,255,0.1)';
    this.progressBar.style.borderRadius = '2px';
    this.progressBar.style.overflow = 'hidden';

    this.progressFill = document.createElement('div');
    this.progressFill.style.width = '0%';
    this.progressFill.style.height = '100%';
    this.progressFill.style.backgroundColor = '#00f5ff';
    this.progressFill.style.boxShadow = '0 0 10px #00f5ff';
    this.progressBar.appendChild(this.progressFill);
    this.container.appendChild(this.progressBar);

    // Label de inicialização
    this.statusLabel = document.createElement('div');
    this.statusLabel.style.position = 'absolute';
    this.statusLabel.style.bottom = '36px';
    this.statusLabel.style.fontSize = '11px';
    this.statusLabel.style.letterSpacing = '2px';
    this.statusLabel.style.color = '#64748b';
    this.statusLabel.style.fontFamily = 'monospace';
    this.statusLabel.textContent = 'CARREGANDO FORJA ARCANA...';
    this.container.appendChild(this.statusLabel);

    document.body.appendChild(this.container);

    window.addEventListener('resize', () => {
      if (this.canvas) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      }
    });

    requestAnimationFrame((t) => this.render(t));
  }

  render(timestamp) {
    if (this.finished) return;
    if (!this.startTime) this.startTime = timestamp;
    const elapsed = timestamp - this.startTime;
    const progress = Math.min(1.0, elapsed / this.DURATION);

    if (this.progressFill) {
      this.progressFill.style.width = `${Math.round(progress * 100)}%`;
    }

    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2 - 20;

    // Dispara sons sincronizados
    if (elapsed >= 100 && !this.sound1Played) {
      this.sound1Played = true;
      audio.playFluidClebIntro();
    }
    if (elapsed >= 700 && !this.sound2Played) {
      this.sound2Played = true;
      audio.playFluidFusion();
    }
    if (elapsed >= 2100 && !this.sound3Played) {
      this.sound3Played = true;
      audio.playFluidEject();
    }

    // Limpa fundo #020617
    this.ctx.fillStyle = '#020617';
    this.ctx.fillRect(0, 0, w, h);

    // Efeito 1: Orbes subindo de 0 a 700ms
    if (elapsed < 700) {
      const t = elapsed / 700;
      const ease = (x) => 1 - Math.pow(1 - x, 3);
      const curT = ease(t);

      const orbs = [
        { sx: cx - 120, sy: h + 40, r: 20, col: '#38bdf8' },
        { sx: cx,       sy: h + 60, r: 28, col: '#00f5ff' },
        { sx: cx + 120, sy: h + 40, r: 22, col: '#0284c7' }
      ];

      orbs.forEach((orb) => {
        const ox = orb.sx + (cx - orb.sx) * curT;
        const oy = orb.sy + (cy - orb.sy) * curT;
        const rad = orb.r * (1 - curT * 0.4);

        this.ctx.save();
        this.ctx.fillStyle = orb.col;
        this.ctx.shadowColor = orb.col;
        this.ctx.shadowBlur = 25;
        this.ctx.beginPath();
        this.ctx.arc(ox, oy, Math.max(2, rad), 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      });
    }

    // Efeito 2: Fusão central, Logo e Emblema Metálico (700ms em diante)
    if (elapsed >= 700) {
      this.ctx.save();
      let scale = 1.0;
      let logoY = cy;

      if (elapsed < 1100) {
        // Impacto e estabilização
        const tFuse = (elapsed - 700) / 400;
        scale = 0.5 + 0.5 * Math.sin(tFuse * Math.PI * 0.5);
      } else if (elapsed < 2100) {
        // Flutuação mística
        const tFloat = (elapsed - 1100) / 1000;
        logoY = cy + Math.sin(tFloat * Math.PI * 4) * 6;
      } else {
        // Ejeção e aceleração suave para transição
        const tEject = (elapsed - 2100) / 700;
        const expo = Math.pow(tEject, 2);
        logoY = cy - expo * 40;
      }

      this.ctx.translate(cx, logoY);
      this.ctx.scale(scale, scale);

      // Emblema da gota d'água metálica (#94a3b8 e #0284c7)
      this.ctx.save();
      this.ctx.translate(0, -50);
      const grad = this.ctx.createLinearGradient(-15, -25, 15, 25);
      grad.addColorStop(0, '#94a3b8');
      grad.addColorStop(0.5, '#38bdf8');
      grad.addColorStop(1, '#0284c7');

      this.ctx.fillStyle = grad;
      this.ctx.shadowColor = '#00f5ff';
      this.ctx.shadowBlur = 18;
      this.ctx.beginPath();
      this.ctx.moveTo(0, -22);
      this.ctx.bezierCurveTo(12, -7, 18, 6, 12, 16);
      this.ctx.bezierCurveTo(6, 24, -6, 24, -12, 16);
      this.ctx.bezierCurveTo(-18, 6, -12, -7, 0, -22);
      this.ctx.fill();
      this.ctx.restore();

      // Tipografia FLUIDCLEB (38px)
      this.ctx.textAlign = 'center';
      this.ctx.font = '900 38px "Arial Black", sans-serif';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowColor = '#00f5ff';
      this.ctx.shadowBlur = 22;
      this.ctx.fillText('FLUIDCLEB', 0, 18);

      // Subtítulo INTERACTIVE (13px)
      this.ctx.font = '700 13px sans-serif';
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.shadowBlur = 8;
      this.ctx.fillText('INTERACTIVE', 0, 42);

      this.ctx.restore();
    }

    if (elapsed >= this.DURATION) {
      this.finish();
      return;
    }

    requestAnimationFrame((t) => this.render(t));
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    this.container.style.opacity = '0';
    setTimeout(() => {
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
      if (this.onFinish) this.onFinish();
    }, 400);
  }
}
