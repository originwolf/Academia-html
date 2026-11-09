class GymView {
  constructor() {
    this.views = {
      home: document.getElementById('view-home'),
      viewSheet: document.getElementById('view-view-sheet'),
      controlSheet: document.getElementById('view-control-sheet'),
      addExercise: document.getElementById('view-add-exercise')
    };

    this.navTabs = {
      home: document.getElementById('tab-home'),
      view: document.getElementById('tab-view'),
      control: document.getElementById('tab-control'),
      add: document.getElementById('tab-add')
    };
  }

  switchView(viewName) {
    Object.values(this.views).forEach(v => v.classList.add('hidden'));
    Object.values(this.navTabs).forEach(tab => {
      tab.classList.remove('text-indigo-400', 'font-semibold');
      tab.classList.add('text-slate-400');
    });

    if (viewName === 'home') {
      this.views.home.classList.remove('hidden');
      this.navTabs.home.classList.add('text-indigo-400', 'font-semibold');
    } else if (viewName === 'viewSheet') {
      this.views.viewSheet.classList.remove('hidden');
      this.navTabs.view.classList.add('text-indigo-400', 'font-semibold');
    } else if (viewName === 'controlSheet') {
      this.views.controlSheet.classList.remove('hidden');
      this.navTabs.control.classList.add('text-indigo-400', 'font-semibold');
    } else if (viewName === 'addExercise') {
      this.views.addExercise.classList.remove('hidden');
      this.navTabs.add.classList.add('text-indigo-400', 'font-semibold');
    }
  }

  updateStatus(text, isReady = true) {
    const statusText = document.getElementById('status-text');
    const statusDot = document.getElementById('status-dot');
    statusText.textContent = text;
    if (isReady) {
      statusDot.classList.remove('bg-yellow-500', 'animate-pulse');
      statusDot.classList.add('bg-emerald-500');
    } else {
      statusDot.classList.remove('bg-emerald-500');
      statusDot.classList.add('bg-yellow-500', 'animate-pulse');
    }
  }

  renderSheetsDropdowns(sheets, activeSheetId) {
    const viewSelect = document.getElementById('select-view-sheet-target');
    const controlSelect = document.getElementById('select-control-sheet-target');

    viewSelect.innerHTML = '';
    controlSelect.innerHTML = '';

    sheets.forEach(sheet => {
      const opt1 = document.createElement('option');
      opt1.value = sheet.id;
      opt1.textContent = `${sheet.name} (${sheet.items.length} ex)`;
      if (sheet.id === activeSheetId) opt1.selected = true;
      viewSelect.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = sheet.id;
      opt2.textContent = sheet.name;
      if (sheet.id === activeSheetId) opt2.selected = true;
      controlSelect.appendChild(opt2);
    });
  }

  renderSheetExerciseList(sheetItems, exercisesMap, isTimerRunning) {
    const container = document.getElementById('view-sheet-exercises-list');
    const counter = document.getElementById('completed-counter');
    container.innerHTML = '';

    if (!sheetItems || sheetItems.length === 0) {
      container.innerHTML = '<div class="text-xs text-slate-500 p-6 bg-slate-900 border border-slate-800 rounded-xl text-center">Nenhum exercício nesta ficha. Adicione exercícios na aba "Controlar".</div>';
      counter.textContent = '0/0 Concluídos';
      return;
    }

    const completedCount = sheetItems.filter(i => i.completed).length;
    counter.textContent = `${completedCount}/${sheetItems.length} Concluídos`;

    if (!isTimerRunning) {
      const warningBanner = document.createElement('div');
      warningBanner.className = 'p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs text-center font-medium mb-3';
      warningBanner.textContent = '⚠️ Inicie o treino acima para poder marcar exercícios e alterar os pesos.';
      container.appendChild(warningBanner);
    }

    sheetItems.forEach(item => {
      const ex = exercisesMap[item.id] || { name: 'Exercício Desconhecido', muscleGroup: '-', image: '' };
      const card = document.createElement('div');
      
      const disabledAttr = !isTimerRunning ? 'disabled' : '';
      const disabledClass = !isTimerRunning ? 'opacity-50 cursor-not-allowed' : '';

      if (item.completed) {
        card.className = `bg-slate-900/60 border border-emerald-900/40 rounded-xl overflow-hidden transition-all ${disabledClass}`;
        card.innerHTML = `
          <div class="p-3 flex items-center justify-between">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                ✓
              </div>
              <div class="min-w-0">
                <h4 class="font-semibold text-sm text-slate-400 line-through truncate">${ex.name}</h4>
                <span class="text-xs text-slate-500">${ex.muscleGroup} • ${item.sets}x${item.reps} • ${item.weight || 0}kg</span>
              </div>
            </div>
            <button ${disabledAttr} class="text-xs text-indigo-400 font-semibold hover:underline shrink-0 ml-2 ${disabledClass}" data-action-toggle-complete="${item.id}">
              Desmarcar
            </button>
          </div>
        `;
      } else {
        card.className = `bg-slate-900 border border-slate-800 rounded-xl overflow-hidden space-y-3 p-4 shadow-lg ${disabledClass}`;
        card.innerHTML = `
          <div class="flex gap-3 items-start">
            <div class="w-20 h-20 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shrink-0 flex items-center justify-center">
              <img src="${ex.image}" alt="${ex.name}" class="w-full h-full object-contain">
            </div>
            <div class="min-w-0 flex-1">
              <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-400 font-semibold border border-slate-700 inline-block mb-1">${ex.muscleGroup}</span>
              <h4 class="font-bold text-base text-white leading-tight">${ex.name}</h4>
              <p class="text-xs text-slate-400 mt-1">${item.sets} séries × ${item.reps} repetições</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-1 items-center">
            <div class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <span class="text-xs text-slate-400">Carga:</span>
              <div class="flex items-center gap-1">
                <input type="number" value="${item.weight || 0}" step="0.5" min="0" ${disabledAttr} data-weight-id="${item.id}" class="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-sm font-bold text-indigo-400 text-center focus:outline-none focus:border-indigo-500 ${disabledClass}">
                <span class="text-xs text-slate-500 font-semibold">kg</span>
              </div>
            </div>

            <button ${disabledAttr} data-action-toggle-complete="${item.id}" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition shadow-md flex items-center justify-center gap-1.5 ${disabledClass}">
              <span>Concluir</span>
            </button>
          </div>
        `;
      }

      container.appendChild(card);
    });
  }

  renderGlobalExerciseSelect(exercises, selectedMuscle = 'ALL') {
    const select = document.getElementById('select-global-exercises');
    select.innerHTML = '';

    const filtered = selectedMuscle === 'ALL' 
      ? exercises 
      : exercises.filter(ex => ex.muscleGroup === selectedMuscle);

    if (filtered.length === 0) {
      select.innerHTML = '<option value="">Nenhum exercício encontrado para este grupo</option>';
      this.renderControlExercisePreview(null);
      return;
    }

    filtered.forEach(ex => {
      const opt = document.createElement('option');
      opt.value = ex.id;
      opt.textContent = `${ex.name} [${ex.muscleGroup}]`;
      select.appendChild(opt);
    });

    const firstSelected = filtered.find(ex => ex.id === select.value);
    this.renderControlExercisePreview(firstSelected);
  }

  renderControlExercisePreview(exercise) {
    const container = document.getElementById('control-exercise-preview-container');
    const img = document.getElementById('control-exercise-preview-img');

    if (exercise && exercise.image) {
      img.src = exercise.image;
      img.alt = exercise.name;
      container.classList.remove('hidden');
    } else {
      img.src = '';
      container.classList.add('hidden');
    }
  }

  renderControlSheetList(sheetItems, exercisesMap) {
    const container = document.getElementById('list-current-sheet');
    container.innerHTML = '';

    if (!sheetItems || sheetItems.length === 0) {
      container.innerHTML = '<div class="text-xs text-slate-500 p-4 text-center">Ficha vazia. Adicione exercícios acima.</div>';
      return;
    }

    sheetItems.forEach(item => {
      const ex = exercisesMap[item.id] || { name: 'Exercício Desconhecido', muscleGroup: '-' };
      
      const card = document.createElement('div');
      card.className = 'bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3';
      card.innerHTML = `
        <div class="min-w-0 flex-1">
          <h4 class="font-bold text-sm text-white truncate">${ex.name}</h4>
          <span class="text-xs text-slate-400">${ex.muscleGroup}</span>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">Reps:</span>
            <input type="number" value="${item.reps}" min="1" data-reps-id="${item.id}" class="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-center text-white focus:outline-none focus:border-cyan-500">
            <span class="text-xs text-slate-400">| ${item.sets} séries</span>
          </div>
        </div>
        <button data-remove-id="${item.id}" class="p-2 bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900 hover:text-white rounded-lg transition text-xs">
          Remover
        </button>
      `;
      container.appendChild(card);
    });
  }

  updateTimerDisplay(formattedTime) {
    document.getElementById('timer-display').textContent = formattedTime;
  }
}