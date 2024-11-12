export function initializeModals() {
  const actions = document.querySelectorAll("[data-modal-action]");
  actions.forEach((action) => {
    action.addEventListener("click", handleClickAction);
  });
}

const actions = {
  open(target) {
    target.setAttribute("open", "open");
  },
  close(target) {
    target.removeAttribute("open");
  },
};

function handleClickAction(e) {
  const clicked = e.currentTarget;
  const action = clicked.dataset.modalAction;
  const target = clicked.dataset.modalTarget;
  actions[action](document.querySelector(target));
}
