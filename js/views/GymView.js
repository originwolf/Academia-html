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

  renderActiveSheetDropdown(sheetItems, exercisesMap) {
    const select = document.getElementById('select-active-exercise');
    select.innerHTML = '';

    if (sheetItems.length === 0) {
      select.innerHTML = '<option value="">Nenhum exercício na ficha</option>';
      return;
    }

    sheetItems.forEach(item => {
      const ex = exercisesMap[item.id];
      if (ex) {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = `${item.completed ? '✓ ' : ''}${ex.name} (${ex.muscleGroup})`;
        select.appendChild(opt);
      }
    });
  }

  renderExerciseDetail(sheetItem, exercise) {
    const detailBox = document.getElementById('view-exercise-detail');
    if (!sheetItem || !exercise) {
      detailBox.classList.add('hidden');
      return;
    }

    detailBox.classList.remove('hidden');
    document.getElementById('exercise-detail-title').textContent = exercise.name;
    document.getElementById('exercise-detail-muscle').textContent = exercise.muscleGroup;
    document.getElementById('exercise-detail-img').src = exercise.image;
    document.getElementById('exercise-detail-sets-reps').textContent = `${sheetItem.sets}x ${sheetItem.reps}`;
    document.getElementById('exercise-detail-weight').textContent = `${sheetItem.weight} kg`;

    const btnComplete = document.getElementById('btn-toggle-complete');
    if (sheetItem.completed) {
      btnComplete.textContent = '✓ Concluído';
      btnComplete.className = 'w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition';
    } else {
      btnComplete.textContent = 'Marcar como Concluído';
      btnComplete.className = 'w-full py-3 bg-slate-800 border border-slate-700 text-slate-300 font-semibold rounded-xl transition hover:border-slate-600';
    }
  }

  renderGlobalExerciseSelect(exercises) {
    const select = document.getElementById('select-global-exercises');
    select.innerHTML = '';
    exercises.forEach(ex => {
      const opt = document.createElement('option');
      opt.value = ex.id;
      opt.textContent = `${ex.name} [${ex.muscleGroup}]`;
      select.appendChild(opt);
    });
  }

  renderControlSheetList(sheetItems, exercisesMap) {
    const container = document.getElementById('list-current-sheet');
    container.innerHTML = '';

    if (sheetItems.length === 0) {
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
            <span class="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">Reps:</span>
            <input type="number" value="${item.reps}" min="1" data-reps-id="${item.id}" class="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-center text-white focus:outline-none focus:border-cyan-500">
            <span class="text-xs text-slate-400">| ${item.sets}x / ${item.weight}kg</span>
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