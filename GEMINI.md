# GEMINI.md - Academia HTML (GymTracker MVC)

## Project Overview
**GymTracker MVC** is a lightweight, mobile-first Single Page Application (SPA) designed for tracking gym workouts, customizing training sheets, and managing exercises. The application is built using vanilla JavaScript following a strict **Model-View-Controller (MVC)** architectural pattern, styled with Tailwind CSS (CDN) and custom CSS, and deployed on Netlify.

### Key Features
- **Workout Tracking & Timer:** Start/stop workout sessions with a live stopwatch, toggle exercise completion, and log load weights (kg) during active sessions.
- **Workout Sheet Management:** Create, switch, and delete custom workout sheets (e.g., "Treino A - Peito e Tríceps").
- **Dynamic Sets & Reps Builder:** Configure dynamic set counts and individualized rep counts (e.g., pyramiding sets like 10, 8, 6 reps) for each exercise.
- **Exercise Catalog & Filter:** Browse exercises categorized by muscle groups (Peito, Dorsais, Perna, Ombro, Bíceps, Tríceps, Trapézio), with automatic remote dataset fetching from GitHub and offline fallback.
- **Custom Exercise Creation:** Register custom exercises with custom images/GIFs and muscle categories.
- **Mobile Gesture Navigation:** Supports swipe left/right gestures for switching views on touch devices.
- **Local Persistence:** All workouts, active sheet settings, and custom exercises persist via browser `localStorage`.

---

## Architecture & Codebase Structure

The project follows a classic client-side MVC architecture without build steps or bundlers:

```
Academia html/
├── index.html                  # Main application markup & view containers
├── README.md                   # Repository badge & deploy status
├── css/
│   └── styles.css              # Custom styles, transitions, and input appearance overrides
└── js/
    ├── app.js                  # Application entry point (bootstraps Model, View, Controller)
    ├── models/
    │   └── GymModel.js         # Data layer, business logic, GitHub API fetch, and localStorage
    ├── views/
    │   └── GymView.js          # DOM rendering, view switching, formatting, UI state
    └── Controllers/            # Event handling, timer management, gesture handling
        └── GymController.js
```

### Module Roles
- **`GymModel` (`js/models/GymModel.js`):**
  - Handles state for exercises, workout sheets, and the active sheet ID.
  - Manages `localStorage` keys: `gym_exercises_dataset_en_v1`, `gym_user_sheets_v4`, `gym_active_sheet_id_v4`.
  - Fetches external exercise data from GitHub raw JSON and translates/maps muscle categories to Portuguese.
  - Provides CRUD methods for sheets, exercises, sets, reps, and weights.
- **`GymView` (`js/views/GymView.js`):**
  - Manages view toggling (`home`, `viewSheet`, `controlSheet`, `addExercise`) by updating CSS classes.
  - Renders dynamic HTML templates for exercise cards, set badges, dropdown selects, and previews.
  - Formats aggregated set summaries (e.g., `1x10 + 2x8`).
- **`GymController` (`js/Controllers/GymController.js`):**
  - Initializes the app, binds DOM event listeners, and coordinates Model and View updates.
  - Controls the workout timer interval and session completion summaries.
  - Implements swipe detection (`touchstart` and `touchend`) for mobile navigation.
- **`app.js` (`js/app.js`):**
  - Runs on `DOMContentLoaded`, instantiating Model, View, and Controller, then invokes `controller.init()`.

---

## Building and Running

Because this is a pure static frontend web application with no compiler or bundler:

### Running Locally
To run the project locally, serve the directory using any static HTTP file server:

- **Using Node (`npx serve`):**
  ```bash
  npx serve .
  ```
- **Using Python 3:**
  ```bash
  python -m http.server 8000
  ```
- **Using VS Code Live Server:** Right-click `index.html` and select **"Open with Live Server"**.

Alternatively, open `index.html` directly in any web browser. However, using a local HTTP server is recommended to avoid browser CORS restrictions with `fetch()`.

### Building / Bundling
- There is currently **no build step** required. Files are served as raw HTML, CSS, and ES6 JavaScript.

### Testing
- Currently, tests are conducted manually via browser interaction.
- *TODO:* Consider adding unit tests for `GymModel` (e.g., using Vitest or Jest) to test data mutations and localStorage persistence.

---

## Development Conventions & Guidelines

### Coding Style & Standards
- **JavaScript:** ES6+ class syntax (`class GymModel`, `class GymView`, etc.).
- **Indentation & Formatting:** 2 spaces, semi-colons enabled, standard camelCase for variables/methods, PascalCase for classes.
- **Language / Locale:** UI text and user prompts are in Portuguese (`pt-BR`). Code identifiers and comments generally mix English architectural terms and Portuguese domain terms.
- **CSS / Styling:** Tailwind CSS utility classes are primarily used for structure and typography. Custom global CSS resides in `css/styles.css` (e.g., webkit number input spinners, fadeIn animations, touch manipulation).

### Important Caveats & Best Practices
- **File System Casing Warning:** The directory on disk is `js/Controllers/` (capital `C`), while in `index.html` it is imported as `js/controllers/GymController.js`. On Windows, paths are case-insensitive, but Linux-based hosting environments (such as Netlify) are case-sensitive. Always ensure paths and directory names match casing precisely.
- **Persistence Schema:** Whenever modifying sheet structures or data models in `GymModel.js`, increment the storage key versions (e.g., `gym_user_sheets_v4` -> `v5`) or provide migration code to avoid breaking existing users' `localStorage`.
- **Timer Constraint:** The UI intentionally disables exercise completion checks and weight inputs when the workout timer is stopped. Keep this workflow intact unless explicitly requested otherwise.

---

## Strict Project Rules & Workflow Mandates
- **No Automatic Git Commits:** NUNCA execute commits (`git commit`) ou adicione arquivos (`git add`) após realizar alterações no código. O usuário sempre fará a análise manual das modificações e criará os commits pessoalmente.
- **Segurança e Prevenção de Ataques:** NUNCA introduza código vulnerável a ataques (como XSS, injeção de scripts ou manipulação não sanitizada do DOM via `innerHTML`). Todos os inputs do usuário (nomes de exercícios, URLs de imagens) e dados vindos de APIs externas devem ser devidamente tratados, validados e sanitizados antes de serem renderizados.
