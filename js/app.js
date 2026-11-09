document.addEventListener('DOMContentLoaded', () => {
  const model = new GymModel();
  const view = new GymView();
  const controller = new GymController(model, view);

  controller.init();
});