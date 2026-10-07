/**
 * src/scenes/GameScene.js - Arena Principal ARPG Survivors em Phaser 3
 * Combate fluido a 60 FPS, Forja em Tempo Real, Corvo Pet, Chefes com ataques telegrafados,
 * HUD Responsivo, e Integração Blindada CrazyGames SDK v3 (Revive 1x + Dobrar Recompensas).
 */

import Phaser from 'phaser';
import { HEROES } from '../data/heroes.js';
import { ZONES } from '../data/zones.js';
import { ArcanePet } from '../engine/Pet.js';
import { InRunForgeManager } from '../engine/InRunForge.js';
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
    this.waveTimer = 35; // segundos por onda
    this.waveElapsed = 0;
    this.isBossWave = false;
    this.boss = null;
    this.isGameOver = false;
    this.isVictory = false;
    this.reviveUsed = false;
    this.invulnerableTimer = 0;

    // Recursos da corrida
    this.runBlood = 0;
    this.runKills = 0;
    this.runLootDrops = [];

    // Cooldowns de habilidades
    this.activeSkillCooldown = 0;
    this.ultimateSkillCooldown = 0;
    this.dashCooldown = 0;

    // Carrega dados do herói selecionado
    const save = saveManager.data;
    this.heroConfig = HEROES[save.selectedHero] || HEROES.ignis;
    this.heroTalents = save.heroTalents[this.heroConfig.id] || {};
    this.equipped = save.equipped || {};
  }

  create() {
    // Inicialização da física e limites do mapa
    this.physics.world.setBounds(0, 0, 2400, 2400);

    // Fundo da arena estilizado
    this.createArenaGrid();

    // Grupos de entidades
    this.enemies = this.add.group();
    this.projectiles = this.physics.add.group();
    this.enemyProjectiles = this.physics.add.group();
    this.bloodDrops = this.physics.add.group();
    this.floatingTexts = this.add.group();

    // Criação do Jogador
    this.createPlayer();

    // Criação do Pet Arcano
    this.pet = new ArcanePet(this, this.player);

    // Sistema de Forja em Tempo Real
    this.forgeManager = new InRunForgeManager(this);

    // Câmera seguindo suavemente
    this.cameras.main.setBounds(0, 0, 2400, 2400);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // Controles de Teclado
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
      pause: Phaser.Input.Keyboard.KeyCodes.ESC
    });

    // Tecla de Forja rápida
    this.input.keyboard.on('keydown-F', () => this.openInRunForgeModal());
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());

    // Spawner de Inimigos
    this.spawnTimer = 0;
    this.spawnInterval = 1.2; // segundos

    // Ataque Primário Automático
    this.attackTimer = 0;
    this.attackInterval = 0.55;

    // Interface HUD
    this.createHUD();

    // Inicia CrazyGames gameplayStart & BGM
    crazyGames.gameplayStart();
    audio.startGothicBgm('combat');

    // Transição suave de câmera
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  createArenaGrid() {
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(this.zoneData.ambientColor, 1);
    bgGraphics.fillRect(0, 0, 2400, 2400);

    // Linhas de ladrilhos góticos
    bgGraphics.lineStyle(1, this.zoneData.gridColor, 0.4);
    const tileSize = 80;
    for (let x = 0; x <= 2400; x += tileSize) {
      bgGraphics.moveTo(x, 0);
      bgGraphics.lineTo(x, 2400);
    }
    for (let y = 0; y <= 2400; y += tileSize) {
      bgGraphics.moveTo(0, y);
      bgGraphics.lineTo(2400, y);
    }
    bgGraphics.strokePath();

    // Rúnica central da Forja Sagrada
    bgGraphics.lineStyle(3, 0xff1744, 0.6);
    bgGraphics.strokeCircle(1200, 1200, 180);
    bgGraphics.strokeCircle(1200, 1200, 90);
  }

  createPlayer() {
    this.player = this.add.container(1200, 1200);
    this.physics.world.enable(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setSize(32, 32);
    this.player.body.setOffset(-16, -16);

    // Gráficos do Herói
    const baseCol = Phaser.Display.Color.HexStringToColor(this.heroConfig.color).color;
    const bodyGfx = this.add.graphics();

    // Sombra
    bodyGfx.fillStyle(0x000000, 0.4);
    bodyGfx.fillEllipse(0, 14, 30, 12);

    // Corpo
    bodyGfx.fillStyle(baseCol, 1);
    bodyGfx.fillCircle(0, 0, 16);

    // Anel de armadura / Forja
    bodyGfx.lineStyle(2, 0xffffff, 0.8);
    bodyGfx.strokeCircle(0, 0, 16);

    // Marcador de frente/arma
    bodyGfx.fillStyle(0xffd700, 1);
    bodyGfx.fillRect(8, -4, 12, 8);

    this.player.add(bodyGfx);
    this.playerGfx = bodyGfx;

    // Aura de Invulnerabilidade
    this.invulnAura = this.add.graphics({ depth: 25 });
    this.invulnAura.setVisible(false);

    // Estatísticas Calculadas (Base + Equipamentos + Talentos)
    const base = this.heroConfig.baseStats;
    let bonusHp = 0;
    let bonusDmg = 0;
    let bonusArmor = 0;
    let bonusSpeed = 0;

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
  // LOOP DE ATUALIZAÇÃO (60 FPS)
  // ==========================================
  update(time, delta) {
    if (this.isGameOver || this.isVictory || this.isPaused) return;
    const dt = delta / 1000;

    // 1. Movimentação do Jogador
    this.handlePlayerMovement(dt);

    // 2. Invulnerabilidade
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
      this.invulnAura.clear();
      this.invulnAura.fillStyle(0xffd700, 0.4 + Math.sin(time * 0.02) * 0.2);
      this.invulnAura.fillCircle(this.player.x, this.player.y, 30);
      this.invulnAura.setVisible(true);
      if (this.invulnerableTimer <= 0) {
        this.invulnAura.setVisible(false);
      }
    }

    // 3. Atualização do Pet Arcano
    if (this.pet) {
      this.pet.update(time, delta);
    }

    // 4. Temporizador de Onda & Spawns
    this.updateWaveTimer(dt);

    // 5. Cooldowns de Habilidades
    if (this.activeSkillCooldown > 0) this.activeSkillCooldown -= dt;
    if (this.ultimateSkillCooldown > 0) this.ultimateSkillCooldown -= dt;
    if (this.dashCooldown > 0) this.dashCooldown -= dt;

    // 6. Ataque Primário Automático
    this.attackTimer += dt;
    if (this.attackTimer >= this.attackInterval) {
      this.attackTimer = 0;
      this.autoAttackNearest();
    }

    // 7. Atualização dos Inimigos & IA
    this.updateEnemies(dt);

    // 8. Coleta de Sangue & Vácuo
    this.updateBloodMagnet(dt);

    // 9. Atualização do HUD
    this.updateHUD();
  }

  handlePlayerMovement(dt) {
    let moveX = 0;
    let moveY = 0;

    if (this.cursors.left.isDown || this.cursors.leftArrow.isDown) moveX -= 1;
    if (this.cursors.right.isDown || this.cursors.rightArrow.isDown) moveX += 1;
    if (this.cursors.up.isDown || this.cursors.upArrow.isDown) moveY -= 1;
    if (this.cursors.down.isDown || this.cursors.downArrow.isDown) moveY += 1;

    // Virtual Joystick se em mobile
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
      this.player.rotation = Math.atan2(normY, normX);
    } else {
      this.player.body.setVelocity(0, 0);
    }

    // Dash (Espaço)
    if (Phaser.Input.Keyboard.JustDown(this.cursors.dash) && this.dashCooldown <= 0) {
      this.triggerDash();
    }

    // Habilidade Ativa (E)
    if (Phaser.Input.Keyboard.JustDown(this.cursors.skill) && this.activeSkillCooldown <= 0) {
      this.triggerActiveSkill();
    }

    // Habilidade Suprema (Q)
    if (Phaser.Input.Keyboard.JustDown(this.cursors.ult) && this.ultimateSkillCooldown <= 0) {
      this.triggerUltimateSkill();
    }
  }

  triggerDash() {
    this.dashCooldown = 2.0;
    audio.playDash();
    const curVx = this.player.body.velocity.x;
    const curVy = this.player.body.velocity.y;
    const dashSpeed = 550;
    if (curVx !== 0 || curVy !== 0) {
      const len = Math.hypot(curVx, curVy);
      this.player.body.setVelocity((curVx / len) * dashSpeed, (curVy / len) * dashSpeed);
    } else {
      this.player.body.setVelocity(Math.cos(this.player.rotation) * dashSpeed, Math.sin(this.player.rotation) * dashSpeed);
    }

    // Rastro visual
    const ghost = this.add.graphics();
    ghost.fillStyle(0x00f5ff, 0.4);
    ghost.fillCircle(this.player.x, this.player.y, 18);
    this.tweens.add({
      targets: ghost,
      alpha: 0,
      duration: 300,
      onComplete: () => ghost.destroy()
    });
  }

  triggerActiveSkill() {
    const skill = this.heroConfig.activeSkill;
    this.activeSkillCooldown = skill.cooldown;
    audio.playFireExplosion();

    if (this.heroConfig.id === 'ignis') {
      // Bigorna Astral
      this.cameras.main.shake(180, 0.01);
      const anvilGfx = this.add.graphics();
      anvilGfx.fillStyle(0xff4500, 0.8);
      anvilGfx.fillCircle(this.player.x, this.player.y, skill.radius);
      this.tweens.add({
        targets: anvilGfx,
        alpha: 0,
        scale: 1.3,
        duration: 400,
        onComplete: () => anvilGfx.destroy()
      });

      this.damageArea(this.player.x, this.player.y, skill.radius, skill.damage * this.player.damageMult);
    } else if (this.heroConfig.id === 'valkyrie') {
      // Dança das Lâminas 360°
      audio.playSlash();
      const count = 8 + (this.player.extraProjectiles || 0) * 2;
      for (let i = 0; i < count; i++) {
        const ang = (Math.PI * 2 / count) * i;
        this.spawnBladeProjectile(this.player.x, this.player.y, ang, skill.damage);
      }
    } else if (this.heroConfig.id === 'malakor') {
      // Nova Glacial
      audio.playFrostNova();
      const frostGfx = this.add.graphics();
      frostGfx.fillStyle(0x00f5ff, 0.6);
      frostGfx.fillCircle(this.player.x, this.player.y, skill.radius);
      this.tweens.add({
        targets: frostGfx,
        alpha: 0,
        duration: 500,
        onComplete: () => frostGfx.destroy()
      });
      this.damageArea(this.player.x, this.player.y, skill.radius, skill.damage * this.player.damageMult, 'freeze');
    }
  }

  triggerUltimateSkill() {
    const ult = this.heroConfig.ultimateSkill;
    this.ultimateSkillCooldown = ult.cooldown;
    this.cameras.main.shake(300, 0.02);

    if (this.heroConfig.id === 'ignis') {
      // Forja do Caos (Aura de chamas contínuas por 6s)
      audio.playFireExplosion();
      let ticks = 0;
      const interval = this.time.addEvent({
        delay: 500,
        repeat: 11,
        callback: () => {
          this.damageArea(this.player.x, this.player.y, 160, 45 * this.player.damageMult);
          const ring = this.add.graphics();
          ring.lineStyle(4, 0xff2200, 0.9);
          ring.strokeCircle(this.player.x, this.player.y, 160);
          this.tweens.add({ targets: ring, alpha: 0, duration: 300, onComplete: () => ring.destroy() });
        }
      });
    } else if (this.heroConfig.id === 'valkyrie') {
      // Vórtice Sanguíneo (Puxa e destrói monstros)
      audio.playReviveAura();
      this.vortexActive = true;
      let ticks = 0;
      this.time.addEvent({
        delay: 400,
        repeat: 12,
        callback: () => {
          this.enemies.getChildren().forEach(e => {
            if (!e.active) return;
            const dist = Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y);
            if (dist < 400) {
              const ang = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
              e.x += Math.cos(ang) * 14;
              e.y += Math.sin(ang) * 14;
              this.applyDamageToEnemy(e, 35 * this.player.damageMult);
            }
          });
        }
      });
    } else if (this.heroConfig.id === 'malakor') {
      // Cataclismo Cósmico (Meteoro nos inimigos)
      audio.playBossRoar();
      for (let i = 0; i < 12; i++) {
        this.time.delayedCall(i * 180, () => {
          const rx = this.player.x + (Math.random() - 0.5) * 600;
          const ry = this.player.y + (Math.random() - 0.5) * 600;
          const meteor = this.add.graphics();
          meteor.fillStyle(0x7928ca, 0.9);
          meteor.fillCircle(rx, ry, 60);
          this.tweens.add({ targets: meteor, alpha: 0, duration: 400, onComplete: () => meteor.destroy() });
          this.damageArea(rx, ry, 70, 75 * this.player.damageMult);
        });
      }
    }
  }

  // ==========================================
  // ATAQUE AUTOMÁTICO BÁSICO
  // ==========================================
  autoAttackNearest() {
    let nearest = null;
    let minDist = 380;

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
    proj.body.setSize(12, 12);
    proj.body.setOffset(-6, -6);

    const isFire = this.player.hasFireTrails || this.heroConfig.id === 'ignis';
    proj.fillStyle(isFire ? 0xff4500 : 0x00f5ff, 1);
    proj.fillCircle(0, 0, 7);

    proj.x = x;
    proj.y = y;
    proj.body.setVelocity(Math.cos(angle) * 480, Math.sin(angle) * 480);

    const dmg = this.player.damage * this.player.damageMult;
    const isCrit = Math.random() < this.player.critChance;
    const finalDmg = isCrit ? dmg * this.player.critDamage : dmg;

    // Destrói após 1.4s
    this.time.delayedCall(1400, () => {
      if (proj.active) proj.destroy();
    });

    // Colisão com inimigos
    this.physics.add.overlap(proj, this.enemies, (p, enemy) => {
      if (!enemy.active || enemy.hp <= 0) return;
      this.applyDamageToEnemy(enemy, finalDmg, isCrit);
      if (this.player.hasLightningProc && Math.random() < 0.3) {
        this.procLightning(enemy);
      }
      p.destroy();
    });
  }

  spawnBladeProjectile(x, y, angle, damage) {
    const blade = this.add.graphics({ depth: 20 });
    this.physics.world.enable(blade);
    blade.body.setSize(14, 14);
    blade.body.setOffset(-7, -7);

    blade.fillStyle(0xe60049, 1);
    blade.fillTriangle(0, -6, 12, 0, 0, 6);
    blade.x = x;
    blade.y = y;
    blade.rotation = angle;
    blade.body.setVelocity(Math.cos(angle) * 420, Math.sin(angle) * 420);

    this.time.delayedCall(1200, () => { if (blade.active) blade.destroy(); });

    this.physics.add.overlap(blade, this.enemies, (b, enemy) => {
      if (!enemy.active || enemy.hp <= 0) return;
      this.applyDamageToEnemy(enemy, damage * this.player.damageMult);
      b.destroy();
    });
  }

  spawnPetProjectile(x, y, target, damage) {
    const angle = Phaser.Math.Angle.Between(x, y, target.x, target.y);
    const feather = this.add.graphics({ depth: 20 });
    this.physics.world.enable(feather);
    feather.body.setSize(10, 10);
    feather.fillStyle(0x38bdf8, 1);
    feather.fillCircle(0, 0, 5);
    feather.x = x;
    feather.y = y;
    feather.body.setVelocity(Math.cos(angle) * 520, Math.sin(angle) * 520);

    this.time.delayedCall(1000, () => { if (feather.active) feather.destroy(); });

    this.physics.add.overlap(feather, this.enemies, (f, enemy) => {
      if (!enemy.active || enemy.hp <= 0) return;
      this.applyDamageToEnemy(enemy, damage);
      f.destroy();
    });
  }

  procLightning(target) {
    audio.playFrostNova();
    const beam = this.add.graphics({ depth: 22 });
    beam.lineStyle(2, 0xffff00, 1);
    beam.moveTo(target.x, target.y);
    beam.lineTo(target.x + (Math.random() - 0.5) * 80, target.y + (Math.random() - 0.5) * 80);
    beam.strokePath();
    this.tweens.add({ targets: beam, alpha: 0, duration: 250, onComplete: () => beam.destroy() });
    this.damageArea(target.x, target.y, 80, 25 * this.player.damageMult);
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

    // Vampirismo
    if (this.player.vampirism > 0) {
      const heal = damage * this.player.vampirism;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
    }

    // Feedback visual (flash branco)
    enemy.setTintFill(0xffffff);
    this.time.delayedCall(70, () => {
      if (enemy.active) enemy.clearTint();
    });

    if (enemy.hp <= 0) {
      this.onEnemyKilled(enemy);
    }
  }

  showDamageNumber(x, y, amount, isCrit) {
    const text = this.add.text(x + (Math.random() - 0.5) * 16, y - 10, `${amount}${isCrit ? '!' : ''}`, {
      fontSize: isCrit ? '18px' : '13px',
      fontStyle: 'bold',
      color: isCrit ? '#ffd700' : '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setDepth(30);

    this.tweens.add({
      targets: text,
      y: y - 45,
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

    // Drop de Sangue Profano
    const bloodAmount = Math.max(1, Math.round((enemy.bloodDrop || 2) * this.player.bloodMultiplier));
    this.spawnBloodDrop(enemy.x, enemy.y, bloodAmount);

    // Chance de Loot de Equipamento (12% em monstros normais, 100% em chefes)
    if (enemy.isBoss || Math.random() < 0.12) {
      const rarity = enemy.isBoss ? (Math.random() < 0.4 ? 'mythic' : 'legendary') : null;
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
    const orb = this.add.graphics({ depth: 10 });
    this.physics.world.enable(orb);
    orb.body.setSize(16, 16);
    orb.body.setOffset(-8, -8);

    orb.fillStyle(0xff0044, 0.9);
    orb.fillCircle(0, 0, 7);
    orb.lineStyle(1.5, 0xff758c, 1);
    orb.strokeCircle(0, 0, 7);

    orb.x = x;
    orb.y = y;
    orb.bloodValue = value;
    this.bloodDrops.add(orb);
  }

  showLootNotification(item) {
    const notice = this.add.text(this.player.x, this.player.y - 70, `+ ${item.name} (${item.rarityName})`, {
      fontSize: '14px',
      fontStyle: 'bold',
      color: item.color,
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: { x: 8, y: 4 }
    }).setDepth(35).setOrigin(0.5);

    this.tweens.add({
      targets: notice,
      y: this.player.y - 120,
      alpha: 0,
      duration: 1800,
      onComplete: () => notice.destroy()
    });
  }

  // ==========================================
  // ONDAS & CHEFES
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

    // Spawn regular de inimigos
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemyWave();
    }
  }

  advanceWave() {
    this.currentWave++;
    this.waveElapsed = 0;
    this.spawnInterval = Math.max(0.5, this.spawnInterval * 0.92); // Mais rápido a cada onda
    audio.playLevelUp();

    // Mensagem de onda
    const banner = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, `ONDA ${this.currentWave}`, {
      fontSize: '32px',
      fontStyle: '900',
      color: '#ff2a55',
      stroke: '#000000',
      strokeThickness: 5
    }).setScrollFactor(0).setDepth(40).setOrigin(0.5);

    this.tweens.add({
      targets: banner,
      scale: 1.4,
      alpha: 0,
      duration: 1400,
      onComplete: () => banner.destroy()
    });
  }

  spawnEnemyWave() {
    if (this.enemies.getLength() > 65) return; // Limite de performance estável

    const pool = this.zoneData.enemies;
    const mobDef = pool[Math.floor(Math.random() * pool.length)];

    // Spawn fora da tela mas perto do herói
    const angle = Math.random() * Math.PI * 2;
    const dist = 480 + Math.random() * 80;
    const sx = this.player.x + Math.cos(angle) * dist;
    const sy = this.player.y + Math.sin(angle) * dist;

    const enemy = this.add.container(sx, sy);
    this.physics.world.enable(enemy);
    enemy.body.setSize(mobDef.radius * 2, mobDef.radius * 2);
    enemy.body.setOffset(-mobDef.radius, -mobDef.radius);

    const gfx = this.add.graphics();
    gfx.fillStyle(mobDef.color, 1);
    gfx.fillCircle(0, 0, mobDef.radius);
    gfx.lineStyle(1.5, 0xffffff, 0.7);
    gfx.strokeCircle(0, 0, mobDef.radius);
    enemy.add(gfx);

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
    this.cameras.main.shake(500, 0.025);

    const bDef = this.zoneData.boss;
    const angle = Math.random() * Math.PI * 2;
    const bx = this.player.x + Math.cos(angle) * 350;
    const by = this.player.y + Math.sin(angle) * 350;

    const boss = this.add.container(bx, by);
    this.physics.world.enable(boss);
    boss.body.setSize(bDef.radius * 2, bDef.radius * 2);
    boss.body.setOffset(-bDef.radius, -bDef.radius);

    const gfx = this.add.graphics();
    gfx.fillStyle(bDef.color, 1);
    gfx.fillCircle(0, 0, bDef.radius);
    gfx.lineStyle(4, 0xff0055, 1);
    gfx.strokeCircle(0, 0, bDef.radius);
    boss.add(gfx);

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

    // Diálogo e Anúncio do Chefe
    this.showBossBanner(bDef);
  }

  showBossBanner(bDef) {
    const bannerBox = document.createElement('div');
    bannerBox.className = 'boss-arrival-banner';
    bannerBox.innerHTML = `
      <div class="boss-banner-sub">CHEFE SUPREMO DA FORJA</div>
      <h2>${bDef.name}</h2>
      <em>"${bDef.dialogue || 'Nenhum mortal escapará!'}"</em>
    `;
    document.body.appendChild(bannerBox);
    setTimeout(() => {
      bannerBox.style.opacity = '0';
      setTimeout(() => bannerBox.remove(), 400);
    }, 3200);
  }

  updateEnemies(dt) {
    this.enemies.getChildren().forEach(e => {
      if (!e.active || !e.body) return;

      if (e.isFrozen) {
        e.frozenTimer -= dt;
        e.body.setVelocity(0, 0);
        if (e.frozenTimer <= 0) e.isFrozen = false;
        return;
      }

      // Persegue o jogador
      const angle = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
      e.body.setVelocity(Math.cos(angle) * e.speed, Math.sin(angle) * e.speed);

      // Ataque de contato ao herói
      const dist = Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y);
      if (dist < 28) {
        this.hitPlayer(e.dmg * dt);
      }

      // Se for o Boss, executa padrões telegrafados
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
    // Telegrafia: círculo vermelho pulsante
    const warnGfx = this.add.graphics({ depth: 5 });
    warnGfx.lineStyle(3, 0xff0000, 0.9);
    warnGfx.fillStyle(0xff0000, 0.2);
    warnGfx.strokeCircle(this.player.x, this.player.y, 140);
    warnGfx.fillCircle(this.player.x, this.player.y, 140);

    const targetX = this.player.x;
    const targetY = this.player.y;

    // Explosão após 1.2 segundos
    this.time.delayedCall(1200, () => {
      warnGfx.destroy();
      audio.playBossRoar();
      this.cameras.main.shake(250, 0.02);

      const boom = this.add.graphics({ depth: 25 });
      boom.fillStyle(0xff1100, 0.8);
      boom.fillCircle(targetX, targetY, 140);
      this.tweens.add({ targets: boom, alpha: 0, duration: 400, onComplete: () => boom.destroy() });

      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, targetX, targetY);
      if (d <= 140) {
        this.hitPlayer(45);
      }
    });
  }

  hitPlayer(amount) {
    if (this.invulnerableTimer > 0) return;

    // Redução por armadura
    const reduction = this.player.armor / (this.player.armor + 50);
    const effectiveDmg = Math.max(1, amount * (1 - reduction));

    this.player.hp -= effectiveDmg;
    audio.playPlayerHurt();
    this.cameras.main.shake(120, 0.008);

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
        const pullSpeed = 420;
        orb.x += Math.cos(ang) * pullSpeed * dt;
        orb.y += Math.sin(ang) * pullSpeed * dt;

        if (d <= 20) {
          audio.playBloodPickup();
          this.runBlood += orb.bloodValue;
          orb.destroy();
        }
      }
    });
  }

  // ==========================================
  // HUD RESPONSIVO
  // ==========================================
  createHUD() {
    this.hudContainer = document.createElement('div');
    this.hudContainer.id = 'game-hud-overlay';
    this.hudContainer.className = 'game-hud-overlay';

    this.hudContainer.innerHTML = `
      <!-- Barra Superior -->
      <div class="hud-top">
        <div class="hud-hero-health">
          <div class="health-bar-frame">
            <div class="health-bar-fill" id="hud-hp-fill" style="width:100%"></div>
            <span class="health-bar-text" id="hud-hp-text">100 / 100</span>
          </div>
        </div>

        <div class="hud-wave-center">
          <div class="hud-wave-title" id="hud-wave-title">ONDA ${this.currentWave} / ${this.zoneData.wavesCount}</div>
          <div class="hud-wave-timer" id="hud-wave-timer">00:35</div>
        </div>

        <div class="hud-resources-top">
          <div class="hud-blood-badge">
            <span>🩸</span> <strong id="hud-blood-count">0</strong>
          </div>
          <button class="btn-inrun-forge" id="btn-hud-forge" title="Pressione F ou clique">
            🔥 FORJA (F)
          </button>
        </div>
      </div>

      <!-- Barra de Vida do Chefe (quando ativo) -->
      <div class="hud-boss-bar-wrapper" id="hud-boss-bar" style="display:none">
        <div class="boss-bar-title" id="hud-boss-name">NOME DO CHEFE</div>
        <div class="boss-bar-frame">
          <div class="boss-bar-fill" id="hud-boss-fill" style="width:100%"></div>
        </div>
      </div>

      <!-- Habilidades Inferiores (Desktop / Mobile) -->
      <div class="hud-skills-bottom">
        <button class="skill-btn" id="hud-btn-dash">
          <span class="skill-key">ESPAÇO</span>
          <span class="skill-icon">⚡</span>
          <span class="skill-cd" id="hud-cd-dash"></span>
        </button>
        <button class="skill-btn" id="hud-btn-active">
          <span class="skill-key">E</span>
          <span class="skill-icon">💥</span>
          <span class="skill-cd" id="hud-cd-active"></span>
        </button>
        <button class="skill-btn ult-btn" id="hud-btn-ult">
          <span class="skill-key">Q</span>
          <span class="skill-icon">👑</span>
          <span class="skill-cd" id="hud-cd-ult"></span>
        </button>
      </div>
    `;

    document.body.appendChild(this.hudContainer);

    // Eventos de clique para mobile / mouse
    document.getElementById('btn-hud-forge').onclick = () => this.openInRunForgeModal();
    document.getElementById('hud-btn-dash').onclick = () => { if (this.dashCooldown <= 0) this.triggerDash(); };
    document.getElementById('hud-btn-active').onclick = () => { if (this.activeSkillCooldown <= 0) this.triggerActiveSkill(); };
    document.getElementById('hud-btn-ult').onclick = () => { if (this.ultimateSkillCooldown <= 0) this.triggerUltimateSkill(); };
  }

  updateHUD() {
    if (!this.hudContainer) return;

    // HP do herói
    const hpPct = Math.max(0, Math.min(100, (this.player.hp / this.player.maxHp) * 100));
    const hpFill = document.getElementById('hud-hp-fill');
    const hpText = document.getElementById('hud-hp-text');
    if (hpFill) hpFill.style.width = `${hpPct}%`;
    if (hpText) hpText.textContent = `${Math.ceil(this.player.hp)} / ${Math.ceil(this.player.maxHp)}`;

    // Sangue
    const bloodText = document.getElementById('hud-blood-count');
    if (bloodText) bloodText.textContent = this.runBlood;

    // Onda & Timer
    const waveTitle = document.getElementById('hud-wave-title');
    const waveTimer = document.getElementById('hud-wave-timer');
    if (waveTitle) {
      waveTitle.textContent = this.isBossWave ? '⚠️ CONFRONTO COM O CHEFE!' : `ONDA ${this.currentWave} / ${this.zoneData.wavesCount}`;
    }
    if (waveTimer) {
      const rem = Math.max(0, Math.ceil(this.waveTimer - this.waveElapsed));
      waveTimer.textContent = `00:${rem < 10 ? '0' : ''}${rem}`;
    }

    // Cooldowns
    const cdDash = document.getElementById('hud-cd-dash');
    const cdAct = document.getElementById('hud-cd-active');
    const cdUlt = document.getElementById('hud-cd-ult');
    if (cdDash) cdDash.textContent = this.dashCooldown > 0 ? this.dashCooldown.toFixed(1) : '';
    if (cdAct) cdAct.textContent = this.activeSkillCooldown > 0 ? this.activeSkillCooldown.toFixed(1) : '';
    if (cdUlt) cdUlt.textContent = this.ultimateSkillCooldown > 0 ? this.ultimateSkillCooldown.toFixed(1) : '';

    // Barra do Chefe
    const bossWrap = document.getElementById('hud-boss-bar');
    if (bossWrap) {
      if (this.boss && this.boss.active && this.boss.hp > 0) {
        bossWrap.style.display = 'block';
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
  // FORJA EM TEMPO REAL (IN-RUN MODAL)
  // ==========================================
  openInRunForgeModal() {
    if (this.forgeModalOpen) return;
    this.forgeModalOpen = true;
    audio.playForgeHammer();

    const recipes = this.forgeManager.getRandomRecipes(3);
    const modal = document.createElement('div');
    modal.className = 'inrun-forge-modal-overlay';
    modal.innerHTML = `
      <div class="inrun-forge-box">
        <div class="forge-box-header">
          <h2>🔥 FORJA DE SANGUE EM TEMPO REAL</h2>
          <span class="forge-avail-blood">Sangue Disponível: 🩸 ${this.runBlood}</span>
        </div>
        <p class="forge-subtitle">Utilize o sangue inimigo coletado nesta corrida para aprimorar seu herói imediatamente!</p>
        <div class="forge-cards-row" id="forge-cards-container"></div>
        <button class="btn-close-forge" id="btn-close-forge">VOLTAR À BATALHA ➔</button>
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
        <button class="btn-craft-recipe" ${this.runBlood < rec.cost ? 'disabled' : ''}>
          FORJAR (🩸 ${rec.cost})
        </button>
      `;

      card.querySelector('.btn-craft-recipe').onclick = () => {
        if (this.forgeManager.craft(rec, this.runBlood, this.player)) {
          this.runBlood -= rec.cost;
          modal.remove();
          this.forgeModalOpen = false;
        }
      };

      container.appendChild(card);
    });

    modal.querySelector('#btn-close-forge').onclick = () => {
      audio.playButtonClick();
      modal.remove();
      this.forgeModalOpen = false;
    };

    document.body.appendChild(modal);
  }

  // ==========================================
  // FIM DE JOGO: REVIVE COM REWARDED AD OU DERROTA
  // ==========================================
  onPlayerDefeated() {
    this.isGameOver = true;
    crazyGames.gameplayStop();

    // Se revive ainda não foi usado, oferece Revive com Rewarded Ad do CrazyGames SDK v3
    if (!this.reviveUsed) {
      this.showReviveModal();
    } else {
      this.showGameOverModal();
    }
  }

  showReviveModal() {
    const modal = document.createElement('div');
    modal.className = 'revive-modal-overlay';
    modal.innerHTML = `
      <div class="revive-box">
        <div class="revive-icon">💀✨</div>
        <h2>SEU HERÓI CAIU PERANTE O ABISMO!</h2>
        <p>A Forja Sagrada concede uma chance única de ressurreição com <strong>3 segundos de invulnerabilidade absoluta</strong>!</p>
        <button class="btn-watch-revive" id="btn-revive-ad">
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
    this.invulnerableTimer = 3.0; // 3 segundos de invulnerabilidade obrigatórios
    audio.playReviveAura();
    crazyGames.gameplayStart();

    // Limpa inimigos muito próximos para dar respiro
    this.enemies.getChildren().forEach(e => {
      if (!e.active) return;
      const d = Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y);
      if (d < 180) {
        e.x += (e.x - this.player.x) * 1.5;
        e.y += (e.y - this.player.y) * 1.5;
      }
    });
  }

  showGameOverModal() {
    audio.playBossRoar();
    crazyGames.showMidgameAd();

    // Adiciona o sangue acumulado ao save permanente
    saveManager.addBlood(this.runBlood);
    this.runLootDrops.forEach(item => saveManager.data.inventory.push(item));
    saveManager.recordScore(this.zoneId, this.currentWave);

    const modal = document.createElement('div');
    modal.className = 'gameover-modal-overlay';
    modal.innerHTML = `
      <div class="gameover-box">
        <h2 class="defeat-title">DERROTA NA FORJA SAGRADA</h2>
        <div class="run-stats-card">
          <div><span>Ondas Sobrevividas:</span> <strong>${this.currentWave}</strong></div>
          <div><span>Inimigos Ceifados:</span> <strong>${this.runKills}</strong></div>
          <div><span>Sangue Conquistado:</span> <strong>🩸 ${this.runBlood}</strong></div>
          <div><span>Equipamentos Obtidos:</span> <strong>🎁 ${this.runLootDrops.length}</strong></div>
        </div>

        <!-- Opção de Dobrar Sangue via CrazyGames Rewarded Ad -->
        <button class="btn-double-rewards" id="btn-double-rewards">
          🎬 DOBRAR SANGUE COLETADO (2x: +🩸 ${this.runBlood})
        </button>

        <button class="btn-return-hub" id="btn-return-hub">RETORNAR AO HUB DA FORJA ➔</button>
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

    // Adiciona recompensas
    const victoryBonus = 150;
    saveManager.addBlood(this.runBlood + victoryBonus);
    saveManager.addMetal(40);
    this.runLootDrops.forEach(item => saveManager.data.inventory.push(item));
    saveManager.recordScore(this.zoneId, this.currentWave);

    const modal = document.createElement('div');
    modal.className = 'gameover-modal-overlay victory';
    modal.innerHTML = `
      <div class="gameover-box victory-box">
        <h2 class="victory-title">👑 VITÓRIA NA FORJA SAGRADA!</h2>
        <p class="victory-sub">O Chefe Supremo foi destruído e a forja permaneceu de pé perante o abismo!</p>
        <div class="run-stats-card">
          <div><span>Zona Purificada:</span> <strong>${this.zoneData.name}</strong></div>
          <div><span>Inimigos Ceifados:</span> <strong>${this.runKills}</strong></div>
          <div><span>Sangue Total:</span> <strong>🩸 ${this.runBlood + victoryBonus}</strong></div>
          <div><span>Metal Arcano Extra:</span> <strong>🔨 40</strong></div>
        </div>

        <button class="btn-double-rewards" id="btn-double-vic">
          🎬 DOBRAR RECOMPENSAS FINAIS (2x)
        </button>

        <button class="btn-return-hub" id="btn-vic-return">GLÓRIA AO FERREIRO (HUB) ➔</button>
      </div>
    `;

    modal.querySelector('#btn-double-vic').onclick = (e) => {
      crazyGames.showRewardedAd('double_rewards', () => {
        saveManager.addBlood(this.runBlood + victoryBonus);
        saveManager.addMetal(40);
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
    if (this.hudContainer) {
      this.hudContainer.remove();
    }
    audio.stopBgm();
    window.dispatchEvent(new CustomEvent('return_to_hub'));
  }
}
