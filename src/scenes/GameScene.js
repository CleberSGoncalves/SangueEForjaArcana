/**
 * src/scenes/GameScene.js - Arena Principal ARPG Survivors 100% Inspirada em DIABLO
 * Lajes de pedra gótica, sprites detalhados de heróis e demônios, The Butcher boss,
 * Health Globe clássico, Resource Globe de Sangue, poças de sangue permanentes e 60 FPS.
 */

import Phaser from 'phaser';
import { HEROES } from '../data/heroes.js';
import { ZONES } from '../data/zones.js';
import { ArcanePet } from '../engine/Pet.js';
import { InRunForgeManager } from '../engine/InRunForge.js';
import { TextureGenerator } from '../engine/TextureGenerator.js';
import { generateLootItem } from '../data/loot.js';
import { saveManager } from '../engine/SaveManager.js';
import { crazyGames } from '../crazygames.js';
import { audio } from '../audio.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.zoneId = data.zoneId || 'catacombs';
    this.hardcore = !!data.hardcore;
    this.zoneData = ZONES[this.zoneId] || ZONES.catacombs;

    this.currentWave = 1;
    this.waveTimer = 35;
    this.waveElapsed = 0;
    this.isBossWave = false;
    this.boss = null;
    this.isGameOver = false;
    this.isVictory = false;
    this.isPaused = false;
    this.reviveUsed = false;
    this.invulnerableTimer = 0;
    this.playerHurtCooldown = 0;
    this.potionCharges = 3;

    // Recursos da corrida
    this.runBlood = 0;
    this.runKills = 0;
    this.runLootDrops = [];

    // Cooldowns
    this.activeSkillCooldown = 0;
    this.ultimateSkillCooldown = 0;
    this.dashCooldown = 0;

    const save = saveManager.data;
    this.heroConfig = HEROES[save.selectedHero] || HEROES.ignis;
    this.heroTalents = save.heroTalents[this.heroConfig.id] || {};
    this.equipped = save.equipped || {};
  }

  create() {
    // 1. Gera todas as texturas procedurais góticas estilo Diablo
    TextureGenerator.generateAll(this);

    // 2. Limites do mundo físico da cripta
    this.physics.world.setBounds(0, 0, 2400, 2400);

    // 3. Renderiza o piso da masmorra em lajes de pedra gótica
    this.createDungeonEnvironment();

    // 4. Grupos de entidades com profundidade z-index ordenada
    this.bloodDecalsGroup = this.add.group(); // depth: 2 (no chão)
    this.enemies = this.add.group();
    this.projectiles = this.physics.add.group();
    this.enemyProjectiles = this.physics.add.group();
    this.bloodDrops = this.physics.add.group();
    this.floatingTexts = this.add.group();

    // 5. Criação do Herói com Sprite Visual Gótico
    this.createHeroCharacter();

    // 6. Colisor único centralizado (Elimina memory leak e mantém 60 FPS)
    this.physics.add.overlap(this.projectiles, this.enemies, (proj, enemy) => {
      this.handleProjectileHit(proj, enemy);
    });

    // 7. Criação do Pet Arcano
    this.pet = new ArcanePet(this, this.player);

    // 8. Gerenciador da Forja em Tempo Real
    this.forgeManager = new InRunForgeManager(this);

    // 9. Câmera cinematográfica com zoom gótico e iluminação
    this.cameras.main.setBounds(0, 0, 2400, 2400);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.15); // Zoom para apreciar a arte dos demônios e herói

    // 10. Tocha / Luz dinâmica ao redor do herói
    this.createTorchLighting();

    // 11. Controles
    this.setupInputControls();

    // 12. Spawns e Ataques
    this.spawnTimer = 0;
    this.spawnInterval = 1.0;
    this.attackTimer = 0;
    this.attackInterval = 0.55;

    // 13. HUD Lendário do DIABLO (Health Globe + Action Bar)
    this.createDiabloHUD();

    // 14. Inicia ciclo CrazyGames & Música
    crazyGames.gameplayStart();
    audio.startGothicBgm('combat');
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  // ==========================================
  // CENÁRIO DA MASMORRA GÓTICA (LAJES & PILARES)
  // ==========================================
  createDungeonEnvironment() {
    // Piso de Lajes de Pedra Gótica (TileSprite infinito)
    this.floor = this.add.tileSprite(1200, 1200, 2400, 2400, 'diablo_floor').setDepth(1);

    // Pilares góticos com tochas de fogo ardente espalhados pela masmorra
    const pillarPositions = [
      { x: 400, y: 400 }, { x: 1200, y: 400 }, { x: 2000, y: 400 },
      { x: 400, y: 1200 }, { x: 2000, y: 1200 },
      { x: 400, y: 2000 }, { x: 1200, y: 2000 }, { x: 2000, y: 2000 },
      { x: 900, y: 900 }, { x: 1500, y: 900 }, { x: 900, y: 1500 }, { x: 1500, y: 1500 }
    ];

    pillarPositions.forEach(pos => {
      const pillar = this.add.sprite(pos.x, pos.y, 'torch_pillar').setDepth(8);

      // Luz pulsante da tocha
      const light = this.add.graphics({ depth: 3 });
      light.fillStyle(0xff8c00, 0.15);
      light.fillCircle(pos.x, pos.y - 20, 140);

      this.tweens.add({
        targets: light,
        alpha: 0.6,
        scale: 1.08,
        duration: 350 + Math.random() * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // Pentagrama Sagrado Central da Cripta
    this.add.sprite(1200, 1200, 'central_pentagram').setDepth(2).setAlpha(0.85);

    // Círculo Central da Forja Sagrada
    const forgeAltar = this.add.graphics({ depth: 3 });
    forgeAltar.lineStyle(4, 0xff1744, 0.8);
    forgeAltar.strokeCircle(1200, 1200, 180);
    forgeAltar.lineStyle(2, 0xd97706, 0.9);
    forgeAltar.strokeCircle(1200, 1200, 90);
  }

  createTorchLighting() {
    // Vinheta e iluminação radial no herói
    this.torchLight = this.add.graphics({ depth: 4 });
  }

  updateTorchLight() {
    if (!this.torchLight || !this.player) return;
    this.torchLight.clear();

    // Halo quente de tocha ao redor do herói
    this.torchLight.fillStyle(0xffa500, 0.08);
    this.torchLight.fillCircle(this.player.x, this.player.y, 220);

    this.torchLight.fillStyle(0xffd700, 0.05);
    this.torchLight.fillCircle(this.player.x, this.player.y, 140);
  }

  // ==========================================
  // HERÓI COM SPRITE VISUAL GÓTICO
  // ==========================================
  createHeroCharacter() {
    this.player = this.add.container(1200, 1200).setDepth(15);
    this.physics.world.enable(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setSize(36, 36);
    this.player.body.setOffset(-18, -18);

    // Escolhe a textura correta do herói
    let texKey = 'hero_ignis';
    if (this.heroConfig.id === 'valkyrie') texKey = 'hero_valkyrie';
    else if (this.heroConfig.id === 'malakor') texKey = 'hero_malakor';

    this.playerSprite = this.add.sprite(0, 0, texKey);
    this.player.add(this.playerSprite);

    // Aura de Invulnerabilidade
    this.invulnAura = this.add.graphics({ depth: 25 });
    this.invulnAura.setVisible(false);

    // Rastro de passo
    this.stepTimer = 0;

    // Estatísticas
    const base = this.heroConfig.baseStats;
    let bonusHp = 0, bonusDmg = 0, bonusArmor = 0, bonusSpeed = 0;
    Object.values(this.equipped).forEach(item => {
      if (!item || !item.stats) return;
      if (item.stats.maxHp) bonusHp += item.stats.maxHp;
      if (item.stats.damage) bonusDmg += item.stats.damage;
      if (item.stats.armor) bonusArmor += item.stats.armor;
      if (item.stats.speed) bonusSpeed += item.stats.speed;
    });

    this.player.maxHp = base.maxHp + bonusHp;
    this.player.hp = this.player.maxHp;
    this.player.baseSpeed = base.speed + bonusSpeed;
    this.player.speedMult = 1.0;
    this.player.damage = base.damage + bonusDmg;
    this.player.damageMult = 1.0;
    this.player.armor = base.armor + bonusArmor;
    this.player.critChance = base.critChance;
    this.player.critDamage = base.critDamage;
    this.player.pickupRadius = base.pickupRadius;
    this.player.vampirism = (this.heroConfig.id === 'valkyrie' ? 0.14 : 0);
    this.player.bloodMultiplier = base.bloodMultiplier * (this.hardcore ? 1.5 : 1.0);
    this.player.extraProjectiles = 0;
    this.player.hasFireTrails = false;
    this.player.hasLightningProc = false;
  }

  // ==========================================
  // CONTROLES & INPUTS
  // ==========================================
  setupInputControls() {
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      upArrow: Phaser.Input.Keyboard.KeyCodes.UP,
      downArrow: Phaser.Input.Keyboard.KeyCodes.DOWN,
      leftArrow: Phaser.Input.Keyboard.KeyCodes.LEFT,
      rightArrow: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      dash: Phaser.Input.Keyboard.KeyCodes.SPACE,
      skill: Phaser.Input.Keyboard.KeyCodes.E,
      ult: Phaser.Input.Keyboard.KeyCodes.Q,
      forge: Phaser.Input.Keyboard.KeyCodes.F,
      potion: Phaser.Input.Keyboard.KeyCodes.ONE,
      pause: Phaser.Input.Keyboard.KeyCodes.ESC
    });

    this.input.keyboard.on('keydown-F', () => this.openInRunForgeModal());
    this.input.keyboard.on('keydown-ONE', () => this.useHealthPotion());
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
  }

  useHealthPotion() {
    if (this.potionCharges <= 0 || this.player.hp >= this.player.maxHp) return;
    this.potionCharges--;
    const heal = this.player.maxHp * 0.45;
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
    audio.playLevelUp();

    // Efeito visual de cura de sangue sagrado
    const healGfx = this.add.graphics({ depth: 30 });
    healGfx.fillStyle(0x00ff88, 0.4);
    healGfx.fillCircle(this.player.x, this.player.y, 35);
    this.tweens.add({ targets: healGfx, alpha: 0, duration: 400, onComplete: () => healGfx.destroy() });
  }

  // ==========================================
  // LOOP DE ATUALIZAÇÃO (60 FPS)
  // ==========================================
  update(time, delta) {
    if (this.isGameOver || this.isVictory || this.isPaused) return;
    const dt = delta / 1000;

    // 1. Movimentação do Herói & Animação de Passos
    this.handlePlayerMovement(dt, time);

    // 2. Luz de tocha seguindo o herói
    this.updateTorchLight();

    // 3. Invulnerabilidade & I-Frames
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
      this.invulnAura.clear();
      this.invulnAura.fillStyle(0xffd700, 0.4 + Math.sin(time * 0.02) * 0.2);
      this.invulnAura.fillCircle(this.player.x, this.player.y, 34);
      this.invulnAura.setVisible(true);
      if (this.invulnerableTimer <= 0) this.invulnAura.setVisible(false);
    }
    if (this.playerHurtCooldown > 0) this.playerHurtCooldown -= dt;

    // 4. Pet Arcano
    if (this.pet) this.pet.update(time, delta);

    // 5. Ondas & Spawns de Demônios
    this.updateWaveTimer(dt);

    // 6. Cooldowns de Habilidades
    if (this.activeSkillCooldown > 0) this.activeSkillCooldown -= dt;
    if (this.ultimateSkillCooldown > 0) this.ultimateSkillCooldown -= dt;
    if (this.dashCooldown > 0) this.dashCooldown -= dt;

    // 7. Ataque Primário Automático
    this.attackTimer += dt;
    if (this.attackTimer >= this.attackInterval) {
      this.attackTimer = 0;
      this.autoAttackNearest();
    }

    // 8. Inteligência & Movimento dos Demônios
    this.updateEnemies(dt, time);

    // 9. Coleta de Orbes de Sangue
    this.updateBloodMagnet(dt);

    // 10. Atualização do HUD do Diablo
    this.updateDiabloHUD();
  }

  handlePlayerMovement(dt, time) {
    let moveX = 0, moveY = 0;
    if (this.cursors.left.isDown || this.cursors.leftArrow.isDown) moveX -= 1;
    if (this.cursors.right.isDown || this.cursors.rightArrow.isDown) moveX += 1;
    if (this.cursors.up.isDown || this.cursors.upArrow.isDown) moveY -= 1;
    if (this.cursors.down.isDown || this.cursors.downArrow.isDown) moveY += 1;

    if (this.virtualJoy && this.virtualJoy.active) {
      moveX = this.virtualJoy.x;
      moveY = this.virtualJoy.y;
    }

    const currentSpeed = this.player.baseSpeed * this.player.speedMult;

    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      const normX = moveX / len;
      const normY = moveY / len;
      this.player.body.setVelocity(normX * currentSpeed, normY * currentSpeed);

      // Espelhamento horizontal do sprite baseado na direção
      if (normX < -0.1) this.playerSprite.setFlipX(true);
      else if (normX > 0.1) this.playerSprite.setFlipX(false);

      // Efeito de caminhada (bobbing)
      this.playerSprite.y = Math.sin(time * 0.015) * 2;
    } else {
      this.player.body.setVelocity(0, 0);
      this.playerSprite.y = 0;
    }

    // Habilidades
    if (Phaser.Input.Keyboard.JustDown(this.cursors.dash) && this.dashCooldown <= 0) this.triggerDash();
    if (Phaser.Input.Keyboard.JustDown(this.cursors.skill) && this.activeSkillCooldown <= 0) this.triggerActiveSkill();
    if (Phaser.Input.Keyboard.JustDown(this.cursors.ult) && this.ultimateSkillCooldown <= 0) this.triggerUltimateSkill();
  }

  triggerDash() {
    this.dashCooldown = 2.0;
    audio.playDash();
    const curVx = this.player.body.velocity.x;
    const curVy = this.player.body.velocity.y;
    const dashSpeed = 560;

    let dirX = 1, dirY = 0;
    if (curVx !== 0 || curVy !== 0) {
      const len = Math.hypot(curVx, curVy);
      dirX = curVx / len;
      dirY = curVy / len;
    }
    this.player.body.setVelocity(dirX * dashSpeed, dirY * dashSpeed);

    // Efeito de rastro espectral
    const ghost = this.add.sprite(this.player.x, this.player.y, this.playerSprite.texture.key).setDepth(14);
    ghost.setFlipX(this.playerSprite.flipX);
    ghost.setTint(0x00f5ff);
    ghost.setAlpha(0.6);
    this.tweens.add({ targets: ghost, alpha: 0, duration: 350, onComplete: () => ghost.destroy() });
  }

  triggerActiveSkill() {
    const skill = this.heroConfig.activeSkill;
    this.activeSkillCooldown = skill.cooldown;
    audio.playFireExplosion();

    if (this.heroConfig.id === 'ignis') {
      // Bigorna Astral
      this.cameras.main.shake(200, 0.012);
      const anvilGfx = this.add.graphics({ depth: 22 });
      anvilGfx.fillStyle(0xff4500, 0.7);
      anvilGfx.fillCircle(this.player.x, this.player.y, skill.radius);
      anvilGfx.lineStyle(3, 0xffd700, 1);
      anvilGfx.strokeCircle(this.player.x, this.player.y, skill.radius);
      this.tweens.add({ targets: anvilGfx, alpha: 0, scale: 1.25, duration: 400, onComplete: () => anvilGfx.destroy() });
      this.damageArea(this.player.x, this.player.y, skill.radius, skill.damage * this.player.damageMult);
    } else if (this.heroConfig.id === 'valkyrie') {
      // Dança das Lâminas 360°
      audio.playSlash();
      const count = 10 + (this.player.extraProjectiles || 0) * 2;
      for (let i = 0; i < count; i++) {
        const ang = (Math.PI * 2 / count) * i;
        this.spawnBladeProjectile(this.player.x, this.player.y, ang, skill.damage);
      }
    } else if (this.heroConfig.id === 'malakor') {
      // Nova Glacial
      audio.playFrostNova();
      const frostGfx = this.add.graphics({ depth: 22 });
      frostGfx.fillStyle(0x00f5ff, 0.5);
      frostGfx.fillCircle(this.player.x, this.player.y, skill.radius);
      this.tweens.add({ targets: frostGfx, alpha: 0, duration: 500, onComplete: () => frostGfx.destroy() });
      this.damageArea(this.player.x, this.player.y, skill.radius, skill.damage * this.player.damageMult, 'freeze');
    }
  }

  triggerUltimateSkill() {
    const ult = this.heroConfig.ultimateSkill;
    this.ultimateSkillCooldown = ult.cooldown;
    this.cameras.main.shake(350, 0.02);

    if (this.heroConfig.id === 'ignis') {
      // Forja do Caos (Aura de chamas devastadora)
      audio.playFireExplosion();
      this.time.addEvent({
        delay: 450,
        repeat: 12,
        callback: () => {
          this.damageArea(this.player.x, this.player.y, 180, 48 * this.player.damageMult);
          const ring = this.add.graphics({ depth: 21 });
          ring.lineStyle(4, 0xff2200, 0.9);
          ring.strokeCircle(this.player.x, this.player.y, 180);
          this.tweens.add({ targets: ring, alpha: 0, duration: 300, onComplete: () => ring.destroy() });
        }
      });
    } else if (this.heroConfig.id === 'valkyrie') {
      // Vórtice Sanguíneo
      audio.playReviveAura();
      this.time.addEvent({
        delay: 350,
        repeat: 14,
        callback: () => {
          this.enemies.getChildren().forEach(e => {
            if (!e.active) return;
            const d = Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y);
            if (d < 450) {
              const ang = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
              e.x += Math.cos(ang) * 16;
              e.y += Math.sin(ang) * 16;
              this.applyDamageToEnemy(e, 38 * this.player.damageMult);
            }
          });
        }
      });
    } else if (this.heroConfig.id === 'malakor') {
      // Cataclismo Cósmico
      audio.playBossRoar();
      for (let i = 0; i < 14; i++) {
        this.time.delayedCall(i * 170, () => {
          const rx = this.player.x + (Math.random() - 0.5) * 650;
          const ry = this.player.y + (Math.random() - 0.5) * 650;
          const meteor = this.add.graphics({ depth: 24 });
          meteor.fillStyle(0x7928ca, 0.9);
          meteor.fillCircle(rx, ry, 65);
          this.tweens.add({ targets: meteor, alpha: 0, duration: 400, onComplete: () => meteor.destroy() });
          this.damageArea(rx, ry, 75, 80 * this.player.damageMult);
        });
      }
    }
  }

  // ==========================================
  // ATAQUE AUTOMÁTICO PRIMÁRIO
  // ==========================================
  autoAttackNearest() {
    let nearest = null;
    let minDist = 400;

    this.enemies.getChildren().forEach(e => {
      if (!e.active || e.hp <= 0) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
      if (d < minDist) {
        minDist = d;
        nearest = e;
      }
    });

    if (nearest) {
      audio.playSlash();
      const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, nearest.x, nearest.y);
      const totalShots = 1 + this.player.extraProjectiles;

      for (let i = 0; i < totalShots; i++) {
        const spread = (i - (totalShots - 1) / 2) * 0.18;
        this.spawnPrimaryProjectile(this.player.x, this.player.y, angle + spread);
      }
    }
  }

  spawnPrimaryProjectile(x, y, angle) {
    const proj = this.add.graphics({ depth: 20 });
    this.physics.world.enable(proj);
    proj.body.setSize(14, 14);
    proj.body.setOffset(-7, -7);

    const isFire = this.player.hasFireTrails || this.heroConfig.id === 'ignis';
    proj.fillStyle(isFire ? 0xff4500 : 0x00f5ff, 1);
    proj.fillCircle(0, 0, 8);
    proj.lineStyle(2, 0xffd700, 1);
    proj.strokeCircle(0, 0, 8);

    proj.x = x;
    proj.y = y;
    proj.body.setVelocity(Math.cos(angle) * 520, Math.sin(angle) * 520);

    const dmg = this.player.damage * this.player.damageMult;
    const isCrit = Math.random() < this.player.critChance;
    proj.damageValue = isCrit ? dmg * this.player.critDamage : dmg;
    proj.isCrit = isCrit;

    this.projectiles.add(proj);
    this.time.delayedCall(1300, () => { if (proj.active) proj.destroy(); });
  }

  spawnBladeProjectile(x, y, angle, damage) {
    const blade = this.add.graphics({ depth: 20 });
    this.physics.world.enable(blade);
    blade.body.setSize(16, 16);
    blade.body.setOffset(-8, -8);

    blade.fillStyle(0xe60049, 1);
    blade.fillTriangle(0, -7, 14, 0, 0, 7);
    blade.x = x;
    blade.y = y;
    blade.rotation = angle;
    blade.body.setVelocity(Math.cos(angle) * 450, Math.sin(angle) * 450);

    blade.damageValue = damage * this.player.damageMult;
    blade.isCrit = false;

    this.projectiles.add(blade);
    this.time.delayedCall(1200, () => { if (blade.active) blade.destroy(); });
  }

  spawnPetProjectile(x, y, target, damage) {
    const angle = Phaser.Math.Angle.Between(x, y, target.x, target.y);
    const feather = this.add.graphics({ depth: 20 });
    this.physics.world.enable(feather);
    feather.body.setSize(10, 10);
    feather.fillStyle(0x38bdf8, 1);
    feather.fillCircle(0, 0, 6);
    feather.x = x;
    feather.y = y;
    feather.body.setVelocity(Math.cos(angle) * 540, Math.sin(angle) * 540);

    feather.damageValue = damage;
    feather.isCrit = false;

    this.projectiles.add(feather);
    this.time.delayedCall(1000, () => { if (feather.active) feather.destroy(); });
  }

  handleProjectileHit(proj, enemy) {
    if (!enemy.active || enemy.hp <= 0) return;
    this.applyDamageToEnemy(enemy, proj.damageValue || 20, proj.isCrit);

    if (this.player.hasLightningProc && Math.random() < 0.3) {
      this.procLightning(enemy);
    }
    proj.destroy();
  }

  procLightning(target) {
    audio.playFrostNova();
    const beam = this.add.graphics({ depth: 23 });
    beam.lineStyle(2, 0xffff00, 1);
    beam.moveTo(target.x, target.y);
    beam.lineTo(target.x + (Math.random() - 0.5) * 90, target.y + (Math.random() - 0.5) * 90);
    beam.strokePath();
    this.tweens.add({ targets: beam, alpha: 0, duration: 250, onComplete: () => beam.destroy() });
    this.damageArea(target.x, target.y, 90, 28 * this.player.damageMult);
  }

  damageArea(x, y, radius, damage, effect = null) {
    this.enemies.getChildren().forEach(e => {
      if (!e.active || e.hp <= 0) return;
      const d = Phaser.Math.Distance.Between(x, y, e.x, e.y);
      if (d <= radius) {
        this.applyDamageToEnemy(e, damage);
        if (effect === 'freeze') {
          e.isFrozen = true;
          e.frozenTimer = 2.5;
        }
      }
    });
  }

  applyDamageToEnemy(enemy, damage, isCrit = false) {
    enemy.hp -= damage;
    this.showDamageNumber(enemy.x, enemy.y, Math.round(damage), isCrit);

    // Atualiza barra de vida individual sobre a cabeça
    if (enemy.hpBar) {
      const pct = Math.max(0, enemy.hp / enemy.maxHp);
      enemy.hpBar.clear();
      enemy.hpBar.fillStyle(0x000000, 0.7);
      enemy.hpBar.fillRect(-18, -26, 36, 5);
      enemy.hpBar.fillStyle(0xff1744, 1);
      enemy.hpBar.fillRect(-18, -26, 36 * pct, 5);
    }

    // Vampirismo
    if (this.player.vampirism > 0) {
      const heal = damage * this.player.vampirism;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
    }

    // Flash visual de impacto
    enemy.setAlpha(0.4);
    this.time.delayedCall(70, () => {
      if (enemy.active) enemy.setAlpha(1.0);
    });

    if (enemy.hp <= 0) {
      this.onEnemyKilled(enemy);
    }
  }

  showDamageNumber(x, y, amount, isCrit) {
    const text = this.add.text(x + (Math.random() - 0.5) * 20, y - 14, `${amount}${isCrit ? '!' : ''}`, {
      fontSize: isCrit ? '20px' : '14px',
      fontFamily: 'Cinzel, sans-serif',
      fontStyle: 'bold',
      color: isCrit ? '#ffd700' : '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setDepth(30);

    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 650,
      ease: 'Power1',
      onComplete: () => text.destroy()
    });
  }

  onEnemyKilled(enemy) {
    enemy.active = false;
    this.runKills++;
    saveManager.recordKill(enemy.mobId, enemy.isBoss);

    // Poça de sangue permanente no chão da masmorra (Decalque)
    const bloodKey = Math.random() > 0.5 ? 'blood_pool_1' : 'blood_pool_2';
    const decal = this.add.sprite(enemy.x, enemy.y, bloodKey).setDepth(2);
    decal.setAlpha(0.85);
    decal.setRotation(Math.random() * Math.PI * 2);
    this.bloodDecalsGroup.add(decal);

    // Drop de Orbe de Sangue 3D
    const bloodAmount = Math.max(1, Math.round((enemy.bloodDrop || 2) * this.player.bloodMultiplier));
    this.spawnBloodDrop(enemy.x, enemy.y, bloodAmount);

    // Drop de Loot
    if (enemy.isBoss || Math.random() < 0.14) {
      const rarity = enemy.isBoss ? (Math.random() < 0.5 ? 'mythic' : 'legendary') : null;
      const lootItem = generateLootItem(null, rarity, this.currentWave);
      this.runLootDrops.push(lootItem);
      audio.playItemDrop();
      this.showLootNotification(lootItem);
    }

    if (enemy.isBoss) {
      this.onBossDefeated();
    }

    enemy.destroy();
  }

  spawnBloodDrop(x, y, value) {
    const orb = this.add.sprite(x, y, 'blood_orb_item').setDepth(11);
    this.physics.world.enable(orb);
    orb.body.setSize(18, 18);
    orb.bloodValue = value;
    this.bloodDrops.add(orb);

    // Efeito pulsante suave
    this.tweens.add({
      targets: orb,
      scale: 1.2,
      duration: 400,
      yoyo: true,
      repeat: -1
    });
  }

  showLootNotification(item) {
    const notice = this.add.text(this.player.x, this.player.y - 75, `+ ${item.name} [${item.rarityName}]`, {
      fontSize: '15px',
      fontFamily: 'Cinzel, sans-serif',
      fontStyle: 'bold',
      color: item.color,
      backgroundColor: 'rgba(5, 2, 8, 0.9)',
      padding: { x: 10, y: 6 }
    }).setDepth(35).setOrigin(0.5);

    this.tweens.add({
      targets: notice,
      y: this.player.y - 130,
      alpha: 0,
      duration: 2000,
      onComplete: () => notice.destroy()
    });
  }

  // ==========================================
  // ONDAS & CHEFES (THE BUTCHER / CORRUPTOR)
  // ==========================================
  updateWaveTimer(dt) {
    this.waveElapsed += dt;
    const remaining = Math.max(0, Math.ceil(this.waveTimer - this.waveElapsed));

    if (remaining === 0 && !this.isBossWave) {
      if (this.currentWave >= this.zoneData.wavesCount) {
        this.spawnBoss();
      } else {
        this.advanceWave();
      }
    }

    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemyWave();
    }
  }

  advanceWave() {
    this.currentWave++;
    this.waveElapsed = 0;
    this.potionCharges = Math.min(3, this.potionCharges + 1); // Recarrega poção
    this.spawnInterval = Math.max(0.45, this.spawnInterval * 0.9);
    audio.playLevelUp();

    const banner = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, `ONDA ${this.currentWave}`, {
      fontSize: '36px',
      fontFamily: 'Cinzel, sans-serif',
      fontStyle: '900',
      color: '#ff2a55',
      stroke: '#000000',
      strokeThickness: 6
    }).setScrollFactor(0).setDepth(40).setOrigin(0.5);

    this.tweens.add({ targets: banner, scale: 1.4, alpha: 0, duration: 1500, onComplete: () => banner.destroy() });
  }

  spawnEnemyWave() {
    if (this.enemies.getLength() > 60) return;

    const pool = this.zoneData.enemies;
    const mobDef = pool[Math.floor(Math.random() * pool.length)];

    const angle = Math.random() * Math.PI * 2;
    const dist = 450 + Math.random() * 80;
    const sx = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * dist, 80, 2320);
    const sy = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * dist, 80, 2320);

    const enemy = this.add.container(sx, sy).setDepth(13);
    this.physics.world.enable(enemy);
    enemy.body.setSize(mobDef.radius * 2, mobDef.radius * 2);
    enemy.body.setOffset(-mobDef.radius, -mobDef.radius);

    // Mapeia o Sprite correspondente do mob
    let spriteKey = 'mob_blood_ghoul';
    if (mobDef.id === 'bone_stalker') spriteKey = 'mob_bone_stalker';
    else if (mobDef.id === 'shadow_fiend') spriteKey = 'mob_shadow_fiend';
    else if (mobDef.id === 'magma_imp') spriteKey = 'mob_magma_imp';
    else if (mobDef.id === 'hell_knight') spriteKey = 'mob_hell_knight';

    const sprite = this.add.sprite(0, 0, spriteKey);
    enemy.add(sprite);
    enemy.sprite = sprite;

    // Barra de Vida Individual sobre a cabeça (Diablo style)
    const hpBar = this.add.graphics();
    hpBar.fillStyle(0x000000, 0.7);
    hpBar.fillRect(-18, -26, 36, 5);
    hpBar.fillStyle(0xff1744, 1);
    hpBar.fillRect(-18, -26, 36, 5);
    enemy.add(hpBar);
    enemy.hpBar = hpBar;

    enemy.mobId = mobDef.id;
    enemy.maxHp = mobDef.hp * (1 + (this.currentWave - 1) * 0.25);
    enemy.hp = enemy.maxHp;
    enemy.speed = mobDef.speed;
    enemy.dmg = mobDef.dmg;
    enemy.bloodDrop = mobDef.blood;
    enemy.isBoss = false;

    this.enemies.add(enemy);
  }

  spawnBoss() {
    this.isBossWave = true;
    audio.playBossRoar();
    this.cameras.main.shake(600, 0.03);

    const bDef = this.zoneData.boss;
    const angle = Math.random() * Math.PI * 2;
    const bx = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * 350, 120, 2280);
    const by = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * 350, 120, 2280);

    const boss = this.add.container(bx, by).setDepth(16);
    this.physics.world.enable(boss);
    boss.body.setSize(bDef.radius * 2, bDef.radius * 2);
    boss.body.setOffset(-bDef.radius, -bDef.radius);

    // Sprite do Boss (Gorgoroth = The Butcher, Ignarix = Titã das Cinzas)
    const bossKey = bDef.id === 'gorgoroth' ? 'boss_gorgoroth' : 'boss_ignarix';
    const bossSprite = this.add.sprite(0, 0, bossKey);
    boss.add(bossSprite);
    boss.sprite = bossSprite;

    boss.mobId = bDef.id;
    boss.name = bDef.name;
    boss.maxHp = bDef.hp;
    boss.hp = boss.maxHp;
    boss.speed = bDef.speed;
    boss.dmg = bDef.damage;
    boss.bloodDrop = bDef.bloodDrop;
    boss.isBoss = true;
    boss.attackTimer = 0;

    this.boss = boss;
    this.enemies.add(boss);

    this.showBossBanner(bDef);
  }

  showBossBanner(bDef) {
    const bannerBox = document.createElement('div');
    bannerBox.className = 'boss-arrival-banner diablo-banner';
    bannerBox.innerHTML = `
      <div class="boss-banner-sub">DEMÔNIO SUPREMO DO ABISMO</div>
      <h2>${bDef.name}</h2>
      <em>"${bDef.dialogue || 'AHH... CARNE FRESCA PARA A FORJA!'}"</em>
    `;
    document.body.appendChild(bannerBox);
    setTimeout(() => {
      bannerBox.style.opacity = '0';
      setTimeout(() => bannerBox.remove(), 400);
    }, 3500);
  }

  updateEnemies(dt, time) {
    this.enemies.getChildren().forEach(e => {
      if (!e.active || !e.body) return;

      if (e.isFrozen) {
        e.frozenTimer -= dt;
        e.body.setVelocity(0, 0);
        if (e.frozenTimer <= 0) e.isFrozen = false;
        return;
      }

      // Perseguição
      const angle = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
      e.body.setVelocity(Math.cos(angle) * e.speed, Math.sin(angle) * e.speed);

      // Virar sprite na direção da corrida
      if (e.sprite) {
        if (Math.cos(angle) < -0.1) e.sprite.setFlipX(true);
        else if (Math.cos(angle) > 0.1) e.sprite.setFlipX(false);
      }

      // Dano de contato ao herói com I-Frames
      const dist = Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y);
      if (dist < 32 && this.playerHurtCooldown <= 0) {
        this.hitPlayer(e.dmg);
      }

      // Padrões do Chefe
      if (e.isBoss) {
        e.attackTimer += dt;
        if (e.attackTimer >= 4.0) {
          e.attackTimer = 0;
          this.executeBossTelegraphAttack(e);
        }
      }
    });
  }

  executeBossTelegraphAttack(boss) {
    // Telegrafia estilo Diablo: círculo vermelho com runas pulsando
    const warnGfx = this.add.graphics({ depth: 5 });
    warnGfx.lineStyle(3, 0xff0000, 0.9);
    warnGfx.fillStyle(0xff0000, 0.25);
    warnGfx.strokeCircle(this.player.x, this.player.y, 150);
    warnGfx.fillCircle(this.player.x, this.player.y, 150);

    const targetX = this.player.x;
    const targetY = this.player.y;

    this.time.delayedCall(1200, () => {
      warnGfx.destroy();
      audio.playBossRoar();
      this.cameras.main.shake(300, 0.025);

      // Fissura de sangue no chão
      const crack = this.add.sprite(targetX, targetY, 'blood_pool_2').setDepth(3);
      crack.setScale(1.6);

      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, targetX, targetY);
      if (d <= 150) {
        this.hitPlayer(50);
      }
    });
  }

  hitPlayer(amount) {
    if (this.invulnerableTimer > 0 || this.playerHurtCooldown > 0) return;

    this.playerHurtCooldown = 0.45; // I-Frames essenciais
    const reduction = this.player.armor / (this.player.armor + 50);
    const effectiveDmg = Math.max(1, amount * (1 - reduction));

    this.player.hp -= effectiveDmg;
    audio.playPlayerHurt();
    this.cameras.main.shake(140, 0.01);

    // Efeito de sangue na tela
    this.player.setAlpha(0.35);
    this.time.delayedCall(80, () => { if (this.player.active) this.player.setAlpha(1.0); });

    if (this.player.hp <= 0) {
      this.player.hp = 0;
      this.onPlayerDefeated();
    }
  }

  updateBloodMagnet(dt) {
    const radius = this.player.pickupRadius + (this.pet ? this.pet.vacuumRadius : 0);

    this.bloodDrops.getChildren().forEach(orb => {
      if (!orb.active) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, orb.x, orb.y);
      if (d <= radius) {
        const ang = Phaser.Math.Angle.Between(orb.x, orb.y, this.player.x, this.player.y);
        const pullSpeed = 460;
        orb.x += Math.cos(ang) * pullSpeed * dt;
        orb.y += Math.sin(ang) * pullSpeed * dt;

        if (d <= 24) {
          audio.playBloodPickup();
          this.runBlood += orb.bloodValue;
          orb.destroy();
        }
      }
    });
  }

  // ==========================================
  // HUD CLÁSSICO DO DIABLO (HEALTH GLOBE + RESOURCE GLOBE)
  // ==========================================
  createDiabloHUD() {
    this.hudContainer = document.createElement('div');
    this.hudContainer.id = 'game-hud-overlay';
    this.hudContainer.className = 'diablo-hud-container';

    this.hudContainer.innerHTML = `
      <!-- Topo: Medidor de Onda & Tempo em Pergaminho Entalhado -->
      <div class="diablo-top-header">
        <div class="diablo-wave-banner">
          <span class="banner-skull">💀</span>
          <span class="banner-wave-text" id="hud-wave-title">ONDA ${this.currentWave} / ${this.zoneData.wavesCount}</span>
          <span class="banner-timer-text" id="hud-wave-timer">00:35</span>
        </div>
        <button class="btn-diablo-pause" id="btn-hud-pause" title="Pausar Jogo (ESC)">⏸️</button>
      </div>

      <!-- Barra de Vida do Chefe Estilo Diablo -->
      <div class="diablo-boss-bar-wrap" id="hud-boss-bar" style="display:none">
        <div class="boss-bar-gargoyle-l">👹</div>
        <div class="boss-bar-inner">
          <div class="boss-bar-name" id="hud-boss-name">THE BUTCHER</div>
          <div class="boss-bar-track">
            <div class="boss-bar-fill" id="hud-boss-fill" style="width:100%"></div>
          </div>
        </div>
        <div class="boss-bar-gargoyle-r">👹</div>
      </div>

      <!-- Rodapé: O Lendário Health Globe e Action Bar do Diablo -->
      <div class="diablo-bottom-bar">
        <!-- ESFERA DE VIDA (HEALTH GLOBE) À ESQUERDA -->
        <div class="diablo-globe-container health-globe" title="Vida do Herói">
          <div class="globe-ornament-angel">👼</div>
          <div class="globe-glass">
            <div class="globe-liquid health-liquid" id="globe-hp-liquid" style="height: 100%"></div>
            <div class="globe-highlight"></div>
            <span class="globe-text" id="globe-hp-text">150 / 150</span>
          </div>
        </div>

        <!-- BARRA CENTRAL DE AÇÕES (ACTION BAR) -->
        <div class="diablo-action-bar-frame">
          <div class="action-slot-group">
            <!-- Slot 1: Poção -->
            <button class="diablo-action-slot" id="hud-btn-potion" title="Beber Poção de Sangue (Tecla 1)">
              <span class="slot-key">1</span>
              <span class="slot-icon">🧪</span>
              <span class="slot-badge" id="hud-potion-badge">3</span>
            </button>
            <!-- Slot 2: Dash -->
            <button class="diablo-action-slot" id="hud-btn-dash" title="Investida / Esquiva (Espaço)">
              <span class="slot-key">ESPAÇO</span>
              <span class="slot-icon">⚡</span>
              <span class="slot-cd" id="hud-cd-dash"></span>
            </button>
            <!-- Slot 3: Habilidade Ativa -->
            <button class="diablo-action-slot" id="hud-btn-active" title="Habilidade de Classe (E)">
              <span class="slot-key">E</span>
              <span class="slot-icon">💥</span>
              <span class="slot-cd" id="hud-cd-active"></span>
            </button>
            <!-- Slot 4: Suprema -->
            <button class="diablo-action-slot ult-slot" id="hud-btn-ult" title="Suprema Arcana (Q)">
              <span class="slot-key">Q</span>
              <span class="slot-icon">👑</span>
              <span class="slot-cd" id="hud-cd-ult"></span>
            </button>
            <!-- Slot 5: Forja em Tempo Real -->
            <button class="diablo-action-slot forge-slot" id="btn-hud-forge" title="Forja em Tempo Real (F)">
              <span class="slot-key">F</span>
              <span class="slot-icon">🔥</span>
              <span class="slot-label">FORJA</span>
            </button>
          </div>
        </div>

        <!-- ESFERA DE RECURSO (RESOURCE GLOBE - SANGUE) À DIREITA -->
        <div class="diablo-globe-container resource-globe" title="Sangue Profano Acumulado">
          <div class="globe-ornament-demon">👿</div>
          <div class="globe-glass">
            <div class="globe-liquid blood-liquid" id="globe-blood-liquid" style="height: 60%"></div>
            <div class="globe-highlight"></div>
            <span class="globe-text" id="globe-blood-text">🩸 0</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.hudContainer);

    // Binds de botões
    document.getElementById('hud-btn-potion').onclick = () => this.useHealthPotion();
    document.getElementById('hud-btn-dash').onclick = () => { if (this.dashCooldown <= 0) this.triggerDash(); };
    document.getElementById('hud-btn-active').onclick = () => { if (this.activeSkillCooldown <= 0) this.triggerActiveSkill(); };
    document.getElementById('hud-btn-ult').onclick = () => { if (this.ultimateSkillCooldown <= 0) this.triggerUltimateSkill(); };
    document.getElementById('btn-hud-forge').onclick = () => this.openInRunForgeModal();
    document.getElementById('btn-hud-pause').onclick = () => this.togglePause();
  }

  updateDiabloHUD() {
    if (!this.hudContainer) return;

    // 1. Health Globe Líquido
    const hpPct = Math.max(0, Math.min(100, (this.player.hp / this.player.maxHp) * 100));
    const hpLiquid = document.getElementById('globe-hp-liquid');
    const hpText = document.getElementById('globe-hp-text');
    if (hpLiquid) hpLiquid.style.height = `${hpPct}%`;
    if (hpText) hpText.textContent = `${Math.ceil(this.player.hp)} / ${Math.ceil(this.player.maxHp)}`;

    // 2. Resource Globe Líquido (Sangue)
    const bloodPct = Math.min(100, (this.runBlood / 150) * 100);
    const bloodLiquid = document.getElementById('globe-blood-liquid');
    const bloodText = document.getElementById('globe-blood-text');
    if (bloodLiquid) bloodLiquid.style.height = `${Math.max(15, bloodPct)}%`;
    if (bloodText) bloodText.textContent = `🩸 ${this.runBlood}`;

    // 3. Poção
    const potBadge = document.getElementById('hud-potion-badge');
    if (potBadge) potBadge.textContent = this.potionCharges;

    // 4. Cooldowns
    const cdDash = document.getElementById('hud-cd-dash');
    const cdAct = document.getElementById('hud-cd-active');
    const cdUlt = document.getElementById('hud-cd-ult');
    if (cdDash) cdDash.textContent = this.dashCooldown > 0 ? this.dashCooldown.toFixed(1) : '';
    if (cdAct) cdAct.textContent = this.activeSkillCooldown > 0 ? this.activeSkillCooldown.toFixed(1) : '';
    if (cdUlt) cdUlt.textContent = this.ultimateSkillCooldown > 0 ? this.ultimateSkillCooldown.toFixed(1) : '';

    // 5. Onda & Timer
    const waveTitle = document.getElementById('hud-wave-title');
    const waveTimer = document.getElementById('hud-wave-timer');
    if (waveTitle) {
      waveTitle.textContent = this.isBossWave ? '⚠️ CONFRONTO COM O CHEFE!' : `ONDA ${this.currentWave} / ${this.zoneData.wavesCount}`;
    }
    if (waveTimer) {
      const rem = Math.max(0, Math.ceil(this.waveTimer - this.waveElapsed));
      waveTimer.textContent = `00:${rem < 10 ? '0' : ''}${rem}`;
    }

    // 6. Barra do Boss
    const bossWrap = document.getElementById('hud-boss-bar');
    if (bossWrap) {
      if (this.boss && this.boss.active && this.boss.hp > 0) {
        bossWrap.style.display = 'flex';
        const bossName = document.getElementById('hud-boss-name');
        const bossFill = document.getElementById('hud-boss-fill');
        if (bossName) bossName.textContent = this.boss.name;
        if (bossFill) bossFill.style.width = `${Math.max(0, (this.boss.hp / this.boss.maxHp) * 100)}%`;
      } else {
        bossWrap.style.display = 'none';
      }
    }
  }

  // ==========================================
  // FORJA EM TEMPO REAL & PAUSA TÁTICA
  // ==========================================
  openInRunForgeModal() {
    if (this.forgeModalOpen) return;
    this.forgeModalOpen = true;
    this.physics.pause();
    crazyGames.gameplayStop();
    audio.playForgeHammer();

    const recipes = this.forgeManager.getRandomRecipes(3);
    const modal = document.createElement('div');
    modal.className = 'inrun-forge-modal-overlay diablo-modal';
    modal.innerHTML = `
      <div class="inrun-forge-box diablo-forge-box">
        <div class="forge-box-header">
          <h2>🔥 FORJA DE SANGUE EM TEMPO REAL</h2>
          <span class="forge-avail-blood">Sangue Disponível: 🩸 ${this.runBlood}</span>
        </div>
        <p class="forge-subtitle">Utilize o sangue inimigo recolhido para temperar seu aço e moldar relíquias nesta batalha!</p>
        <div class="forge-cards-row" id="forge-cards-container"></div>
        <button class="btn-close-forge diablo-btn" id="btn-close-forge">RETORNAR AO COMBATE ➔</button>
      </div>
    `;

    const container = modal.querySelector('#forge-cards-container');
    recipes.forEach(rec => {
      const card = document.createElement('div');
      card.className = `forge-recipe-card ${this.runBlood >= rec.cost ? 'affordable' : 'locked'}`;
      card.innerHTML = `
        <div class="recipe-icon">${rec.icon}</div>
        <h3>${rec.name}</h3>
        <p>${rec.desc}</p>
        <button class="btn-craft-recipe diablo-craft-btn" ${this.runBlood < rec.cost ? 'disabled' : ''}>
          FORJAR (🩸 ${rec.cost})
        </button>
      `;

      card.querySelector('.btn-craft-recipe').onclick = () => {
        if (this.forgeManager.craft(rec, this.runBlood, this.player)) {
          this.runBlood -= rec.cost;
          modal.remove();
          this.forgeModalOpen = false;
          this.physics.resume();
          crazyGames.gameplayStart();
        }
      };

      container.appendChild(card);
    });

    modal.querySelector('#btn-close-forge').onclick = () => {
      audio.playButtonClick();
      modal.remove();
      this.forgeModalOpen = false;
      this.physics.resume();
      crazyGames.gameplayStart();
    };

    document.body.appendChild(modal);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.physics.pause();
      crazyGames.gameplayStop();
      this.showPauseModal();
    } else {
      const p = document.querySelector('.pause-modal-overlay');
      if (p) p.remove();
      this.physics.resume();
      crazyGames.gameplayStart();
    }
  }

  showPauseModal() {
    const modal = document.createElement('div');
    modal.className = 'pause-modal-overlay diablo-modal';
    modal.innerHTML = `
      <div class="pause-box diablo-pause-box">
        <h2>BATALHA EM PAUSA</h2>
        <p>A forja aguarda seu retorno, herói.</p>
        <div class="pause-actions">
          <button class="diablo-btn" id="btn-resume">CONTINUAR BATALHA</button>
          <button class="diablo-btn-alt" id="btn-quit">ABANDONAR E IR AO HUB</button>
        </div>
      </div>
    `;

    modal.querySelector('#btn-resume').onclick = () => this.togglePause();
    modal.querySelector('#btn-quit').onclick = () => {
      modal.remove();
      this.cleanupAndExit();
    };
    document.body.appendChild(modal);
  }

  // ==========================================
  // DERROTA & REVIVE
  // ==========================================
  onPlayerDefeated() {
    this.isGameOver = true;
    crazyGames.gameplayStop();

    if (!this.reviveUsed) {
      this.showReviveModal();
    } else {
      this.showGameOverModal();
    }
  }

  showReviveModal() {
    const modal = document.createElement('div');
    modal.className = 'revive-modal-overlay diablo-modal';
    modal.innerHTML = `
      <div class="revive-box diablo-revive-box">
        <div class="revive-icon">💀✨</div>
        <h2>SEU HERÓI CAIU PERANTE O ABISMO!</h2>
        <p>A Forja Sagrada concede uma chance única de ressurreição com <strong>3 segundos de invulnerabilidade absoluta</strong>!</p>
        <button class="btn-watch-revive diablo-btn-gold" id="btn-revive-ad">
          <span>🎬 REVIVER AGORA (REWARDED AD)</span>
        </button>
        <button class="btn-give-up" id="btn-give-up">ACEITAR A MORTE</button>
      </div>
    `;

    modal.querySelector('#btn-revive-ad').onclick = () => {
      crazyGames.showRewardedAd('revive', () => {
        modal.remove();
        this.revivePlayer();
      }, () => {
        modal.remove();
        this.showGameOverModal();
      });
    };

    modal.querySelector('#btn-give-up').onclick = () => {
      modal.remove();
      this.showGameOverModal();
    };

    document.body.appendChild(modal);
  }

  revivePlayer() {
    this.reviveUsed = true;
    this.isGameOver = false;
    this.player.hp = Math.round(this.player.maxHp * 0.7);
    this.invulnerableTimer = 3.0;
    this.potionCharges = 3;
    audio.playReviveAura();
    crazyGames.gameplayStart();

    this.enemies.getChildren().forEach(e => {
      if (!e.active) return;
      const d = Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y);
      if (d < 220) {
        e.x += (e.x - this.player.x) * 1.8;
        e.y += (e.y - this.player.y) * 1.8;
      }
    });
  }

  showGameOverModal() {
    audio.playBossRoar();
    crazyGames.showMidgameAd();

    saveManager.addBlood(this.runBlood);
    this.runLootDrops.forEach(item => saveManager.data.inventory.push(item));
    saveManager.recordScore(this.zoneId, this.currentWave);

    const modal = document.createElement('div');
    modal.className = 'gameover-modal-overlay diablo-modal';
    modal.innerHTML = `
      <div class="gameover-box diablo-gameover-box">
        <h2 class="defeat-title">DERROTA NA CRIPTA SAGRADA</h2>
        <div class="run-stats-card diablo-stats-card">
          <div><span>Ondas Sobrevividas:</span> <strong>${this.currentWave}</strong></div>
          <div><span>Inimigos Ceifados:</span> <strong>${this.runKills}</strong></div>
          <div><span>Sangue Conquistado:</span> <strong>🩸 ${this.runBlood}</strong></div>
          <div><span>Equipamentos Obtidos:</span> <strong>🎁 ${this.runLootDrops.length}</strong></div>
        </div>

        <button class="btn-double-rewards diablo-btn-gold" id="btn-double-rewards">
          🎬 DOBRAR SANGUE COLETADO (2x: +🩸 ${this.runBlood})
        </button>

        <button class="btn-return-hub diablo-btn" id="btn-return-hub">RETORNAR AO SANTUÁRIO ➔</button>
      </div>
    `;

    modal.querySelector('#btn-double-rewards').onclick = (e) => {
      crazyGames.showRewardedAd('double_rewards', () => {
        saveManager.addBlood(this.runBlood);
        e.target.disabled = true;
        e.target.textContent = '✅ RECOMPENSAS DOBRADAS!';
      });
    };

    modal.querySelector('#btn-return-hub').onclick = () => {
      modal.remove();
      this.cleanupAndExit();
    };

    document.body.appendChild(modal);
  }

  onBossDefeated() {
    this.isVictory = true;
    crazyGames.gameplayStop();
    audio.playLevelUp();

    const victoryBonus = 180;
    saveManager.addBlood(this.runBlood + victoryBonus);
    saveManager.addMetal(45);
    this.runLootDrops.forEach(item => saveManager.data.inventory.push(item));
    saveManager.recordScore(this.zoneId, this.currentWave);

    const modal = document.createElement('div');
    modal.className = 'gameover-modal-overlay diablo-modal victory';
    modal.innerHTML = `
      <div class="gameover-box diablo-victory-box">
        <h2 class="victory-title">👑 O MAL FOI EXPULSO!</h2>
        <p class="victory-sub">O Chefe Supremo sucumbiu e o sangue profano foi purificado pelo fogo da forja!</p>
        <div class="run-stats-card diablo-stats-card">
          <div><span>Zona Purificada:</span> <strong>${this.zoneData.name}</strong></div>
          <div><span>Inimigos Ceifados:</span> <strong>${this.runKills}</strong></div>
          <div><span>Sangue Total:</span> <strong>🩸 ${this.runBlood + victoryBonus}</strong></div>
          <div><span>Metal Arcano Extra:</span> <strong>🔨 45</strong></div>
        </div>

        <button class="btn-double-rewards diablo-btn-gold" id="btn-double-vic">
          🎬 DOBRAR RECOMPENSAS FINAIS (2x)
        </button>

        <button class="btn-return-hub diablo-btn" id="btn-vic-return">GLÓRIA AO FERREIRO (HUB) ➔</button>
      </div>
    `;

    modal.querySelector('#btn-double-vic').onclick = (e) => {
      crazyGames.showRewardedAd('double_rewards', () => {
        saveManager.addBlood(this.runBlood + victoryBonus);
        saveManager.addMetal(45);
        e.target.disabled = true;
        e.target.textContent = '✅ RECOMPENSAS DOBRADAS!';
      });
    };

    modal.querySelector('#btn-vic-return').onclick = () => {
      modal.remove();
      this.cleanupAndExit();
    };

    document.body.appendChild(modal);
  }

  cleanupAndExit() {
    const overlays = [
      '#game-hud-overlay',
      '.inrun-forge-modal-overlay',
      '.revive-modal-overlay',
      '.gameover-modal-overlay',
      '.pause-modal-overlay',
      '.boss-arrival-banner'
    ];
    overlays.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.remove());
    });

    audio.stopBgm();
    window.dispatchEvent(new CustomEvent('return_to_hub'));
  }
}
