/**
 * src/scenes/HubScene.js - Hub da Forja Sagrada (Área Central com NPCs e Módulos)
 * Integração completa de Heróis, Crafting, Runas, Guildas, Bestiário, Conquistas e Seleção de Zonas.
 */

import { HEROES } from '../data/heroes.js';
import { ZONES } from '../data/zones.js';
import { RUNES } from '../data/runes.js';
import { BESTIARY } from '../data/bestiary.js';
import { GUILDS } from '../data/guilds.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { SEASONAL_EVENTS } from '../data/events.js';
import { generateLootItem } from '../data/loot.js';
import { saveManager } from '../engine/SaveManager.js';
import { audio } from '../audio.js';

export class HubScene {
  constructor(container, onStartGame) {
    this.container = container;
    this.onStartGame = onStartGame;
    this.currentTab = 'zones';
    this.selectedZone = 'catacombs';
    this.hardcoreActive = false;

    this.render();
  }

  render() {
    this.container.innerHTML = '';
    this.container.className = 'hub-wrapper';

    const save = saveManager.data;
    const hero = HEROES[save.selectedHero];

    // Top Bar com Recursos
    const topBar = document.createElement('div');
    topBar.className = 'hub-top-bar';
    topBar.innerHTML = `
      <div class="hub-brand">
        <span class="hub-logo-icon">🔥</span>
        <div>
          <h1 class="hub-title">SANGUE E FORJA ARCANA</h1>
          <span class="hub-subtitle">O ÚLTIMO BASTIÃO DA HUMANIDADE</span>
        </div>
      </div>
      <div class="hub-resources">
        <div class="res-badge blood-res" title="Sangue Profano Acumulado">
          <span class="res-icon">🩸</span>
          <span class="res-val" id="res-blood">${save.bloodCrystals}</span>
        </div>
        <div class="res-badge metal-res" title="Metal Arcano para Forja">
          <span class="res-icon">🔨</span>
          <span class="res-val" id="res-metal">${save.arcaneMetal}</span>
        </div>
        <div class="res-badge hero-res" title="Herói Selecionado">
          <span class="res-icon">🛡️</span>
          <span class="res-val">${hero.name.split(',')[0]}</span>
        </div>
      </div>
    `;
    this.container.appendChild(topBar);

    // Navegação em Abas (Tabs)
    const navBar = document.createElement('div');
    navBar.className = 'hub-nav-bar';
    const tabs = [
      { id: 'zones', label: '⚔️ Zonas & Batalha' },
      { id: 'heroes', label: '🛡️ Heróis & Talentos' },
      { id: 'forge', label: '🔨 Forja & Crafting' },
      { id: 'runes', label: '💎 Runas & Gemas' },
      { id: 'bestiary', label: '📜 Bestiário & Lore' },
      { id: 'guilds', label: '🏰 Guildas' },
      { id: 'achievements', label: '🏆 Conquistas' },
      { id: 'events', label: '🌙 Evento Sazonal' }
    ];

    tabs.forEach(t => {
      const btn = document.createElement('button');
      btn.className = `hub-nav-btn ${this.currentTab === t.id ? 'active' : ''}`;
      btn.textContent = t.label;
      btn.onclick = () => {
        audio.playButtonClick();
        this.currentTab = t.id;
        this.render();
      };
      navBar.appendChild(btn);
    });
    this.container.appendChild(navBar);

    // Painel Principal da Aba
    const mainPanel = document.createElement('div');
    mainPanel.className = 'hub-main-panel';

    switch (this.currentTab) {
      case 'zones':
        this.renderZonesTab(mainPanel);
        break;
      case 'heroes':
        this.renderHeroesTab(mainPanel);
        break;
      case 'forge':
        this.renderForgeTab(mainPanel);
        break;
      case 'runes':
        this.renderRunesTab(mainPanel);
        break;
      case 'bestiary':
        this.renderBestiaryTab(mainPanel);
        break;
      case 'guilds':
        this.renderGuildsTab(mainPanel);
        break;
      case 'achievements':
        this.renderAchievementsTab(mainPanel);
        break;
      case 'events':
        this.renderEventsTab(mainPanel);
        break;
    }

    this.container.appendChild(mainPanel);
  }

  // ==========================================
  // ABA: ZONAS DE CAÇA & BATALHA
  // ==========================================
  renderZonesTab(parent) {
    const section = document.createElement('div');
    section.className = 'zones-section';

    const header = document.createElement('div');
    header.className = 'zones-header';
    header.innerHTML = `
      <h2>PORTAL DAS ZONAS DE CAÇA</h2>
      <p>Selecione seu destino sombrio. Colete sangue demoníaco para forjar armas em tempo real durante a batalha.</p>
    `;
    section.appendChild(header);

    // Grid de Zonas
    const grid = document.createElement('div');
    grid.className = 'zones-grid';

    Object.values(ZONES).forEach(z => {
      const card = document.createElement('div');
      card.className = `zone-card ${this.selectedZone === z.id ? 'selected' : ''}`;
      const isEndless = z.id === 'endless_challenge';
      card.innerHTML = `
        <div class="zone-badge">${isEndless ? '🔥 MODO INFINITO' : `${z.wavesCount} ONDAS`}</div>
        <h3 class="zone-name">${z.name}</h3>
        <span class="zone-sub">${z.subtitle}</span>
        <p class="zone-desc">${z.description}</p>
        <div class="zone-boss">
          <span class="boss-label">Chefe:</span>
          <span class="boss-name">${z.boss.name}</span>
        </div>
      `;
      card.onclick = () => {
        audio.playButtonClick();
        this.selectedZone = z.id;
        this.render();
      };
      grid.appendChild(card);
    });
    section.appendChild(grid);

    // Controles de Modo & Botão Jogar
    const playBar = document.createElement('div');
    playBar.className = 'zones-play-bar';

    const hcToggle = document.createElement('label');
    hcToggle.className = 'hardcore-toggle-label';
    hcToggle.innerHTML = `
      <input type="checkbox" id="hc-check" ${saveManager.data.hardcoreMode ? 'checked' : ''} />
      <span class="hc-text">☠️ MODO HARDCORE (Morte Permanente +50% Sangue)</span>
    `;
    const check = hcToggle.querySelector('#hc-check');
    check.onchange = (e) => {
      saveManager.data.hardcoreMode = e.target.checked;
      saveManager.save();
      audio.playButtonClick();
      this.render();
    };
    playBar.appendChild(hcToggle);

    const playBtn = document.createElement('button');
    playBtn.className = 'btn-start-battle';
    playBtn.innerHTML = `<span>⚔️ ENTRAR NA BATALHA ➔</span>`;
    playBtn.onclick = () => {
      audio.playSlash();
      if (this.onStartGame) {
        this.onStartGame({
          zoneId: this.selectedZone,
          hardcore: saveManager.data.hardcoreMode
        });
      }
    };
    playBar.appendChild(playBtn);

    section.appendChild(playBar);
    parent.appendChild(section);
  }

  // ==========================================
  // ABA: HERÓIS & TALENTOS
  // ==========================================
  renderHeroesTab(parent) {
    const save = saveManager.data;
    const section = document.createElement('div');
    section.className = 'heroes-section';

    const heroList = document.createElement('div');
    heroList.className = 'heroes-list';

    Object.values(HEROES).forEach(h => {
      const isUnlocked = save.unlockedHeroes.includes(h.id);
      const isSelected = save.selectedHero === h.id;
      const card = document.createElement('div');
      card.className = `hero-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;
      card.innerHTML = `
        <div class="hero-color-strip" style="background:${h.color}"></div>
        <div class="hero-info">
          <h3>${h.name}</h3>
          <span class="hero-title">${h.title}</span>
          <p class="hero-desc">${h.description}</p>
          <div class="hero-stats-mini">
            <span>❤️ ${h.baseStats.maxHp} HP</span>
            <span>⚔️ ${h.baseStats.damage} Dano</span>
            <span>🛡️ ${h.baseStats.armor} Armadura</span>
            <span>⚡ ${h.baseStats.speed} Vel</span>
          </div>
          <div class="hero-action-slot">
            ${isSelected ? '<span class="badge-active">HERÓI ATIVO</span>' :
              isUnlocked ? '<button class="btn-select-hero">SELECIONAR</button>' :
              `<button class="btn-unlock-hero">DESBLOQUEAR (🩸 ${h.cost})</button>`}
          </div>
        </div>
      `;

      const selectBtn = card.querySelector('.btn-select-hero');
      if (selectBtn) {
        selectBtn.onclick = () => {
          save.selectedHero = h.id;
          saveManager.save();
          audio.playButtonClick();
          this.render();
        };
      }

      const unlockBtn = card.querySelector('.btn-unlock-hero');
      if (unlockBtn) {
        unlockBtn.onclick = () => {
          if (save.bloodCrystals >= h.cost) {
            save.bloodCrystals -= h.cost;
            save.unlockedHeroes.push(h.id);
            save.selectedHero = h.id;
            saveManager.save();
            audio.playLevelUp();
            this.render();
          } else {
            alert('Sangue Profano insuficiente para desbloquear este herói!');
          }
        };
      }

      heroList.appendChild(card);
    });
    section.appendChild(heroList);

    // Detalhes do Herói Selecionado & Talentos
    const currentHero = HEROES[save.selectedHero];
    const talentPanel = document.createElement('div');
    talentPanel.className = 'talent-panel';
    talentPanel.innerHTML = `
      <h3>ÁRVORE DE TALENTOS: ${currentHero.name}</h3>
      <p class="talent-intro">Escolha uma especialização por tier para customizar seu estilo de combate.</p>
    `;

    const currentTalents = save.heroTalents[currentHero.id] || {};

    currentHero.talents.forEach(tier => {
      const tierBox = document.createElement('div');
      tierBox.className = 'talent-tier-box';
      tierBox.innerHTML = `<h4>${tier.title}</h4>`;

      const optRow = document.createElement('div');
      optRow.className = 'talent-options-row';

      tier.options.forEach(opt => {
        const isChosen = currentTalents[`t${tier.tier}`] === opt.id;
        const optBtn = document.createElement('button');
        optBtn.className = `talent-opt-btn ${isChosen ? 'chosen' : ''}`;
        optBtn.innerHTML = `
          <strong>${opt.name}</strong>
          <small>${opt.desc}</small>
        `;
        optBtn.onclick = () => {
          currentTalents[`t${tier.tier}`] = opt.id;
          save.heroTalents[currentHero.id] = currentTalents;
          saveManager.save();
          audio.playForgeHammer();
          this.render();
        };
        optRow.appendChild(optBtn);
      });

      tierBox.appendChild(optRow);
      talentPanel.appendChild(tierBox);
    });

    section.appendChild(talentPanel);
    parent.appendChild(section);
  }

  // ==========================================
  // ABA: FORJA SAGRADA (CRAFTING & ITENS)
  // ==========================================
  renderForgeTab(parent) {
    const save = saveManager.data;
    const section = document.createElement('div');
    section.className = 'forge-section';

    section.innerHTML = `
      <div class="forge-header">
        <h2>FORJA SAGRADA DE KAELEN</h2>
        <p>Gaste Metal Arcano e Sangue para forjar novos equipamentos ou desmonte itens indesejados para recuperar materiais preciosos.</p>
      </div>
    `;

    const forgeActions = document.createElement('div');
    forgeActions.className = 'forge-actions-bar';

    const craftWeaponBtn = document.createElement('button');
    craftWeaponBtn.className = 'btn-craft';
    craftWeaponBtn.innerHTML = `⚔️ Forjar Arma Rara (🔨 30 Metal + 🩸 40 Sangue)`;
    craftWeaponBtn.onclick = () => {
      if (save.arcaneMetal >= 30 && save.bloodCrystals >= 40) {
        save.arcaneMetal -= 30;
        save.bloodCrystals -= 40;
        const item = generateLootItem('weapon', null, 2);
        save.inventory.push(item);
        saveManager.save();
        audio.playForgeHammer();
        alert(`Forjado com sucesso: ${item.name} (${item.rarityName})!`);
        this.render();
      } else {
        alert('Recursos insuficientes para forjar!');
      }
    };
    forgeActions.appendChild(craftWeaponBtn);

    const craftArmorBtn = document.createElement('button');
    craftArmorBtn.className = 'btn-craft';
    craftArmorBtn.innerHTML = `🛡️ Forjar Armadura (🔨 25 Metal + 🩸 35 Sangue)`;
    craftArmorBtn.onclick = () => {
      if (save.arcaneMetal >= 25 && save.bloodCrystals >= 35) {
        save.arcaneMetal -= 25;
        save.bloodCrystals -= 35;
        const item = generateLootItem('armor', null, 2);
        save.inventory.push(item);
        saveManager.save();
        audio.playForgeHammer();
        alert(`Forjado com sucesso: ${item.name} (${item.rarityName})!`);
        this.render();
      } else {
        alert('Recursos insuficientes para forjar!');
      }
    };
    forgeActions.appendChild(craftArmorBtn);

    section.appendChild(forgeActions);

    // Equipamentos Equipados
    const equippedContainer = document.createElement('div');
    equippedContainer.className = 'equipped-grid';
    equippedContainer.innerHTML = `<h3>EQUIPAMENTOS ATIVOS</h3>`;

    const slots = ['weapon', 'armor', 'ring', 'amulet'];
    const slotNames = { weapon: 'Arma', armor: 'Armadura', ring: 'Anel', amulet: 'Amuleto' };

    const slotsRow = document.createElement('div');
    slotsRow.className = 'slots-row';

    slots.forEach(slot => {
      const item = save.equipped[slot];
      const slotBox = document.createElement('div');
      slotBox.className = 'slot-box';
      if (item) {
        slotBox.style.borderColor = item.color;
        slotBox.innerHTML = `
          <span class="slot-type">${slotNames[slot]}</span>
          <span class="item-icon">${item.icon}</span>
          <strong class="item-title" style="color:${item.color}">${item.name}</strong>
          <small class="item-rarity">${item.rarityName}</small>
          <button class="btn-unequip">Desequipar</button>
        `;
        slotBox.querySelector('.btn-unequip').onclick = () => {
          saveManager.unequipItem(slot);
          audio.playButtonClick();
          this.render();
        };
      } else {
        slotBox.innerHTML = `
          <span class="slot-type">${slotNames[slot]}</span>
          <span class="slot-empty">Vazio</span>
        `;
      }
      slotsRow.appendChild(slotBox);
    });
    equippedContainer.appendChild(slotsRow);
    section.appendChild(equippedContainer);

    // Inventário de Itens para Equipar ou Desmontar
    const invContainer = document.createElement('div');
    invContainer.className = 'inv-container';
    invContainer.innerHTML = `<h3>MOCHILA / INVENTÁRIO (${save.inventory.length} ITENS)</h3>`;

    const invGrid = document.createElement('div');
    invGrid.className = 'inv-grid';

    save.inventory.forEach(item => {
      const itemCard = document.createElement('div');
      itemCard.className = 'inv-card';
      itemCard.style.borderColor = item.color;
      itemCard.innerHTML = `
        <div class="inv-card-header">
          <span class="item-icon">${item.icon}</span>
          <div>
            <strong style="color:${item.color}">${item.name}</strong>
            <small>${item.rarityName} • ${slotNames[item.slot]}</small>
          </div>
        </div>
        <p class="item-desc">${item.desc}</p>
        <div class="inv-card-actions">
          <button class="btn-equip">Equipar</button>
          <button class="btn-dismantle">Desmontar (+🔨${item.dismantleYield})</button>
        </div>
      `;

      itemCard.querySelector('.btn-equip').onclick = () => {
        saveManager.equipItem(item);
        audio.playButtonClick();
        this.render();
      };

      itemCard.querySelector('.btn-dismantle').onclick = () => {
        const yieldRes = saveManager.dismantleItem(item.uid);
        audio.playForgeHammer();
        alert(`Item desmontado! Obtido: +${yieldRes.metal} Metal, +${yieldRes.blood} Sangue`);
        this.render();
      };

      invGrid.appendChild(itemCard);
    });

    invContainer.appendChild(invGrid);
    section.appendChild(invContainer);
    parent.appendChild(section);
  }

  // ==========================================
  // ABA: RUNAS & GEMAS
  // ==========================================
  renderRunesTab(parent) {
    const save = saveManager.data;
    const section = document.createElement('div');
    section.className = 'runes-section';

    section.innerHTML = `
      <div class="runes-header">
        <h2>OFICINA RÚNICA DE VAELIN</h2>
        <p>Incruste gemas arcanas nos soquetes de suas armas e armaduras para conceder efeitos de combate sobrenaturais.</p>
      </div>
    `;

    const runesInventory = document.createElement('div');
    runesInventory.className = 'runes-inventory';
    runesInventory.innerHTML = `<h3>SEU ESTOQUE DE GEMAS</h3>`;

    const runesRow = document.createElement('div');
    runesRow.className = 'runes-row';

    Object.values(RUNES).forEach(r => {
      const count = save.runes[r.id] || 0;
      const runeCard = document.createElement('div');
      runeCard.className = 'rune-card';
      runeCard.style.borderColor = r.color;
      runeCard.innerHTML = `
        <span class="rune-icon">${r.icon}</span>
        <strong style="color:${r.color}">${r.name}</strong>
        <span class="rune-qty">Quantidade: ${count}</span>
        <p class="rune-bonus">${r.bonusText}</p>
      `;
      runesRow.appendChild(runeCard);
    });

    runesInventory.appendChild(runesRow);
    section.appendChild(runesInventory);
    parent.appendChild(section);
  }

  // ==========================================
  // ABA: BESTIÁRIO & LORE
  // ==========================================
  renderBestiaryTab(parent) {
    const save = saveManager.data;
    const section = document.createElement('div');
    section.className = 'bestiary-section';
    section.innerHTML = `
      <h2>BESTIÁRIO & LORE DO ABISMO</h2>
      <p>Estude os monstros que atacam a Forja Sagrada. Descubra fraquezas e acompanhe seu histórico de abates.</p>
    `;

    const bestiaryGrid = document.createElement('div');
    bestiaryGrid.className = 'bestiary-grid';

    Object.values(BESTIARY).forEach(b => {
      const kills = save.bestiaryKills[b.id] || 0;
      const card = document.createElement('div');
      card.className = 'bestiary-card';
      card.innerHTML = `
        <div class="bestiary-card-header">
          <span class="bestiary-icon">${b.icon}</span>
          <div>
            <h3>${b.name}</h3>
            <span class="bestiary-cat">${b.category} • Ameaça: ${b.threat}</span>
          </div>
        </div>
        <p class="bestiary-lore">${b.lore}</p>
        <div class="bestiary-stats">
          <div><strong>Fraqueza:</strong> ${b.weakness}</div>
          <div><strong>Abates:</strong> <span class="kills-count">${kills}</span></div>
          <div><strong>Recompensas:</strong> ${b.drops}</div>
        </div>
      `;
      bestiaryGrid.appendChild(card);
    });

    section.appendChild(bestiaryGrid);
    parent.appendChild(section);
  }

  // ==========================================
  // ABA: GUILDAS & FACÇÕES
  // ==========================================
  renderGuildsTab(parent) {
    const save = saveManager.data;
    const section = document.createElement('div');
    section.className = 'guilds-section';
    section.innerHTML = `
      <h2>ORDENS E GUILDAS DA FORJA</h2>
      <p>Junte-se a uma ordem para receber bênçãos passivas de combate e reputação exclusiva.</p>
    `;

    const guildsGrid = document.createElement('div');
    guildsGrid.className = 'guilds-grid';

    Object.values(GUILDS).forEach(g => {
      const isMember = save.guild === g.id;
      const card = document.createElement('div');
      card.className = `guild-card ${isMember ? 'active-guild' : ''}`;
      card.style.borderColor = g.color;
      card.innerHTML = `
        <div class="guild-banner">${g.banner}</div>
        <h3 style="color:${g.color}">${g.name}</h3>
        <em class="guild-motto">"${g.motto}"</em>
        <div class="guild-perk">
          <strong>Bênção Ativa:</strong>
          <p>${g.perkText}</p>
        </div>
        <div class="guild-action">
          ${isMember ? `<span class="badge-guild-member">SUA ORDEM ATIVA (Rep: ${save.guildRep})</span>` :
            `<button class="btn-join-guild">JUNTAR-SE À ORDEM</button>`}
        </div>
      `;

      const joinBtn = card.querySelector('.btn-join-guild');
      if (joinBtn) {
        joinBtn.onclick = () => {
          save.guild = g.id;
          save.guildRep = 10;
          saveManager.save();
          audio.playLevelUp();
          this.render();
        };
      }

      guildsGrid.appendChild(card);
    });

    section.appendChild(guildsGrid);
    parent.appendChild(section);
  }

  // ==========================================
  // ABA: CONQUISTAS & TROFÉUS
  // ==========================================
  renderAchievementsTab(parent) {
    const save = saveManager.data;
    const section = document.createElement('div');
    section.className = 'achievements-section';
    section.innerHTML = `
      <h2>CONQUISTAS & TROFÉUS ARCANOS</h2>
      <p>Cumpra desafios lendários para desbloquear bônus e Sangue Profano.</p>
    `;

    const achGrid = document.createElement('div');
    achGrid.className = 'achievements-grid';

    ACHIEVEMENTS.forEach(ach => {
      const isCompleted = save.achievements.includes(ach.id);
      const card = document.createElement('div');
      card.className = `ach-card ${isCompleted ? 'completed' : 'locked'}`;
      card.innerHTML = `
        <span class="ach-icon">${ach.icon}</span>
        <div class="ach-info">
          <h4>${ach.name}</h4>
          <p>${ach.desc}</p>
          <span class="ach-reward">+🩸 ${ach.rewardBlood} Sangue</span>
        </div>
        <div class="ach-status">
          ${isCompleted ? '✅ Concluída' : '🔒 Bloqueada'}
        </div>
      `;
      achGrid.appendChild(card);
    });

    section.appendChild(achGrid);
    parent.appendChild(section);
  }

  // ==========================================
  // ABA: EVENTOS SAZONAIS
  // ==========================================
  renderEventsTab(parent) {
    const section = document.createElement('div');
    section.className = 'events-section';
    section.innerHTML = `
      <h2>EVENTOS SAZONAIS & CALAMIDADES</h2>
      <p>Eventos globais ativos que alteram as regras de combate e aumentam o loot da forja.</p>
    `;

    const eventsList = document.createElement('div');
    eventsList.className = 'events-list';

    SEASONAL_EVENTS.forEach(ev => {
      const card = document.createElement('div');
      card.className = 'event-card';
      card.innerHTML = `
        <div class="event-badge">${ev.badge}</div>
        <h3>${ev.title}</h3>
        <p>${ev.desc}</p>
        <span class="event-timer">Tempo Restante: ${ev.endsInDays} dias</span>
      `;
      eventsList.appendChild(card);
    });

    section.appendChild(eventsList);
    parent.appendChild(section);
  }
}
