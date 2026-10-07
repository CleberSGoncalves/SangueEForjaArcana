# 🎮 GDD — Sangue e Forja Arcana

**Nome Comercial**: Sangue e Forja Arcana (Inédito e Inovador)  
**Gênero / Estilo**: ARPG-Survivors / Bullet Heaven  
**Plataforma Alvo**: CrazyGames (HTML5 / WebGL)  
**URL de Entrega / Produção**: [https://sangueeforjaarcana.kinomuse.com.br](https://sangueeforjaarcana.kinomuse.com.br)  
**Stack Tecnológica**: Vite + Phaser 3 (HTML5 Canvas)  
**Data de Concepção**: 05/10/2026 23:46  
**Arquiteta Mestre de Criação**: Esmeralda (GLX Agent)  

---

## 🌟 1. Identidade de Marca & Introdução Obrigatória
1. **Intro FluidCleb Interactive (0.0s a 2.8s)**:
   - Splash Screen procedural obrigatória em Canvas idêntica aos títulos de referência (*Sobrevivente da Névoa* e *Hydrologic*).
   - Orbes de energia azul subindo (`#00f5ff`, `#38bdf8`, `#0284c7`), fusão central com áudio sintético procedural (`playFluidClebIntro()`), emblema da gota d'água metálica (`#94a3b8` / `#0284c7`), logo em neon `FLUIDCLEB` (38px) e subtítulo `INTERACTIVE` (13px), com barra de progresso suave.
2. **Apresentação em Animação Realista (Intro Narrativa / Lore Interativa)**:
   - Exibida imediatamente após a Splash Screen da FluidCleb.
   - Animação cinematográfica procedural em Canvas com partículas volumétricas, feixes de luz e transição dramática que narra os 3 atos da Lore em até 5 segundos com botões 'Continuar ➔' e 'Pular História'.

---

## 📖 2. Lore, Ambientação & Premissa
Numa era de escuridão e desespero, legiões demoníacas emergem das profundezas, ameaçando consumir o último bastião da humanidade. Como um Ferreiro Arcana amaldiçoado, ou um dos heróis por ele forjados, você deve defender a Forja Sagrada. O sangue dos inimigos caídos não é apenas uma mancha, mas a própria essência para forjar armas lendárias e artefatos de poder, em uma batalha eterna pela sobrevivência.

---

## ⚡ 3. Core Gameplay Loop & Controles
O jogador escolhe um herói com habilidades únicas, e entra em 'Zonas de Caça' (arenas interconectadas que simulam um mundo sombrio). O objetivo é sobreviver a hordas demoníacas, coletar sangue e essências para 'Forjar em Tempo Real' novos equipamentos ou aprimorar os existentes. Após cada onda ou zona, retorna-se ao 'Hub da Forja', onde NPCs oferecem aprimoramentos de heróis, forja de itens permanentes, e acesso a novas Zonas ou Chefes. O combate é fluido, com ataques automáticos e habilidades ativas do herói (semelhante ao Diablo) e um sistema de loot e progressão profundo.

---

## 🧩 4. Módulos & Features Aprovados para o Jogo
- **Sistema de Heróis Desbloqueáveis, cada um com habilidades ativas e árvores de talentos únicas**
- **Mecânica de Forja em Tempo Real: Use sangue inimigo para criar/aprimorar armas e artefatos temporários durante as ondas**
- **Sistema de Loot Completo: Itens com diferentes raridades, atributos e efeitos únicos (armas, armaduras, anéis, amuletos)**
- **Hub da Forja: Área central com NPCs para forjar itens permanentes, aprimorar heróis, e acessar Zonas de Caça e Chefes específicos**
- **Zonas de Caça e Chefes: Ambientes temáticos com múltiplos inimigos e chefes épicos com padrões de ataque únicos**
- **Atmosfera Sombria e Gótica com visuais e sons inspirados em ARPGs clássicos**
- **Sistema de Runas/Gemas para encantar itens e customizar ainda mais o combate**
- **Sistema de Guildas/Clãs para que os jogadores possam se organizar e competir em eventos especiais**
- **Modo Desafio Sem Fim para testar a força dos heróis e competir por placares de líderes**
- **Bestiário/Lore Completa para os inimigos e o mundo, aprofundando a imersão**
- **Modo Hardcore onde a morte é permanente, para jogadores que buscam o desafio definitivo**
- **Sistema de Conquistas/Troféus para recompensar marcos e desafios específicos no jogo**
- **Sistema de Eventos Sazonais com recompensas temáticas e desafios temporários**
- **Companheiro/Pet que auxilia o herói no combate e coleta recursos**
- **Sistema de Crafting Avançado para criar itens lendários a partir de receitas raras e materiais específicos**
- **Intro FluidCleb Interactive (Splash Screen procedural obrigatória em Canvas com orbes subindo, fusão central, emblema da gota metálica, logo em neon ciano e áudio sintético)**
- **Apresentação em Animação Realista da Lore (introdução narrativa cinematográfica de 5 segundos)**
- **CrazyGames SDK v3 (Suporte completo a Rewarded Ads: Revive 1x com 3s invulnerabilidade e Dobrar moedas/XP no final; Midgame Ads nas telas de vitória/derrota; eventos gameplayStart/Stop)**
- **URL de Entrega Pública: sangueeforjaarcana.kinomuse.com.br (via túnel Cloudflare)**
- **Repositório GitHub Obrigatório (Nome: SangueEForjaArcana, visibilidade pública, commits contínuos)**
- **Validação por 2 Subagentes ao Concluir (Subagente 1: Validando mecânica, física, colisões e fluidez a 60 FPS; Subagente 2: Validando jogabilidade, polimento gráfico, HUD responsivo e integração perfeita do SDK CrazyGames)**

---

## 💰 5. Estratégia de Monetização de Alto Rendimento (CrazyGames SDK v3)
Rewarded Ads: Reviver o herói (1x com invulnerabilidade), Dobrar essências/ouro ao final da corrida, Desbloquear forjas/receitas raras, Resetar talentos de herói. Midgame Ads em transições de zonas ou telas de game over.

---

## 🛡️ 6. Protocolo de Validação de Qualidade por 2 Subagentes (QA)
- **Subagente 1 (Mecânica & Fluidez)**: Validação de 60 FPS constantes, física sem travamentos, movimentação precisa, colisão e gerenciamento eficiente de memória.
- **Subagente 2 (Jogabilidade & CrazyGames SDK)**: Validação de interface/HUD responsiva sem sobreposição, efeitos visuais nítidos e chamada correta dos métodos do SDK (`gameplayStart`, `gameplayStop`, `requestAd`).
