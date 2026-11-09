class GymModel {
  constructor() {
    this.STORAGE_KEY_EXERCISES = 'gym_exercises_dataset_en_v1';
    this.STORAGE_KEY_SHEET = 'gym_user_active_sheet_v1';
    
    this.exercises = [];
    this.sheet = [];
    this.muscleGroupMapping = {
      'back': 'Dorsais',
      'lats': 'Dorsais',
      'chest': 'Peito',
      'shoulders': 'Ombro',
      'delts': 'Ombro',
      'quads': 'Perna',
      'quadriceps': 'Perna',
      'hamstrings': 'Perna',
      'calves': 'Perna',
      'glutes': 'Perna',
      'biceps': 'Bíceps',
      'triceps': 'Tríceps',
      'traps': 'Trapézio',
      'trapezius': 'Trapézio'
    };
  }

  async initData() {
    const localEx = localStorage.getItem(this.STORAGE_KEY_EXERCISES);
    if (localEx) {
      this.exercises = JSON.parse(localEx);
    } else {
      await this.fetchGitHubExercises();
    }

    const localSheet = localStorage.getItem(this.STORAGE_KEY_SHEET);
    if (localSheet) {
      this.sheet = JSON.parse(localSheet);
    } else {
      // Pre-load default sheet from dataset
      this.sheet = this.exercises.slice(0, 4).map(ex => ({
        id: ex.id,
        sets: 3,
        reps: 10,
        weight: 20,
        completed: false
      }));
      this.saveSheet();
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
      console.warn('Falha ao baixar dataset original do GitHub. Utilizando backup de fallback.', err);
      this.exercises = [
        { id: '0001', name: 'Barbell Bench Press', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500', muscleGroup: 'Peito' },
        { id: '0002', name: 'Barbell Squat', image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500', muscleGroup: 'Perna' },
        { id: '0003', name: 'Pull-up', image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500', muscleGroup: 'Dorsais' }
      ];
      this.saveExercises();
    }
  }

  saveExercises() {
    localStorage.setItem(this.STORAGE_KEY_EXERCISES, JSON.stringify(this.exercises));
  }

  saveSheet() {
    localStorage.setItem(this.STORAGE_KEY_SHEET, JSON.stringify(this.sheet));
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

  addExerciseToSheet(exerciseId, sets, reps, weight) {
    const existing = this.sheet.find(item => item.id === exerciseId);
    if (existing) {
      existing.sets = sets;
      existing.reps = reps;
      existing.weight = weight;
    } else {
      this.sheet.push({
        id: exerciseId,
        sets,
        reps,
        weight,
        completed: false
      });
    }
    this.saveSheet();
  }

  removeExerciseFromSheet(exerciseId) {
    this.sheet = this.sheet.filter(item => item.id !== exerciseId);
    this.saveSheet();
  }

  updateSheetItem(exerciseId, updates) {
    const item = this.sheet.find(i => i.id === exerciseId);
    if (item) {
      Object.assign(item, updates);
      this.saveSheet();
    }
  }

  toggleComplete(exerciseId) {
    const item = this.sheet.find(i => i.id === exerciseId);
    if (item) {
      item.completed = !item.completed;
      this.saveSheet();
      return item.completed;
    }
    return false;
  }
}