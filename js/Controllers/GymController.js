class GymController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.timerInterval = null;
    this.timerSeconds = 0;
    this.isTimerRunning = false;

    this.viewOrder = ['home', 'viewSheet', 'controlSheet', 'addExercise'];
    this.currentViewIndex = 0;

    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;

    // Configuração temporária de séries na adição de exercício
    this.tempSets = [{ reps: 10 }, { reps: 10 }, { reps: 10 }];
  }

  async init() {
    this.view.updateStatus('Baixando Dataset (GitHub)...', false);
    await this.model.initData();
    this.view.updateStatus(`${this.model.exercises.length} Exercícios (EN)`, true);

    this.bindEvents();
    this.bindSwipeEvents();
    this.refreshAll();
  }

  refreshAll() {
    const exercisesMap = {};
    this.model.exercises.forEach(ex => { exercisesMap[ex.id] = ex; });

    const activeSheet = this.model.getActiveSheet();
    const muscleFilter = document.getElementById('select-filter-muscle').value;

    this.view.renderSheetsDropdowns(this.model.sheets, this.model.activeSheetId);
    this.view.renderSheetExerciseList(activeSheet ? activeSheet.items : [], exercisesMap, this.isTimerRunning);
    this.view.renderGlobalExerciseSelect(this.model.exercises, muscleFilter);
    this.view.renderControlSheetList(activeSheet ? activeSheet.items : [], exercisesMap);
    this.renderTempSetsBuilder();
  }

  changeView(viewName) {
    this.currentViewIndex = this.viewOrder.indexOf(viewName);
    this.view.switchView(viewName);
  }

  bindSwipeEvents() {
    const mainElement = document.querySelector('main');

    mainElement.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    mainElement.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.touchEndY = e.changedTouches[0].screenY;
      this.handleSwipe();
    }, { passive: true });
  }

  handleSwipe() {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX < 0) {
        if (this.currentViewIndex < this.viewOrder.length - 1) {
          this.currentViewIndex++;
          this.view.switchView(this.viewOrder[this.currentViewIndex]);
        }
      } else {
        if (this.currentViewIndex > 0) {
          this.currentViewIndex--;
          this.view.switchView(this.viewOrder[this.currentViewIndex]);
        }
      }
    }
  }

  renderTempSetsBuilder() {
    const container = document.getElementById('temp-sets-container');
    if (!container) return;

    container.innerHTML = '';
    this.tempSets.forEach((s, idx) => {
      const div = document.createElement('div');
      div.className = 'flex items-center gap-2 bg-slate-950 p-1.5 px-2.5 rounded-lg border border-slate-800';
      div.innerHTML = `
        <span class="text-xs font-semibold text-slate-400 w-14">Série ${idx + 1}:</span>
        <input type="number" value="${s.reps}" min="1" data-temp-set-index="${idx}" class="input-temp-set-reps w-16 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-center text-white focus:outline-none focus:border-cyan-500">
        <span class="text-xs text-slate-500">reps</span>
        ${this.tempSets.length > 1 ? `
          <button data-action-remove-temp-set="${idx}" class="ml-auto text-xs text-red-400 hover:text-red-300 font-bold px-1.5 py-0.5">
            ×
          </button>
        ` : ''}
      `;
      container.appendChild(div);
    });
  }

  bindEvents() {
    // Navegação manual por botões/abas
    document.getElementById('btn-home-logo').addEventListener('click', () => this.changeView('home'));
    document.getElementById('tab-home').addEventListener('click', () => this.changeView('home'));

    document.getElementById('nav-btn-view').addEventListener('click', () => this.changeView('viewSheet'));
    document.getElementById('tab-view').addEventListener('click', () => this.changeView('viewSheet'));

    document.getElementById('nav-btn-control').addEventListener('click', () => this.changeView('controlSheet'));
    document.getElementById('tab-control').addEventListener('click', () => this.changeView('controlSheet'));

    document.getElementById('nav-btn-add').addEventListener('click', () => this.changeView('addExercise'));
    document.getElementById('tab-add').addEventListener('click', () => this.changeView('addExercise'));

    // Seleção de Ficha
    document.getElementById('select-view-sheet-target').addEventListener('change', (e) => {
      this.model.setActiveSheet(e.target.value);
      this.refreshAll();
    });

    document.getElementById('select-control-sheet-target').addEventListener('change', (e) => {
      this.model.setActiveSheet(e.target.value);
      this.refreshAll();
    });

    // Filtro por Grupo Muscular
    document.getElementById('select-filter-muscle').addEventListener('change', (e) => {
      this.view.renderGlobalExerciseSelect(this.model.exercises, e.target.value);
    });

    // Atualizar imagem de pré-visualização
    document.getElementById('select-global-exercises').addEventListener('change', (e) => {
      const selectedId = e.target.value;
      const exercise = this.model.exercises.find(ex => ex.id === selectedId);
      this.view.renderControlExercisePreview(exercise);
    });

    // Gerenciador de Séries Temporárias ao Adicionar Novo Exercício na Ficha
    document.getElementById('btn-add-temp-set').addEventListener('click', () => {
      const lastReps = this.tempSets.length > 0 ? this.tempSets[this.tempSets.length - 1].reps : 10;
      this.tempSets.push({ reps: lastReps });
      this.renderTempSetsBuilder();
    });

    document.getElementById('temp-sets-container').addEventListener('change', (e) => {
      if (e.target.dataset.tempSetIndex !== undefined) {
        const idx = parseInt(e.target.dataset.tempSetIndex);
        const reps = parseInt(e.target.value) || 1;
        if (this.tempSets[idx]) this.tempSets[idx].reps = reps;
      }
    });

    document.getElementById('temp-sets-container').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action-remove-temp-set]');
      if (btn) {
        const idx = parseInt(btn.dataset.actionRemoveTempSet);
        if (this.tempSets.length > 1) {
          this.tempSets.splice(idx, 1);
          this.renderTempSetsBuilder();
        }
      }
    });

    // Criar / Excluir Fichas
    document.getElementById('btn-create-sheet').addEventListener('click', () => {
      const nameInput = document.getElementById('input-new-sheet-name');
      const name = nameInput.value.trim();
      if (name) {
        this.model.createSheet(name);
        nameInput.value = '';
        this.refreshAll();
        alert(`Ficha "${name}" criada!`);
      }
    });

    document.getElementById('btn-delete-sheet').addEventListener('click', () => {
      const activeSheet = this.model.getActiveSheet();
      if (confirm(`Deseja realmente excluir a ficha "${activeSheet.name}"?`)) {
        const deleted = this.model.deleteSheet(activeSheet.id);
        if (deleted) {
          this.refreshAll();
        } else {
          alert('Não é possível excluir a única ficha restante.');
        }
      }
    });

    // Cronômetro
    const btnStart = document.getElementById('btn-start-timer');
    const btnStop = document.getElementById('btn-stop-timer');

    btnStart.addEventListener('click', () => {
      if (!this.isTimerRunning) {
        this.isTimerRunning = true;
        btnStart.disabled = true;
        btnStart.classList.add('opacity-50');
        btnStop.disabled = false;

        this.timerInterval = setInterval(() => {
          this.timerSeconds++;
          this.view.updateTimerDisplay(this.formatTime(this.timerSeconds));
        }, 1000);

        this.refreshAll();
      }
    });

    btnStop.addEventListener('click', () => {
      if (this.isTimerRunning) {
        clearInterval(this.timerInterval);
        this.isTimerRunning = false;
        btnStart.disabled = false;
        btnStart.classList.remove('opacity-50');
        btnStop.disabled = true;

        const activeSheet = this.model.getActiveSheet();
        const exercisesMap = {};
        this.model.exercises.forEach(ex => { exercisesMap[ex.id] = ex; });

        const completedItems = activeSheet.items.filter(item => item.completed);
        const completedNames = completedItems.map(item => {
          const ex = exercisesMap[item.id];
          return ex ? `• ${ex.name}` : null;
        }).filter(Boolean);

        const totalTimeStr = this.formatTime(this.timerSeconds);
        
        let summaryText = `🎉 Treino Finalizado!\n\nTempo Total: ${totalTimeStr}\n\n`;
        if (completedNames.length > 0) {
          summaryText += `Exercícios Concluídos (${completedNames.length}):\n${completedNames.join('\n')}`;
        } else {
          summaryText += `Nenhum exercício foi marcado como concluído.`;
        }

        alert(summaryText);

        this.timerSeconds = 0;
        this.view.updateTimerDisplay('00:00:00');
        this.model.resetSheetCompletions(activeSheet.id);
        
        this.refreshAll();
      }
    });

    // Ações na Tela de Visualização
    document.getElementById('view-sheet-exercises-list').addEventListener('change', (e) => {
      if (!this.isTimerRunning) return;
      if (e.target.dataset.weightId) {
        const exerciseId = e.target.dataset.weightId;
        const weight = parseFloat(e.target.value) || 0;
        this.model.updateSheetItem(this.model.activeSheetId, exerciseId, { weight });
      }
    });

    document.getElementById('view-sheet-exercises-list').addEventListener('click', (e) => {
      if (!this.isTimerRunning) return;
      const toggleBtn = e.target.closest('[data-action-toggle-complete]');
      if (toggleBtn) {
        const exerciseId = toggleBtn.dataset.actionToggleComplete;
        this.model.toggleComplete(this.model.activeSheetId, exerciseId);
        this.refreshAll();
      }
    });

    // Adicionar Exercício à Ficha Selecionada com Séries Dinâmicas
    document.getElementById('btn-add-to-sheet').addEventListener('click', () => {
      const exId = document.getElementById('select-global-exercises').value;
      if (exId) {
        const setsCopy = JSON.parse(JSON.stringify(this.tempSets));
        this.model.addExerciseToSheet(this.model.activeSheetId, exId, setsCopy);
        this.refreshAll();
      }
    });

    // Edição Dinâmica de Séries na Tela de Controle (Adicionar, Remover, Alterar Reps)
    document.getElementById('list-current-sheet').addEventListener('click', (e) => {
      const addSetBtn = e.target.closest('[data-action-add-set]');
      if (addSetBtn) {
        const exId = addSetBtn.dataset.actionAddSet;
        this.model.addSetToExercise(this.model.activeSheetId, exId);
        this.refreshAll();
        return;
      }

      const removeSetBtn = e.target.closest('[data-action-remove-set]');
      if (removeSetBtn) {
        const exId = removeSetBtn.dataset.actionRemoveSet;
        const setIdx = parseInt(removeSetBtn.dataset.setIndex);
        this.model.removeSetFromExercise(this.model.activeSheetId, exId, setIdx);
        this.refreshAll();
        return;
      }

      const removeExBtn = e.target.closest('[data-remove-id]');
      if (removeExBtn) {
        const id = removeExBtn.dataset.removeId;
        this.model.removeExerciseFromSheet(this.model.activeSheetId, id);
        this.refreshAll();
        return;
      }
    });

    document.getElementById('list-current-sheet').addEventListener('change', (e) => {
      if (e.target.classList.contains('input-set-reps')) {
        const exId = e.target.dataset.exId;
        const setIdx = parseInt(e.target.dataset.setIndex);
        const reps = parseInt(e.target.value) || 1;
        this.model.updateSetReps(this.model.activeSheetId, exId, setIdx, reps);
        this.refreshAll();
      }
    });

    // Criar Exercício Customizado
    document.getElementById('form-create-exercise').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('new-ex-name').value.trim();
      const image = document.getElementById('new-ex-image').value.trim();
      const muscle = document.getElementById('new-ex-muscle').value;

      if (name) {
        this.model.addCustomExercise(name, image, muscle);
        this.refreshAll();
        e.target.reset();
        alert(`Exercício "${name}" criado com sucesso!`);
        this.changeView('controlSheet');
      }
    });
  }

  formatTime(sec) {
    const hrs = Math.floor(sec / 3600).toString().padStart(2, '0');
    const mins = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const secs = (sec % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  }
}