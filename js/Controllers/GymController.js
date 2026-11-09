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

    this.view.renderActiveSheetDropdown(this.model.sheet, exercisesMap);
    this.view.renderGlobalExerciseSelect(this.model.exercises);
    this.view.renderControlSheetList(this.model.sheet, exercisesMap);

    const activeSelect = document.getElementById('select-active-exercise');
    if (activeSelect.value) {
      const selectedItem = this.model.sheet.find(i => i.id === activeSelect.value);
      this.view.renderExerciseDetail(selectedItem, exercisesMap[activeSelect.value]);
    } else {
      this.view.renderExerciseDetail(null, null);
    }
  }

  bindEvents() {
    // Navigation
    document.getElementById('btn-home-logo').addEventListener('click', () => this.view.switchView('home'));
    document.getElementById('tab-home').addEventListener('click', () => this.view.switchView('home'));

    document.getElementById('nav-btn-view').addEventListener('click', () => this.view.switchView('viewSheet'));
    document.getElementById('tab-view').addEventListener('click', () => this.view.switchView('viewSheet'));

    document.getElementById('nav-btn-control').addEventListener('click', () => this.view.switchView('controlSheet'));
    document.getElementById('tab-control').addEventListener('click', () => this.view.switchView('controlSheet'));

    document.getElementById('nav-btn-add').addEventListener('click', () => this.view.switchView('addExercise'));
    document.getElementById('tab-add').addEventListener('click', () => this.view.switchView('addExercise'));

    // Timer Controls
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
      }
    });

    btnStop.addEventListener('click', () => {
      if (this.isTimerRunning) {
        clearInterval(this.timerInterval);
        this.isTimerRunning = false;
        btnStart.disabled = false;
        btnStart.classList.remove('opacity-50');
        btnStop.disabled = true;

        alert(`Treino Finalizado! Tempo total de treino: ${this.formatTime(this.timerSeconds)}`);
        this.timerSeconds = 0;
        this.view.updateTimerDisplay('00:00:00');
      }
    });

    // Dropdown selection change in View Sheet
    document.getElementById('select-active-exercise').addEventListener('change', (e) => {
      const selectedId = e.target.value;
      const selectedItem = this.model.sheet.find(i => i.id === selectedId);
      const exercise = this.model.exercises.find(ex => ex.id === selectedId);
      this.view.renderExerciseDetail(selectedItem, exercise);
    });

    // Toggle complete exercise
    document.getElementById('btn-toggle-complete').addEventListener('click', () => {
      const selectedId = document.getElementById('select-active-exercise').value;
      if (selectedId) {
        this.model.toggleComplete(selectedId);
        this.refreshAll();
      }
    });

    // Add exercise to active sheet
    document.getElementById('btn-add-to-sheet').addEventListener('click', () => {
      const exId = document.getElementById('select-global-exercises').value;
      const sets = parseInt(document.getElementById('input-sets').value) || 3;
      const reps = parseInt(document.getElementById('input-reps').value) || 10;
      const weight = parseFloat(document.getElementById('input-weight').value) || 0;

      if (exId) {
        this.model.addExerciseToSheet(exId, sets, reps, weight);
        this.refreshAll();
        alert('Exercício adicionado à ficha com sucesso!');
      }
    });

    // Delegation for Control Sheet list (Reps update & Removal)
    document.getElementById('list-current-sheet').addEventListener('change', (e) => {
      if (e.target.dataset.repsId) {
        const id = e.target.dataset.repsId;
        const reps = parseInt(e.target.value) || 1;
        this.model.updateSheetItem(id, { reps });
        this.refreshAll();
      }
    });

    document.getElementById('list-current-sheet').addEventListener('click', (e) => {
      if (e.target.dataset.removeId) {
        const id = e.target.dataset.removeId;
        this.model.removeExerciseFromSheet(id);
        this.refreshAll();
      }
    });

    // Form Submit: Create custom exercise
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