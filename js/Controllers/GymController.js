class GymController {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.timerInterval = null;
    this.timerSeconds = 0;
    this.isTimerRunning = false;
  }

  async init() {
    this.view.updateStatus('Baixando Dataset (GitHub)...', false);
    await this.model.initData();
    this.view.updateStatus(`${this.model.exercises.length} Exercícios (EN)`, true);

    this.bindEvents();
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
  }

  bindEvents() {
    // Navegação
    document.getElementById('btn-home-logo').addEventListener('click', () => this.view.switchView('home'));
    document.getElementById('tab-home').addEventListener('click', () => this.view.switchView('home'));

    document.getElementById('nav-btn-view').addEventListener('click', () => this.view.switchView('viewSheet'));
    document.getElementById('tab-view').addEventListener('click', () => this.view.switchView('viewSheet'));

    document.getElementById('nav-btn-control').addEventListener('click', () => this.view.switchView('controlSheet'));
    document.getElementById('tab-control').addEventListener('click', () => this.view.switchView('controlSheet'));

    document.getElementById('nav-btn-add').addEventListener('click', () => this.view.switchView('addExercise'));
    document.getElementById('tab-add').addEventListener('click', () => this.view.switchView('addExercise'));

    // Seleção de Ficha
    document.getElementById('select-view-sheet-target').addEventListener('change', (e) => {
      this.model.setActiveSheet(e.target.value);
      this.refreshAll();
    });

    document.getElementById('select-control-sheet-target').addEventListener('change', (e) => {
      this.model.setActiveSheet(e.target.value);
      this.refreshAll();
    });

    // Filtro por Grupo Muscular na Tela de Controle
    document.getElementById('select-filter-muscle').addEventListener('change', (e) => {
      this.view.renderGlobalExerciseSelect(this.model.exercises, e.target.value);
    });

    // CORREÇÃO: Atualizar a imagem de pré-visualização em tempo real ao selecionar um exercício
    document.getElementById('select-global-exercises').addEventListener('change', (e) => {
      const selectedId = e.target.value;
      const exercise = this.model.exercises.find(ex => ex.id === selectedId);
      this.view.renderControlExercisePreview(exercise);
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

    // Cronômetro de Treino
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

    // Ações na Lista da Tela de Visualização
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

    // Adicionar Exercício à Ficha Selecionada
    document.getElementById('btn-add-to-sheet').addEventListener('click', () => {
      const exId = document.getElementById('select-global-exercises').value;
      const sets = parseInt(document.getElementById('input-sets').value) || 3;
      const reps = parseInt(document.getElementById('input-reps').value) || 10;

      if (exId) {
        this.model.addExerciseToSheet(this.model.activeSheetId, exId, sets, reps);
        this.refreshAll();
      }
    });

    // Modificar Repetições ou Remover Exercício na Tela de Controle
    document.getElementById('list-current-sheet').addEventListener('change', (e) => {
      if (e.target.dataset.repsId) {
        const id = e.target.dataset.repsId;
        const reps = parseInt(e.target.value) || 1;
        this.model.updateSheetItem(this.model.activeSheetId, id, { reps });
        this.refreshAll();
      }
    });

    document.getElementById('list-current-sheet').addEventListener('click', (e) => {
      if (e.target.dataset.removeId) {
        const id = e.target.dataset.removeId;
        this.model.removeExerciseFromSheet(this.model.activeSheetId, id);
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
        this.view.switchView('controlSheet');
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