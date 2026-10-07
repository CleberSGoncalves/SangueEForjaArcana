/**
 * src/scenes/HubScene.js - Santuário da Forja Sagrada (Hub 100% Estilo DIABLO)
 * Apresentação artística dos 3 Heróis, Bestiário Demoníaco, Forja de Equipamentos,
 * Altar de Runas, Conquistas e Seleção de Zonas de Caça.
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

    this.render();
  }

  render() {
    this.container.innerHTML = '';
    this.container.className = 'hub-wrapper diablo-hub-theme';

    const save = saveManager.data;
    const hero = HEROES[save.selectedHero];

    // Barra de Cabeçalho do Santuário
    const topBar = document.createElement('div');
    topBar.className = 'hub-top-bar diablo-top-bar';
    topBar.innerHTML = `
      <div class="hub-brand">
        <span class="hub-logo-icon">🔥💀</span>
        <div>
          <h1 class="hub-title">SANGUE E FORJA ARCANA</h1>
          <span class="hub-subtitle">SANTUÁRIO DO ÚLTIMO FERREIRO — DIABLO ARPG SURVIVORS</span>
        </div>
      </div>
      <div class="hub-resources">
        <div class="res-badge blood-res" title="Sangue Profano Coletado">
          <span class="res-icon">🩸</span>
          <span class="res-val" id="res-blood">${save.bloodCrystals}</span>
        </div>
        <div class="res-badge metal-res" title="Metal Arcano da Forja">
          <span class="res-icon">🔨</span>
          <span class="res-val" id="res-metal">${save.arcaneMetal}</span>
        </div>
        <div class="res-badge hero-res" title="Herói Ativo">
          <span class="res-icon">🛡️</span>
          <span class="res-val">${hero.name.split(',')[0]}</span>
        </div>
      </div>
    `;
    this.container.appendChild(topBar);

    // Navegação em Abas Góticas
    const navBar = document.createElement('div');
    navBar.className = 'hub-nav-bar diablo-nav-bar';
    const tabs = [
      { id: 'zones', label: '⚔️ Zonas & Batalha' },
      { id: 'heroes', label: '🛡️ Heróis & Talentos' },
      { id: 'forge', label: '🔨 Forja Sagrada' },
      { id: 'runes', label: '💎 Altar de Runas' },
      { id: 'bestiary', label: '📜 Bestiário do Abismo' },
      { id: 'guilds', label: '🏰 Ordens Sagradas' },
      { id: 'achievements', label: '🏆 Conquistas' },
      { id: 'events', label: '🌙 Eclipse Carmesim' }
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

    // Painel Central
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

    section.innerHTML = `
      <div class="zones-header">
        <h2>PORTAL DAS MASMORRAS DO ABISMO</h2>
        <p>Selecione a cripta a ser purificada. Derrote hordas de demônios, forje armas em tempo real com o sangue dos mortos e expulse os Senhores do Terror!</p>
      </div>
    `;

    const grid = document.createElement('div');
    grid.className = 'zones-grid';

    Object.values(ZONES).forEach(z => {
      const card = document.createElement('div');
      card.className = `zone-card ${this.selectedZone === z.id ? 'selected' : ''}`;
      const isEndless = z.id === 'endless_challenge';
      card.innerHTML = `
        <div class="zone-badge">${isEndless ? '🔥 SOBREVIVÊNCIA INFINITA' : `${z.wavesCount} ONDAS`}</div>
        <h3 class="zone-name">${z.name}</h3>
        <span class="zone-sub">${z.subtitle}</span>
        <p class="zone-desc">${z.description}</p>
        <div class="zone-boss">
          <span class="boss-label">Chefe Supremo:</span>
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

    // Barra de Ação
    const playBar = document.createElement('div');
    playBar.className = 'zones-play-bar diablo-play-bar';

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
    playBtn.className = 'btn-start-battle diablo-btn-battle';
    playBtn.innerHTML = `<span>⚔️ ADENTRAR À MASMORRA (JOGAR) ➔</span>`;
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
  // ABA: HERÓIS & TALENTOS (ESTILO DIABLO)
  // ==========================================
  renderHeroesTab(parent) {
    const save = saveManager.data;
    const section = document.createElement('div');
    section.className = 'heroes-section';

    section.innerHTML = `
      <h2>CLASSES DE HERÓIS DO SANTUÁRIO</h2>
      <p>Selecione e especialize os campeões da Forja Arcana. Cada classe possui arquétipos, perícias ativas e árvores de talentos inspiradas em Diablo.</p>
    `;

    const heroList = document.createElement('div');
    heroList.className = 'heroes-list diablo-heroes-grid';

    const heroAvatars = {
      ignis: '🔨🔥',
      valkyrie: '🪓🩸',
      malakor: '🔮⚡'
    };

    Object.values(HEROES).forEach(h => {
      const isUnlocked = save.unlockedHeroes.includes(h.id);
      const isSelected = save.selectedHero === h.id;
      const card = document.createElement('div');
      card.className = `hero-card diablo-hero-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;
      card.innerHTML = `
        <div class="hero-card-banner">
          <span class="hero-avatar-icon">${heroAvatars[h.id] || '🛡️'}</span>
          <div>
            <h3>${h.name}</h3>
            <span class="hero-title">${h.title}</span>
          </div>
        </div>
        <p class="hero-desc">${h.description}</p>
        <div class="hero-skills-preview">
          <div><strong>Ativa:</strong> ${h.activeSkill.name} (${h.activeSkill.damage} Dano)</div>
          <div><strong>Suprema:</strong> ${h.ultimateSkill.name} (${h.ultimateSkill.description})</div>
        </div>
        <div class="hero-stats-mini">
          <span>❤️ ${h.baseStats.maxHp} HP</span>
          <span>⚔️ ${h.baseStats.damage} Dano</span>
          <span>🛡️ ${h.baseStats.armor} Armadura</span>
          <span>⚡ ${h.baseStats.speed} Vel</span>
        </div>
        <div class="hero-action-slot">
          ${isSelected ? '<span class="badge-active">⚔️ HERÓI ESCOLHIDO</span>' :
            isUnlocked ? '<button class="btn-select-hero diablo-btn">SELECIONAR CLASSE</button>' :
            `<button class="btn-unlock-hero diablo-btn-gold">DESPERTAR CLASSE (🩸 ${h.cost})</button>`}
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
            alert('Sangue Profano insuficiente para despertar esta classe!');
          }
        };
      }

      heroList.appendChild(card);
    });
    section.appendChild(heroList);

    // Árvore de Talentos
    const currentHero = HEROES[save.selectedHero];
    const talentPanel = document.createElement('div');
    talentPanel.className = 'talent-panel diablo-talent-panel';
    talentPanel.innerHTML = `
      <h3>ÁRVORE DE HABILIDADES & TALENTOS: ${currentHero.name}</h3>
      <p class="talent-intro">Escolha uma maestria por tier para moldar sua build de combate.</p>
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
  // ABA: FORJA SAGRADA (CRAFTING DE ITENS)
  // ==========================================
  renderForgeTab(parent) {
    const save = saveManager.data;
    const section = document.createElement('div');
    section.className = 'forge-section';

    section.innerHTML = `
      <div class="forge-header">
        <h2>A GRANDE BIGORNA DE KAELEN</h2>
        <p>Forje armas e armaduras raras ou lendárias a partir de Metal Arcano e Sangue, ou desmonte espólios de batalha.</p>
      </div>
    `;

    const forgeActions = document.createElement('div');
    forgeActions.className = 'forge-actions-bar';

    const craftWeaponBtn = document.createElement('button');
    craftWeaponBtn.className = 'btn-craft diablo-btn-gold';
    craftWeaponBtn.innerHTML = `⚔️ Forjar Arma (🔨 30 Metal + 🩸 40 Sangue)`;
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
        alert('Recursos insuficientes na forja!');
      }
    };
    forgeActions.appendChild(craftWeaponBtn);

    const craftArmorBtn = document.createElement('button');
    craftArmorBtn.className = 'btn-craft diablo-btn-gold';
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
        alert('Recursos insuficientes na forja!');
      }
    };
    forgeActions.appendChild(craftArmorBtn);

    section.appendChild(forgeActions);

    // Equipados
    const equippedContainer = document.createElement('div');
    equippedContainer.className = 'equipped-grid';
    equippedContainer.innerHTML = `<h3>EQUIPAMENTOS EM USO</h3>`;

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

    // Inventário
    const invContainer = document.createElement('div');
    invContainer.className = 'inv-container';
    invContainer.innerHTML = `<h3>ESPÓLIOS NA MOCHILA (${save.inventory.length} ITENS)</h3>`;

    const invGrid = document.createElement('div');
    invGrid.className = 'inv-grid';

    save.inventory.forEach(item => {
      const itemCard = document.createElement('div');
      itemCard.className = 'inv-card diablo-item-card';
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
          <button class="btn-equip diablo-btn">Equipar</button>
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
        <h2>ALTAR DAS RUNAS & GEMAS ANCESTRAIS</h2>
        <p>Incruste gemas nos soquetes de suas armas e joias para canalizar poderes elementais.</p>
      </div>
    `;

    const runesRow = document.createElement('div');
    runesRow.className = 'runes-row';

    Object.values(RUNES).forEach(r => {
      const count = save.runes[r.id] || 0;
      const runeCard = document.createElement('div');
      runeCard.className = 'rune-card diablo-rune-card';
      runeCard.style.borderColor = r.color;
      runeCard.innerHTML = `
        <span class="rune-icon">${r.icon}</span>
        <strong style="color:${r.color}">${r.name}</strong>
        <span class="rune-qty">Em Estoque: ${count}</span>
        <p class="rune-bonus">${r.bonusText}</p>
      `;
      runesRow.appendChild(runeCard);
    });

    section.appendChild(runesRow);
    parent.appendChild(section);
  }

  // ==========================================
  // ABA: BESTIÁRIO DO ABISMO (LORE DIABLO)
  // ==========================================
  renderBestiaryTab(parent) {
    const save = saveManager.data;
    const section = document.createElement('div');
    section.className = 'bestiary-section';
    section.innerHTML = `
      <h2>BESTIÁRIO DO ABISMO & LORE DOS DEMÔNIOS</h2>
      <p>Crônicas dos demônios e chefes que assolam a humanidade. Conheça suas fraquezas para triunfar em combate.</p>
    `;

    const bestiaryGrid = document.createElement('div');
    bestiaryGrid.className = 'bestiary-grid';

    Object.values(BESTIARY).forEach(b => {
      const kills = save.bestiaryKills[b.id] || 0;
      const card = document.createElement('div');
      card.className = 'bestiary-card diablo-bestiary-card';
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
          <div><strong>Abates pelo Herói:</strong> <span class="kills-count">${kills}</span></div>
          <div><strong>Espólios:</strong> ${b.drops}</div>
        </div>
      `;
      bestiaryGrid.appendChild(card);
    });

    section.appendChild(bestiaryGrid);
    parent.appendChild(section);
  }

  // ==========================================
  // ABA: ORDENS SAGRADAS (GUILDAS)
  // ==========================================
  renderGuildsTab(parent) {
    const save = saveManager.data;
    const section = document.createElement('div');
    section.className = 'guilds-section';
    section.innerHTML = `
      <h2>ORDENS E GUILDAS DO SANTUÁRIO</h2>
      <p>Afilie-se a uma ordem para receber bênçãos divinas passivas na batalha.</p>
    `;

    const guildsGrid = document.createElement('div');
    guildsGrid.className = 'guilds-grid';

    Object.values(GUILDS).forEach(g => {
      const isMember = save.guild === g.id;
      const card = document.createElement('div');
      card.className = `guild-card diablo-guild-card ${isMember ? 'active-guild' : ''}`;
      card.style.borderColor = g.color;
      card.innerHTML = `
        <div class="guild-banner">${g.banner}</div>
        <h3 style="color:${g.color}">${g.name}</h3>
        <em class="guild-motto">"${g.motto}"</em>
        <div class="guild-perk">
          <strong>Bênção da Ordem:</strong>
          <p>${g.perkText}</p>
        </div>
        <div class="guild-action">
          ${isMember ? `<span class="badge-guild-member">BÊNÇÃO ATIVA (Rep: ${save.guildRep})</span>` :
            `<button class="btn-join-guild diablo-btn">JUNTAR-SE À ORDEM</button>`}
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
      <h2>CONQUISTAS DO SANTUÁRIO</h2>
      <p>Cumpra proezas épicas para receber Sangue Profano sagrado.</p>
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
      <h2>EVENTOS SAZONAIS & CALAMIDADES DO SANTUÁRIO</h2>
      <p>Eventos cósmicos que alteram os fluxos de sangue e recompensas na forja.</p>
    `;

    const eventsList = document.createElement('div');
    eventsList.className = 'events-list';

    SEASONAL_EVENTS.forEach(ev => {
      const card = document.createElement('div');
      card.className = 'event-card diablo-event-card';
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
