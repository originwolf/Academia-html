class GymModel {
  constructor() {
    this.STORAGE_KEY_EXERCISES = 'gym_exercises_dataset_en_v1';
    this.STORAGE_KEY_SHEETS = 'gym_user_sheets_v4';
    this.STORAGE_KEY_ACTIVE_SHEET_ID = 'gym_active_sheet_id_v4';
    
    this.exercises = [];
    this.sheets = [];
    this.activeSheetId = null;

    this.muscleGroupMapping = {
      'back': 'Dorsais', 'lats': 'Dorsais',
      'chest': 'Peito',
      'shoulders': 'Ombro', 'delts': 'Ombro',
      'quads': 'Perna', 'quadriceps': 'Perna', 'hamstrings': 'Perna', 'calves': 'Perna', 'glutes': 'Perna',
      'biceps': 'Bíceps',
      'triceps': 'Tríceps',
      'traps': 'Trapézio', 'trapezius': 'Trapézio'
    };
  }

  async initData() {
    const localEx = localStorage.getItem(this.STORAGE_KEY_EXERCISES);
    if (localEx) {
      this.exercises = JSON.parse(localEx);
    } else {
      await this.fetchGitHubExercises();
    }

    const localSheets = localStorage.getItem(this.STORAGE_KEY_SHEETS);
    if (localSheets) {
      this.sheets = JSON.parse(localSheets);
    } else {
      this.sheets = [
        {
          id: 'sheet_a',
          name: 'Treino A - Peito e Tríceps',
          items: this.exercises.slice(0, 3).map(ex => ({
            id: ex.id,
            sets: [{ reps: 10 }, { reps: 8 }, { reps: 6 }],
            weight: 20,
            completed: false
          }))
        },
        {
          id: 'sheet_b',
          name: 'Treino B - Dorsais e Bíceps',
          items: []
        }
      ];
      this.saveSheets();
    }

    const activeId = localStorage.getItem(this.STORAGE_KEY_ACTIVE_SHEET_ID);
    if (activeId && this.sheets.some(s => s.id === activeId)) {
      this.activeSheetId = activeId;
    } else if (this.sheets.length > 0) {
      this.activeSheetId = this.sheets[0].id;
      this.saveActiveSheetId();
    }
  }

  async fetchGitHubExercises() {
    try {
      const response = await fetch('https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json');
      const rawData = await response.json();

      this.exercises = rawData.map(item => {
        let muscle = 'Peito';
        const targetLower = (item.target || item.category || '').toLowerCase();
        
        for (const [key, value] of Object.entries(this.muscleGroupMapping)) {
          if (targetLower.includes(key)) {
            muscle = value;
            break;
          }
        }

        const rawImg = item.image || item.gif_url || '';
        const imgUrl = rawImg ? `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/${rawImg}` : 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500';

        return {
          id: String(item.id || Math.random().toString(36).substr(2, 9)),
          name: item.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : 'Exercise',
          image: imgUrl,
          muscleGroup: muscle
        };
      });

      this.saveExercises();
    } catch (err) {
      this.exercises = [
        { id: '0001', name: 'Barbell Bench Press', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500', muscleGroup: 'Peito' },
        { id: '0002', name: 'Barbell Squat', image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500', muscleGroup: 'Perna' }
      ];
      this.saveExercises();
    }
  }

  saveExercises() {
    localStorage.setItem(this.STORAGE_KEY_EXERCISES, JSON.stringify(this.exercises));
  }

  saveSheets() {
    localStorage.setItem(this.STORAGE_KEY_SHEETS, JSON.stringify(this.sheets));
  }

  saveActiveSheetId() {
    localStorage.setItem(this.STORAGE_KEY_ACTIVE_SHEET_ID, this.activeSheetId);
  }

  createSheet(name) {
    const newSheet = {
      id: 'sheet_' + Date.now(),
      name: name,
      items: []
    };
    this.sheets.push(newSheet);
    this.activeSheetId = newSheet.id;
    this.saveSheets();
    this.saveActiveSheetId();
    return newSheet;
  }

  deleteSheet(sheetId) {
    if (this.sheets.length <= 1) return false;
    this.sheets = this.sheets.filter(s => s.id !== sheetId);
    if (this.activeSheetId === sheetId) {
      this.activeSheetId = this.sheets[0].id;
      this.saveActiveSheetId();
    }
    this.saveSheets();
    return true;
  }

  getActiveSheet() {
    return this.sheets.find(s => s.id === this.activeSheetId) || this.sheets[0];
  }

  setActiveSheet(sheetId) {
    if (this.sheets.some(s => s.id === sheetId)) {
      this.activeSheetId = sheetId;
      this.saveActiveSheetId();
    }
  }

  addCustomExercise(name, image, muscleGroup) {
    const newEx = {
      id: 'custom_' + Date.now(),
      name,
      image: image || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500',
      muscleGroup
    };
    this.exercises.unshift(newEx);
    this.saveExercises();
    return newEx;
  }

  addExerciseToSheet(sheetId, exerciseId, setsArray) {
    const sheet = this.sheets.find(s => s.id === sheetId);
    if (!sheet) return;

    const existing = sheet.items.find(item => item.id === exerciseId);
    if (existing) {
      existing.sets = setsArray;
    } else {
      sheet.items.push({
        id: exerciseId,
        sets: setsArray,
        weight: 0,
        completed: false
      });
    }
    this.saveSheets();
  }

  removeExerciseFromSheet(sheetId, exerciseId) {
    const sheet = this.sheets.find(s => s.id === sheetId);
    if (sheet) {
      sheet.items = sheet.items.filter(item => item.id !== exerciseId);
      this.saveSheets();
    }
  }

  addSetToExercise(sheetId, exerciseId, defaultReps = 10) {
    const sheet = this.sheets.find(s => s.id === sheetId);
    if (sheet) {
      const item = sheet.items.find(i => i.id === exerciseId);
      if (item) {
        if (!Array.isArray(item.sets)) item.sets = [];
        item.sets.push({ reps: defaultReps });
        this.saveSheets();
      }
    }
  }

  removeSetFromExercise(sheetId, exerciseId, setIndex) {
    const sheet = this.sheets.find(s => s.id === sheetId);
    if (sheet) {
      const item = sheet.items.find(i => i.id === exerciseId);
      if (item && Array.isArray(item.sets) && item.sets.length > 1) {
        item.sets.splice(setIndex, 1);
        this.saveSheets();
      }
    }
  }

  updateSetReps(sheetId, exerciseId, setIndex, reps) {
    const sheet = this.sheets.find(s => s.id === sheetId);
    if (sheet) {
      const item = sheet.items.find(i => i.id === exerciseId);
      if (item && Array.isArray(item.sets) && item.sets[setIndex]) {
        item.sets[setIndex].reps = reps;
        this.saveSheets();
      }
    }
  }

  updateSheetItem(sheetId, exerciseId, updates) {
    const sheet = this.sheets.find(s => s.id === sheetId);
    if (sheet) {
      const item = sheet.items.find(i => i.id === exerciseId);
      if (item) {
        Object.assign(item, updates);
        this.saveSheets();
      }
    }
  }

  toggleComplete(sheetId, exerciseId) {
    const sheet = this.sheets.find(s => s.id === sheetId);
    if (sheet) {
      const item = sheet.items.find(i => i.id === exerciseId);
      if (item) {
        item.completed = !item.completed;
        this.saveSheets();
        return item.completed;
      }
    }
    return false;
  }

  resetSheetCompletions(sheetId) {
    const sheet = this.sheets.find(s => s.id === sheetId);
    if (sheet) {
      sheet.items.forEach(item => { item.completed = false; });
      this.saveSheets();
    }
  }
}