/**
 * src/engine/TextureGenerator.js - Texturas Procedurais de Alta Fidelidade no Estilo DIABLO
 * Gera lajes de masmorra realistas (sem repetição mecânica de pentagramas),
 * pentagrama sagrado central de 384px, sprites detalhados para os 3 heróis, 5 demônios e chefes épicos.
 */

export class TextureGenerator {
  static generateAll(scene) {
    this.createDungeonFloor(scene);
    this.createSacredAltarAndDecals(scene);
    this.createTorchesAndColumns(scene);
    this.createHeroSprites(scene);
    this.createMonsterSprites(scene);
    this.createBossSprites(scene);
    this.createProjectilesAndFX(scene);
  }

  // ==========================================
  // PISO DA MASMORRA (LAJES DE PEDRA GÓTICA REALISTA)
  // ==========================================
  static createDungeonFloor(scene) {
    if (scene.textures.exists('diablo_floor')) scene.textures.remove('diablo_floor');

    const canvas = scene.textures.createCanvas('diablo_floor', 512, 512);
    const ctx = canvas.context;

    // Fundo base ardósia / rocha de cripta escura
    ctx.fillStyle = '#0f0b13';
    ctx.fillRect(0, 0, 512, 512);

    // Grid de blocos irregulares de pedra (32 a 64px)
    const rows = 8;
    const cols = 8;
    const cellW = 512 / cols;
    const cellH = 512 / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellW;
        const y = r * cellH;

        // Variação de tonalidade de pedra medieval
        const rand = (Math.sin(r * 12.3 + c * 33.7) + 1) * 0.5;
        const baseGrey = Math.floor(18 + rand * 14);
        ctx.fillStyle = `rgb(${baseGrey + 2}, ${baseGrey}, ${baseGrey + 4})`;
        ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);

        // Chanfro 3D da laje de pedra
        ctx.strokeStyle = '#271a2f';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, cellW - 4, cellH - 4);

        // Borda iluminada superior
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(x + 2, y + 2, cellW - 4, 2);

        // Argamassa e fenda escura profunda
        ctx.fillStyle = '#060308';
        ctx.fillRect(x, y, cellW, 2);
        ctx.fillRect(x, y, 2, cellH);

        // Rachaduras orgânicas
        if ((r + c) % 3 === 0) {
          ctx.strokeStyle = '#08040a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x + 8, y + 14);
          ctx.lineTo(x + cellW * 0.45, y + cellH * 0.5);
          ctx.lineTo(x + cellW - 10, y + cellH - 12);
          ctx.stroke();
        }

        // Manchas de sangue seco incrustado na pedra
        if ((r * 7 + c * 5) % 4 === 0) {
          ctx.fillStyle = 'rgba(90, 8, 18, 0.35)';
          ctx.beginPath();
          ctx.ellipse(x + cellW * 0.5, y + cellH * 0.5, 14, 9, rand, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    canvas.refresh();
  }

  // ==========================================
  // PENTAGRAMA SAGRADO CENTRAL & DECALQUES
  // ==========================================
  static createSacredAltarAndDecals(scene) {
    if (scene.textures.exists('central_pentagram')) scene.textures.remove('central_pentagram');

    const canvas = scene.textures.createCanvas('central_pentagram', 400, 400);
    const ctx = canvas.context;

    const cx = 200, cy = 200;

    // Círculos rúnicos entalhados
    ctx.strokeStyle = '#ff1744';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, 175, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 140, 0, Math.PI * 2);
    ctx.stroke();

    // Pentagrama clássico do Diablo
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const px = cx + Math.cos(angle) * 140;
      const py = cy + Math.sin(angle) * 140;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    // Crânio esculpido no centro
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.arc(cx, cy - 6, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - 14, cy + 4, 28, 16);

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx - 8, cy - 6, 5, 0, Math.PI * 2);
    ctx.arc(cx + 8, cy - 6, 5, 0, Math.PI * 2);
    ctx.fill();

    canvas.refresh();

    // Poças de sangue orgânicas
    if (!scene.textures.exists('blood_pool_1')) {
      const c1 = scene.textures.createCanvas('blood_pool_1', 80, 80);
      const ctx1 = c1.context;
      ctx1.fillStyle = 'rgba(140, 5, 20, 0.85)';
      ctx1.beginPath();
      ctx1.ellipse(40, 40, 32, 22, 0.4, 0, Math.PI * 2);
      ctx1.fill();
      ctx1.fillStyle = 'rgba(210, 20, 45, 0.9)';
      ctx1.beginPath();
      ctx1.ellipse(38, 38, 20, 12, 0.3, 0, Math.PI * 2);
      ctx1.fill();
      for (let i = 0; i < 12; i++) {
        const rx = 40 + (Math.random() - 0.5) * 60;
        const ry = 40 + (Math.random() - 0.5) * 60;
        ctx1.fillStyle = 'rgba(160, 10, 30, 0.8)';
        ctx1.beginPath();
        ctx1.arc(rx, ry, 1.5 + Math.random() * 3, 0, Math.PI * 2);
        ctx1.fill();
      }
      c1.refresh();
    }

    if (!scene.textures.exists('blood_pool_2')) {
      const c2 = scene.textures.createCanvas('blood_pool_2', 110, 110);
      const ctx2 = c2.context;
      ctx2.fillStyle = 'rgba(120, 0, 15, 0.82)';
      ctx2.beginPath();
      ctx2.ellipse(55, 55, 46, 30, -0.4, 0, Math.PI * 2);
      ctx2.fill();
      ctx2.fillStyle = 'rgba(180, 10, 35, 0.88)';
      ctx2.beginPath();
      ctx2.ellipse(52, 52, 28, 18, -0.3, 0, Math.PI * 2);
      ctx2.fill();
      c2.refresh();
    }
  }

  // ==========================================
  // COLUNAS & TOCHAS DE FOGO
  // ==========================================
  static createTorchesAndColumns(scene) {
    if (scene.textures.exists('torch_pillar')) return;

    const canvas = scene.textures.createCanvas('torch_pillar', 52, 90);
    const ctx = canvas.context;

    // Sombra do pilar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.ellipse(26, 82, 22, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Coluna de pedra gótica entalhada
    ctx.fillStyle = '#1c1522';
    ctx.fillRect(10, 30, 32, 52);
    ctx.strokeStyle = '#3e2e4f';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(10, 30, 32, 52);

    // Frisos da coluna
    ctx.fillStyle = '#2f233a';
    ctx.fillRect(8, 26, 36, 6);
    ctx.fillRect(6, 76, 40, 8);

    // Suporte de ferro da tocha
    ctx.fillStyle = '#544738';
    ctx.fillRect(16, 20, 20, 8);
    ctx.fillRect(14, 14, 24, 6);

    // Chamas vivas da tocha
    ctx.fillStyle = '#ff4500';
    ctx.beginPath();
    ctx.arc(26, 12, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(26, 10, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(26, 8, 3.5, 0, Math.PI * 2);
    ctx.fill();

    canvas.refresh();
  }

  // ==========================================
  // SPRITES DOS HERÓIS ESTILO DIABLO (72x72)
  // ==========================================
  static createHeroSprites(scene) {
    // 1. Ignis, o Ferreiro Arcano (Paladino / Guerreiro Pesado de Forja)
    if (scene.textures.exists('hero_ignis')) scene.textures.remove('hero_ignis');
    {
      const c = scene.textures.createCanvas('hero_ignis', 72, 72);
      const ctx = c.context;

      // Sombra projetada
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.ellipse(36, 62, 24, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Capa vermelha de batalha esvoaçante
      ctx.fillStyle = '#800000';
      ctx.beginPath();
      ctx.moveTo(26, 24);
      ctx.lineTo(10, 58);
      ctx.lineTo(38, 58);
      ctx.closePath();
      ctx.fill();

      // Armadura de placas de aço escuro com frisos dourados
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(22, 22, 28, 30);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.strokeRect(22, 22, 28, 30);

      // Ombreiras com espinhos de ferro
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(14, 24);
      ctx.lineTo(26, 18);
      ctx.lineTo(22, 32);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(58, 24);
      ctx.lineTo(46, 18);
      ctx.lineTo(50, 32);
      ctx.closePath();
      ctx.fill();

      // Elmo fechado de ferro
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(36, 16, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Fenda de fogo nos olhos
      ctx.fillStyle = '#ff4500';
      ctx.fillRect(30, 15, 12, 3.5);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(33, 15, 6, 2);

      // Martelo Titânico de Duas Mãos em Chamas
      ctx.fillStyle = '#78350f'; // Cabo longo
      ctx.fillRect(52, 8, 6, 52);

      // Cabeça do Martelo em Ferro Forjado Incandescente
      ctx.fillStyle = '#334155';
      ctx.fillRect(45, 2, 20, 18);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(45, 2, 20, 18);

      // Runa de fogo no martelo
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(52, 6, 6, 10);

      c.refresh();
    }

    // 2. Valquíria Carmesim (Caçadora / Assassina)
    if (scene.textures.exists('hero_valkyrie')) scene.textures.remove('hero_valkyrie');
    {
      const c = scene.textures.createCanvas('hero_valkyrie', 72, 72);
      const ctx = c.context;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.ellipse(36, 62, 20, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Capuz e manto negro com forro carmesim
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.moveTo(36, 8);
      ctx.lineTo(16, 54);
      ctx.lineTo(56, 54);
      ctx.closePath();
      ctx.fill();

      // Corpete de couro com placas de sangue
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(26, 24, 20, 26);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.strokeRect(26, 24, 20, 26);

      // Rosto sombrio e olhos vermelhos
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(36, 16, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff0055';
      ctx.fillRect(31, 15, 4, 3);
      ctx.fillRect(37, 15, 4, 3);

      // Foices duplas curvas carmesins
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(18, 28, 16, 0.8, Math.PI * 1.5, false);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(54, 28, 16, -0.5, Math.PI * 0.8, false);
      ctx.stroke();

      c.refresh();
    }

    // 3. Malakor, o Arquimago Rúnico (Necromante / Feiticeiro)
    if (scene.textures.exists('hero_malakor')) scene.textures.remove('hero_malakor');
    {
      const c = scene.textures.createCanvas('hero_malakor', 72, 72);
      const ctx = c.context;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.ellipse(36, 62, 22, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Túnica longa púrpura e preta com runas douradas
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(36, 10);
      ctx.lineTo(16, 60);
      ctx.lineTo(56, 60);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#00f5ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(24, 24, 24, 30);

      // Capuz
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(36, 16, 11, 0, Math.PI * 2);
      ctx.fill();

      // Olhos arcanos
      ctx.fillStyle = '#00f5ff';
      ctx.fillRect(32, 15, 3, 3);
      ctx.fillRect(37, 15, 3, 3);

      // Cajado com cristal cósmico
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(56, 8, 5, 52);

      ctx.fillStyle = '#00f5ff';
      ctx.beginPath();
      ctx.moveTo(58, 2);
      ctx.lineTo(52, 9);
      ctx.lineTo(58, 16);
      ctx.lineTo(64, 9);
      ctx.closePath();
      ctx.fill();

      c.refresh();
    }
  }

  // ==========================================
  // SPRITES DOS DEMÔNIOS & MONSTROS
  // ==========================================
  static createMonsterSprites(scene) {
    // 1. Carniçal de Sangue (Blood Ghoul)
    if (scene.textures.exists('mob_blood_ghoul')) scene.textures.remove('mob_blood_ghoul');
    {
      const c = scene.textures.createCanvas('mob_blood_ghoul', 56, 56);
      const ctx = c.context;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(28, 48, 20, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Corpo corcunda carmesim com costelas expostas
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.ellipse(28, 30, 18, 12, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Costelas
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(22, 26); ctx.lineTo(34, 26);
      ctx.moveTo(20, 30); ctx.lineTo(32, 30);
      ctx.moveTo(22, 34); ctx.lineTo(30, 34);
      ctx.stroke();

      // Garras
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(14, 36, 5, 14);
      ctx.fillRect(34, 36, 5, 14);

      // Cabeça bestial com mandíbula sangrenta
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.arc(40, 20, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a'; // Olho amarelo
      ctx.fillRect(42, 18, 3, 3);

      ctx.fillStyle = '#dc2626'; // Sangue na boca
      ctx.fillRect(40, 24, 8, 4);

      c.refresh();
    }

    // 2. Esqueleto Blindado (Bone Stalker / Skeleton Warrior)
    if (scene.textures.exists('mob_bone_stalker')) scene.textures.remove('mob_bone_stalker');
    {
      const c = scene.textures.createCanvas('mob_bone_stalker', 56, 56);
      const ctx = c.context;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.ellipse(28, 50, 18, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Torso esquelético
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(25, 20, 6, 20);
      ctx.fillRect(18, 24, 20, 2.5);
      ctx.fillRect(19, 29, 18, 2.5);
      ctx.fillRect(21, 34, 14, 2.5);

      // Crânio
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.arc(28, 14, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.fillRect(25, 12, 2.5, 3);
      ctx.fillRect(29, 12, 2.5, 3);

      // Elmo de ferro enferrujado com chifre
      ctx.fillStyle = '#475569';
      ctx.fillRect(20, 7, 16, 6);
      ctx.beginPath();
      ctx.moveTo(21, 7); ctx.lineTo(16, 0); ctx.lineTo(23, 5);
      ctx.closePath();
      ctx.fill();

      // Escudo com rebites
      ctx.fillStyle = '#78350f';
      ctx.fillRect(8, 20, 10, 18);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(8, 20, 10, 18);

      // Espada curta
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(39, 14, 4, 26);

      c.refresh();
    }

    // 3. Assombração Noturna (Shadow Fiend)
    if (scene.textures.exists('mob_shadow_fiend')) scene.textures.remove('mob_shadow_fiend');
    {
      const c = scene.textures.createCanvas('mob_shadow_fiend', 56, 56);
      const ctx = c.context;

      ctx.fillStyle = 'rgba(88, 28, 135, 0.85)';
      ctx.beginPath();
      ctx.moveTo(28, 8);
      ctx.lineTo(10, 48);
      ctx.lineTo(28, 40);
      ctx.lineTo(46, 48);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(28, 16, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#c084fc';
      ctx.fillRect(24, 15, 3, 3);
      ctx.fillRect(29, 15, 3, 3);

      c.refresh();
    }

    // 4. Diabrete de Magma (Magma Imp)
    if (scene.textures.exists('mob_magma_imp')) scene.textures.remove('mob_magma_imp');
    {
      const c = scene.textures.createCanvas('mob_magma_imp', 56, 56);
      const ctx = c.context;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(28, 48, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Asas de morcego de fogo
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(28, 22); ctx.lineTo(6, 12); ctx.lineTo(16, 32); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(28, 22); ctx.lineTo(50, 12); ctx.lineTo(40, 32); ctx.closePath(); ctx.fill();

      // Corpo vermelho de lava
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(28, 26, 11, 0, Math.PI * 2);
      ctx.fill();

      // Chifres
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.moveTo(22, 16); ctx.lineTo(16, 4); ctx.lineTo(25, 14); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(34, 16); ctx.lineTo(40, 4); ctx.lineTo(31, 14); ctx.closePath(); ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.fillRect(25, 23, 2.5, 2.5);
      ctx.fillRect(29, 23, 2.5, 2.5);

      c.refresh();
    }

    // 5. Cavaleiro de Enxofre (Hell Knight)
    if (scene.textures.exists('mob_hell_knight')) scene.textures.remove('mob_hell_knight');
    {
      const c = scene.textures.createCanvas('mob_hell_knight', 64, 64);
      const ctx = c.context;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.ellipse(32, 58, 22, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Armadura negra espinhosa
      ctx.fillStyle = '#18181b';
      ctx.fillRect(18, 18, 28, 32);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.strokeRect(18, 18, 28, 32);

      // Ombreiras
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(8, 16, 10, 14);
      ctx.fillRect(46, 16, 10, 14);

      // Elmo pontiagudo
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(32, 14, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(28, 13, 8, 2.5);

      // Espada de duas mãos em chamas
      ctx.fillStyle = '#f97316';
      ctx.fillRect(52, 6, 5, 46);

      c.refresh();
    }
  }

  // ==========================================
  // CHEFES SUPREMOS ESTILO DIABLO (120x120)
  // ==========================================
  static createBossSprites(scene) {
    // 1. Gorgoroth, o Carniceiro Abissal (The Butcher)
    if (scene.textures.exists('boss_gorgoroth')) scene.textures.remove('boss_gorgoroth');
    {
      const c = scene.textures.createCanvas('boss_gorgoroth', 120, 120);
      const ctx = c.context;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.beginPath();
      ctx.ellipse(60, 106, 48, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Corpo corpulento de demônio
      ctx.fillStyle = '#450a0a';
      ctx.beginPath();
      ctx.ellipse(60, 62, 38, 34, 0, 0, Math.PI * 2);
      ctx.fill();

      // Avental ensanguentado
      ctx.fillStyle = '#78350f';
      ctx.fillRect(40, 48, 40, 48);
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(50, 64, 14, 0, Math.PI * 2);
      ctx.arc(68, 78, 12, 0, Math.PI * 2);
      ctx.fill();

      // Chifres gigantes curvados
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.moveTo(42, 28);
      ctx.bezierCurveTo(26, 14, 14, 2, 8, 10);
      ctx.bezierCurveTo(18, 22, 32, 32, 44, 36);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(78, 28);
      ctx.bezierCurveTo(94, 14, 106, 2, 112, 10);
      ctx.bezierCurveTo(102, 22, 88, 32, 76, 36);
      ctx.closePath();
      ctx.fill();

      // Cabeça bestial
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.arc(60, 32, 18, 0, Math.PI * 2);
      ctx.fill();

      // Presas
      ctx.fillStyle = '#000000';
      ctx.fillRect(51, 36, 18, 7);
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(52 + i * 4.5, 36, 2.5, 3.5);
        ctx.fillRect(52 + i * 4.5, 39.5, 2.5, 3.5);
      }

      // Olhos vermelhos
      ctx.fillStyle = '#ff0055';
      ctx.fillRect(52, 27, 5, 3.5);
      ctx.fillRect(63, 27, 5, 3.5);

      // Cutelo Gigante de Carniceiro (The Meat Cleaver)
      ctx.fillStyle = '#57534e';
      ctx.fillRect(88, 24, 26, 62);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3.5;
      ctx.strokeRect(88, 24, 26, 62);

      // Cabo de ferro com pregos
      ctx.fillStyle = '#292524';
      ctx.fillRect(98, 86, 7, 28);

      // Gancho de carne na outra mão
      ctx.strokeStyle = '#78716c';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.arc(24, 68, 14, 0.4, Math.PI * 1.6);
      ctx.stroke();

      c.refresh();
    }

    // 2. Ignarix, o Titã das Cinzas
    if (scene.textures.exists('boss_ignarix')) scene.textures.remove('boss_ignarix');
    {
      const c = scene.textures.createCanvas('boss_ignarix', 120, 120);
      const ctx = c.context;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.beginPath();
      ctx.ellipse(60, 106, 50, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Asas vulcânicas
      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.moveTo(60, 50); ctx.lineTo(8, 16); ctx.lineTo(28, 72); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(60, 50); ctx.lineTo(112, 16); ctx.lineTo(92, 72); ctx.closePath(); ctx.fill();

      // Corpo de magma
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.ellipse(60, 62, 34, 36, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(46, 50); ctx.lineTo(60, 72); ctx.lineTo(74, 54);
      ctx.stroke();

      // Cabeça com coroa de chifres
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(60, 30, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(53, 27, 5, 3.5);
      ctx.fillRect(62, 27, 5, 3.5);

      c.refresh();
    }
  }

  // ==========================================
  // FX & ORBES DE SANGUE 3D
  // ==========================================
  static createProjectilesAndFX(scene) {
    if (!scene.textures.exists('blood_orb_item')) {
      const c = scene.textures.createCanvas('blood_orb_item', 26, 26);
      const ctx = c.context;

      const grad = ctx.createRadialGradient(10, 8, 2, 13, 13, 11);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#ff1744');
      grad.addColorStop(0.8, '#880015');
      grad.addColorStop(1, '#330005');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(13, 13, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 100, 130, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      c.refresh();
    }
  }
}
