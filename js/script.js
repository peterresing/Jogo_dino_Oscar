/* ═══ Jogo do Dino — lógica do jogo ═══ */
const DINOS = [
    { emoji: "🦕", name: "Braquio" },
    { emoji: "🦖", name: "T-Rex" },
    { emoji: "🐉", name: "Dragão" },
    { emoji: "🦎", name: "Iguana" },
    { emoji: "🐊", name: "Crocosso" },
    { emoji: "🦴", name: "Osso" },
    { emoji: "🥚", name: "Dinovo" },
    { emoji: "🌋", name: "Vulcano" },
    { emoji: "🍃", name: "Folhasso" },
    { emoji: "⚡", name: "Rapto" },
    { emoji: "🐢", name: "Tarta" },
  ];
  
  const PRIZE_LIMIT = 1000;
  let totalArrecadado = 0;
  let totalPremios = 0;
  let selectedDino = null;
  let freeRound = false;
  let lastBet = 0;
  let gameOver = false;
  
  /* ─── Formatação ─── */
  function fmt(v) {
    return 'R$ ' + v.toFixed(2).replace('.', ',');
  }
  
  /* ─── Renderiza grid de dinos ─── */
  function renderDinos() {
    const grid = document.getElementById('dinos-grid');
    grid.innerHTML = '';
    DINOS.forEach((d, i) => {
      const btn = document.createElement('button');
      btn.className = 'dino-btn' + (selectedDino === i ? ' selected' : '');
      btn.innerHTML = `${d.emoji}<span>${d.name}</span>`;
      btn.onclick = () => { selectedDino = i; renderDinos(); };
      grid.appendChild(btn);
    });
  }
  
  /* ─── Atualiza painel de stats ─── */
  function updateStats() {
    document.getElementById('stat-arrecadado').textContent = fmt(totalArrecadado);
    document.getElementById('stat-premios').textContent = fmt(totalPremios);
    document.getElementById('stat-limite').textContent = fmt(Math.max(0, PRIZE_LIMIT - totalPremios));
    const pct = Math.min(100, (totalPremios / PRIZE_LIMIT) * 100);
    document.getElementById('limit-bar').style.width = pct + '%';
    document.getElementById('limit-pct').textContent = pct.toFixed(0) + '%';
    if (pct >= 100) {
      document.getElementById('limit-bar').style.background = '#e24b4a';
    }
  }
  
  /* ─── Escolha aleatória ─── */
  function escolherAleatorio() {
    selectedDino = Math.floor(Math.random() * DINOS.length);
    renderDinos();
  }
  
  /* ─── Init (mantenha sempre no fim do arquivo) ─── */
  renderDinos();
  updateStats();
  
  /* ─── Lógica principal da aposta ─── */
  function apostar() {
    if (gameOver) {
      showResult('🔒 O limite de prêmios foi atingido. Obrigado por jogar!', 'info');
      return;
    }
  
    let valor = 0;
  
    if (freeRound) {
      // Rodada grátis não cobra o jogador, usa o valor da última aposta como base
      valor = lastBet > 0 ? lastBet : 10;
    } else {
      valor = parseFloat(document.getElementById('valor').value);
      if (!valor || valor <= 0) { 
        showResult('Digite um valor válido para apostar!', 'info'); 
        return; 
      }
      lastBet = valor;
      totalArrecadado += valor;
      updateStats();
    }
  
    if (selectedDino === null) { 
      showResult('Escolha um dinossauro antes de apostar!', 'info'); 
      return; 
    }
  
    const sorteado = Math.floor(Math.random() * DINOS.length);
    const premio = valor * 2;
    document.getElementById('jackpot-area').innerHTML = '';
    const acertou = selectedDino === sorteado;
  
    if (acertou) {
      // Verificação: limite global de prêmios atingido
      if (totalPremios + premio > PRIZE_LIMIT) {
        gameOver = true;
        showResult(
          `🦕 O dino sorteado foi ${DINOS[sorteado].emoji} ${DINOS[sorteado].name}. Você acertou! Mas o limite de prêmios foi atingido. Ninguém mais pode ganhar hoje. 😈`,
          'lose'
        );
        if (freeRound) freeRound = false;
        updateStats();
        return;
      }
  
      // Pagamento legítimo (seja rodada paga ou grátis)
      totalPremios += premio;
      updateStats();
      if (totalPremios >= PRIZE_LIMIT) gameOver = true;
  
      const prefixo = freeRound ? '🎁 [RODADA GRÁTIS] ' : '🎉 ';
      showResult(
        `${prefixo}PARABÉNS! O dino sorteado foi ${DINOS[sorteado].emoji} ${DINOS[sorteado].name}! Você ganhou ${fmt(premio)}!`,
        'win'
      );
      
      if (freeRound) freeRound = false;
      mostrarJackpot();
    } else {
      // Perdeu
      const msg = freeRound
        ? `🎁 Rodada grátis usada! O dino sorteado foi ${DINOS[sorteado].emoji} ${DINOS[sorteado].name}. Não foi dessa vez!`
        : `😢 Que pena! O dino sorteado foi ${DINOS[sorteado].emoji} ${DINOS[sorteado].name}. Tente novamente!`;
      showResult(msg, 'lose');
      if (freeRound) freeRound = false;
    }
  }
  
  /* ─── Botão Chance Única 50x ─── */
  function mostrarJackpot() {
    const area = document.getElementById('jackpot-area');
    area.innerHTML = `
      <button class="btn-jackpot" onclick="tentarJackpot(this)">
        ⚡ Chance única: 50x — ${fmt(lastBet * 50)}
      </button>`;
  }
  
  function tentarJackpot(btn) {
    btn.parentElement.innerHTML = '';
    if (gameOver) {
      showResult('🔒 O limite de prêmios já foi atingido!', 'info');
      return;
    }
  
    const sorteado = Math.floor(Math.random() * DINOS.length);
    const premio = lastBet * 50;
  
    if (selectedDino === sorteado) {
      if (totalPremios + premio > PRIZE_LIMIT) {
        gameOver = true;
        showResult(
          `🚨 INCRÍVEL! O dino sorteado no 50x foi ${DINOS[sorteado].emoji} ${DINOS[sorteado].name}! Mas estourou o limite de prêmios da casa.`,
          'lose'
        );
        updateStats();
        return;
      }
  
      totalPremios += premio;
      updateStats();
      if (totalPremios >= PRIZE_LIMIT) gameOver = true;
  
      showResult(
        `🔥 JACKPOT 50x! O dino foi ${DINOS[sorteado].emoji} ${DINOS[sorteado].name}! GG, CARA JACKPOOOOOOT ${fmt(premio)}! 🚀`,
        'win'
      );
    } else {
      showResult(
        `💀 O dino sorteado no 50x foi ${DINOS[sorteado].emoji} ${DINOS[sorteado].name}. Hell nah cuh, hell nah, nah cuh`,
        'lose'
      );
    }
  }
  
  /* ─── Exibição de resultado ─── */
  function showResult(msg, type) {
    const area = document.getElementById('result-area');
    const cls = type === 'win' ? 'result-win' : type === 'lose' ? 'result-lose' : 'result-info';
    area.innerHTML = `<div class="result-box ${cls}">${msg}</div>`;
  }
  
  /* ─── Modal secreto da Dona Bete ─── */
  function showSecretModal() {
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-title').textContent = '🔒 Área da Dona Bete';
    document.getElementById('modal-body').innerHTML = `
      <input type="password" id="modal-input" placeholder="Digite a senha" maxlength="10" />
      <div class="modal-btns">
        <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
        <button class="btn-primary" onclick="checkSenha()">Confirmar</button>
      </div>`;
    setTimeout(() => document.getElementById('modal-input')?.focus(), 100);
  }
  
  function checkSenha() {
    const val = document.getElementById('modal-input')?.value || '';
    closeModal();
    setTimeout(() => {
      if (val === '0171') {
        const lucro = totalArrecadado - totalPremios;
        document.getElementById('modal-overlay').style.display = 'flex';
        document.getElementById('modal-title').textContent = '💰 Relatório da Dona Bete';
        document.getElementById('modal-body').innerHTML = `
          <div class="modal-info">
            Arrecadado: <b>${fmt(totalArrecadado)}</b><br>
            Prêmios pagos: <b>${fmt(totalPremios)}</b><br>
            <span style="color:#27500a;font-weight:500;">Lucro líquido: ${fmt(lucro)}</span>
          </div>
          <button class="btn-primary" onclick="closeModal()">Fechar</button>`;
      } else {
        freeRound = true;
        document.getElementById('modal-overlay').style.display = 'flex';
        document.getElementById('modal-title').textContent = '🎁 Surpresa!';
        document.getElementById('modal-body').innerHTML = `
          <div class="modal-info">
            Você ganhou uma rodada grátis! 🎉<br>
            <small style="font-size:12px;color:#aaa">(A casa agradece pela tentativa 😇)</small>
          </div>
          <button class="btn-primary" onclick="closeModal()">Eba!</button>`;
      }
    }, 150);
  }
  
  function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
  }