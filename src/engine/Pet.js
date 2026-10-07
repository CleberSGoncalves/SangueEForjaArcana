/**
 * src/engine/Pet.js - Corvo Arcano Companheiro (Pet de Combate & Coleta)
 */

export class ArcanePet {
  constructor(scene, hero) {
    this.scene = scene;
    this.hero = hero;
    this.x = hero.x - 30;
    this.y = hero.y - 30;
    this.angle = 0;
    this.orbitRadius = 55;
    this.orbitSpeed = 2.2;
    this.attackCooldown = 1.4; // segundos entre tiros
    this.attackTimer = 0;
    this.damage = 18;
    this.vacuumRadius = 260; // Puxa sangue e itens de longe
    this.kills = 0;

    // Elemento gráfico no Phaser
    this.graphics = scene.add.graphics({ depth: 15 });
  }

  update(time, delta) {
    if (!this.hero || !this.hero.active) return;
    const dt = delta / 1000;

    // Orbita suavemente ao redor do herói
    this.angle += this.orbitSpeed * dt;
    const targetX = this.hero.x + Math.cos(this.angle) * this.orbitRadius;
    const targetY = this.hero.y + Math.sin(this.angle) * this.orbitRadius - 10;

    // Interpolação suave
    this.x += (targetX - this.x) * 0.12;
    this.y += (targetY - this.y) * 0.12;

    // Renderiza o Corvo Arcano Espectral
    this.graphics.clear();

    // Brilho místico
    this.graphics.fillStyle(0x00f5ff, 0.25);
    this.graphics.fillCircle(this.x, this.y, 16);

    // Corpo do corvo
    this.graphics.fillStyle(0x1e1b4b, 1.0);
    this.graphics.fillCircle(this.x, this.y, 9);

    // Asas pulsantes
    const wingFlap = Math.sin(time * 0.015) * 8;
    this.graphics.fillStyle(0x38bdf8, 0.9);
    this.graphics.fillTriangle(
      this.x, this.y - 2,
      this.x - 12, this.y - 8 + wingFlap,
      this.x + 4, this.y + 4
    );
    this.graphics.fillTriangle(
      this.x, this.y - 2,
      this.x + 12, this.y - 8 - wingFlap,
      this.x - 4, this.y + 4
    );

    // Olhos arcanos brilhantes
    this.graphics.fillStyle(0xff0055, 1.0);
    this.graphics.fillCircle(this.x + (Math.cos(this.angle) > 0 ? 3 : -3), this.y - 2, 2);

    // Cooldown de ataque
    this.attackTimer += dt;
    if (this.attackTimer >= this.attackCooldown) {
      this.attackTimer = 0;
      this.tryAttackNearestEnemy();
    }
  }

  tryAttackNearestEnemy() {
    if (!this.scene.enemies) return;
    const enemyList = this.scene.enemies.getChildren();
    if (!enemyList || enemyList.length === 0) return;

    let nearest = null;
    let minDist = 350;

    for (const enemy of enemyList) {
      if (!enemy.active || enemy.hp <= 0) continue;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    }

    if (nearest) {
      this.shootSpectralFeather(nearest);
    }
  }

  shootSpectralFeather(target) {
    if (this.scene.spawnPetProjectile) {
      this.scene.spawnPetProjectile(this.x, this.y, target, this.damage);
    }
  }

  destroy() {
    if (this.graphics) {
      this.graphics.destroy();
    }
  }
}
