/**
 * src/scenes/LoreCinematic.js - Apresentação em Animação Realista da Lore (3 Atos)
 * Canvas de partículas atmosféricas, iluminação dinâmica e narrativa imersiva.
 * Botões 'Pular História' e 'Continuar ➔'.
 */

import { audio } from '../audio.js';

export class LoreCinematic {
  constructor(onFinish) {
    this.onFinish = onFinish;
    this.currentAct = 0;
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.running = true;

    this.acts = [
      {
        act: 'ATO I: AS PROFUNDEZAS SE ABREM',
        title: 'A Queda do Velho Mundo',
        text: 'Numa era de escuridão e desespero, legiões demoníacas emergiram das entranhas da terra. As muralhas ruíram e o fogo profano consumiu os reinos dos homens, deixando apenas cinzas e lamentos.',
        color: '#ff2a55'
      },
      {
        act: 'ATO II: O SANGUE E A BIGORNA',
        title: 'O Mistério da Forja Sagrada',
        text: 'No coração do último bastião, uma forja arcana resistiu. O Ferreiro Amaldiçoado descobriu que o próprio sangue dos monstros pode ser moldado em armas lendárias, transmutando a morte em poder inextinguível.',
        color: '#ff8c00'
      },
      {
        act: 'ATO III: O CHAMADO DA BATALHA',
        title: 'A Defesa Eterna da Humanidade',
        text: 'Heróis lendários foram convocados para empunhar o aço forjado no sangue. Entre nas Zonas de Caça, sobreviva às hordas, forje em tempo real e purifique o abismo antes que a última chama se apague!',
        color: '#00f5ff'
      }
    ];

    this.init();
  }

  init() {
    this.container = document.createElement('div');
    this.container.id = 'lore-cinematic-overlay';
    this.container.style.position = 'fixed';
    this.container.style.inset = '0';
    this.container.style.zIndex = '99990';
    this.container.style.backgroundColor = '#07050a';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.justifyContent = 'center';
    this.container.style.alignItems = 'center';
    this.container.style.userSelect = 'none';
    this.container.style.overflow = 'hidden';

    // Canvas atmosférico de partículas
    this.canvas = document.createElement('canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.position = 'absolute';
    this.canvas.style.inset = '0';
    this.canvas.style.pointerEvents = 'none';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Inicializa partículas de brasa e fuligem
    for (let i = 0; i < 70; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: 1 + Math.random() * 2.5,
        speedY: -0.4 - Math.random() * 1.2,
        speedX: (Math.random() - 0.5) * 0.6,
        alpha: 0.2 + Math.random() * 0.7,
        color: Math.random() > 0.4 ? '#ff3b30' : '#ff9500'
      });
    }

    // Painel Central com Estilo Gótico
    this.card = document.createElement('div');
    this.card.style.position = 'relative';
    this.card.style.zIndex = '10';
    this.card.style.maxWidth = '680px';
    this.card.style.width = '90%';
    this.card.style.padding = '36px 40px';
    this.card.style.background = 'radial-gradient(circle at center, #1b0e24 0%, #0d0714 100%)';
    this.card.style.border = '2px solid rgba(220, 38, 38, 0.4)';
    this.card.style.boxShadow = '0 0 45px rgba(220, 38, 38, 0.25), inset 0 0 20px rgba(0,0,0,0.8)';
    this.card.style.borderRadius = '16px';
    this.card.style.textAlign = 'center';
    this.card.style.backdropFilter = 'blur(6px)';

    // Cabeçalho do Ato
    this.actBadge = document.createElement('div');
    this.actBadge.style.fontSize = '12px';
    this.actBadge.style.fontWeight = '800';
    this.actBadge.style.letterSpacing = '3px';
    this.actBadge.style.color = '#ef4444';
    this.actBadge.style.textTransform = 'uppercase';
    this.actBadge.style.marginBottom = '12px';
    this.card.appendChild(this.actBadge);

    // Título
    this.actTitle = document.createElement('h2');
    this.actTitle.style.fontSize = '26px';
    this.actTitle.style.fontWeight = '900';
    this.actTitle.style.color = '#ffffff';
    this.actTitle.style.margin = '0 0 16px 0';
    this.actTitle.style.textShadow = '0 2px 10px rgba(255, 69, 0, 0.6)';
    this.card.appendChild(this.actTitle);

    // Texto Narrativo
    this.actText = document.createElement('p');
    this.actText.style.fontSize = '16px';
    this.actText.style.lineHeight = '1.7';
    this.actText.style.color = '#cbd5e1';
    this.actText.style.margin = '0 0 30px 0';
    this.actText.style.minHeight = '90px';
    this.card.appendChild(this.actText);

    // Barra de Ações (Botões)
    const buttonRow = document.createElement('div');
    buttonRow.style.display = 'flex';
    buttonRow.style.justifyContent = 'space-between';
    buttonRow.style.alignItems = 'center';
    buttonRow.style.gap = '16px';

    this.skipBtn = document.createElement('button');
    this.skipBtn.textContent = 'Pular História ⏩';
    this.skipBtn.style.background = 'transparent';
    this.skipBtn.style.border = '1px solid #475569';
    this.skipBtn.style.color = '#94a3b8';
    this.skipBtn.style.padding = '10px 20px';
    this.skipBtn.style.borderRadius = '8px';
    this.skipBtn.style.cursor = 'pointer';
    this.skipBtn.style.fontSize = '14px';
    this.skipBtn.style.transition = 'all 0.2s';
    this.skipBtn.onmouseover = () => { this.skipBtn.style.borderColor = '#ef4444'; this.skipBtn.style.color = '#ffffff'; };
    this.skipBtn.onmouseout = () => { this.skipBtn.style.borderColor = '#475569'; this.skipBtn.style.color = '#94a3b8'; };
    this.skipBtn.onclick = () => {
      audio.playButtonClick();
      this.finish();
    };
    buttonRow.appendChild(this.skipBtn);

    this.nextBtn = document.createElement('button');
    this.nextBtn.textContent = 'Continuar ➔';
    this.nextBtn.style.background = 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)';
    this.nextBtn.style.border = '1px solid #f87171';
    this.nextBtn.style.color = '#ffffff';
    this.nextBtn.style.fontWeight = '800';
    this.nextBtn.style.padding = '12px 28px';
    this.nextBtn.style.borderRadius = '8px';
    this.nextBtn.style.cursor = 'pointer';
    this.nextBtn.style.fontSize = '15px';
    this.nextBtn.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.4)';
    this.nextBtn.style.transition = 'all 0.2s';
    this.nextBtn.onmouseover = () => { this.nextBtn.style.transform = 'scale(1.04)'; };
    this.nextBtn.onmouseout = () => { this.nextBtn.style.transform = 'scale(1.0)'; };
    this.nextBtn.onclick = () => {
      audio.playButtonClick();
      this.nextAct();
    };
    buttonRow.appendChild(this.nextBtn);

    this.card.appendChild(buttonRow);
    this.container.appendChild(this.card);
    document.body.appendChild(this.container);

    this.displayAct(0);
    requestAnimationFrame(() => this.animateParticles());
  }

  displayAct(index) {
    if (index >= this.acts.length) {
      this.finish();
      return;
    }
    this.currentAct = index;
    const act = this.acts[index];
    this.actBadge.textContent = act.act;
    this.actTitle.textContent = act.title;
    this.actText.textContent = act.text;

    if (index === this.acts.length - 1) {
      this.nextBtn.textContent = 'ENTRAR NA FORJA ➔';
      this.nextBtn.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
      this.nextBtn.style.borderColor = '#34d399';
    } else {
      this.nextBtn.textContent = 'Continuar ➔';
    }

    // Efeito suave de entrada
    this.card.style.transform = 'translateY(10px)';
    this.card.style.opacity = '0.7';
    setTimeout(() => {
      this.card.style.transition = 'all 0.4s ease-out';
      this.card.style.transform = 'translateY(0)';
      this.card.style.opacity = '1.0';
    }, 20);
  }

  nextAct() {
    this.displayAct(this.currentAct + 1);
  }

  animateParticles() {
    if (!this.running || !this.ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.clearRect(0, 0, w, h);

    // Efeito de vinheta e iluminação atmosférica sutil
    const grad = this.ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, Math.max(w, h) * 0.7);
    grad.addColorStop(0, 'rgba(30, 10, 40, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, w, h);

    // Renderiza brasas flutuantes
    for (const p of this.particles) {
      p.y += p.speedY;
      p.x += p.speedX;

      if (p.y < -10) {
        p.y = h + 10;
        p.x = Math.random() * w;
      }

      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1.0;

    requestAnimationFrame(() => this.animateParticles());
  }

  finish() {
    this.running = false;
    this.container.style.transition = 'opacity 0.4s ease-out';
    this.container.style.opacity = '0';
    setTimeout(() => {
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
      if (this.onFinish) this.onFinish();
    }, 400);
  }
}
