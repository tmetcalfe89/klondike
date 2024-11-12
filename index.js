import {
  attemptFlip,
  attemptGoal,
  attemptMove,
  draw,
  startGame,
} from "./klondike.js";

let game = null;
const deckEl = document.querySelector(".deck");
const discardEl = document.querySelector(".discard");
const goals = ["H", "D", "C", "S"].reduce(
  (acc, suit) => ({
    ...acc,
    [suit]: document.querySelector(`[data-goal="${suit}"]`),
  }),
  {}
);
const scoreEl = document.querySelector(`[data-info="score"] span`);
const movesEl = document.querySelector(`[data-info="moves"] span`);
const timerEl = document.querySelector(`[data-info="timer"]`);
const newGameEl = document.querySelector(`[data-control="new-game"]`);

function loadGame() {
  return JSON.parse(localStorage.getItem("game"));
}

function saveGame() {
  localStorage.setItem("game", JSON.stringify(game));
}

function start(forceNew = false) {
  game = (!forceNew && loadGame()) || startGame();
  renderGame();
  renderTimer();
}

deckEl.addEventListener("click", handleClickDeck);
Object.values(goals).forEach((goal) =>
  goal.addEventListener("click", handleClickGoal)
);
newGameEl.addEventListener("click", () => start(true));

function renderGame() {
  renderColumns();
  renderGoals();
  renderDiscard();
}

function renderColumns() {
  for (const columnI in game.columns) {
    renderColumn(columnI);
  }
}

function renderColumn(index) {
  const column = game.columns[index];
  const columnEl = document.querySelectorAll(".column")[index];
  columnEl.innerHTML = "";
  if (column.length === 0) {
    const cardEl = createCardEl({ card: "BE", flipped: true });
    columnEl.appendChild(cardEl);
  }
  for (const card of column) {
    const cardEl = createCardEl(card);
    columnEl.appendChild(cardEl);
  }
}

function createCardEl({ card, flipped }) {
  const cardEl = document.createElement("div");
  cardEl.dataset.card = flipped ? card : "B";
  cardEl.addEventListener("click", handleClickFieldCard);
  return cardEl;
}

function handleClickDeck(e) {
  draw(game);
  renderDiscard();
  renderStats();
}

function renderStats() {
  scoreEl.innerText = game.score;
  movesEl.innerText = game.moves;
}

function renderDiscard() {
  discardEl.innerHTML = "";
  const renderedDiscards = game.discard.slice(0 - game.discardRevealed);
  for (const card of renderedDiscards) {
    const cardEl = createCardEl({
      card,
      flipped: true,
    });
    discardEl.appendChild(cardEl);
  }
}

function handleClickFieldCard(e) {
  const clicked = e.target;
  const columnIndex = getColumnIndex(clicked);
  const selected = getSelectedCard();
  if (clicked.dataset.card === "BE" && selected == null) {
    return;
  }

  if (clicked.dataset.card === "B") {
    attemptFlip(game, columnIndex);
    renderStats();
    renderColumn(columnIndex);
    return;
  }

  if (!selected) {
    clicked.classList.add("selected");
    return;
  }

  if (selected === clicked) {
    clicked.classList.remove("selected");
    return;
  }

  const fromColumnIndex = getColumnIndex(selected);
  attemptMove(
    game,
    fromColumnIndex,
    columnIndex,
    fromColumnIndex === -1
      ? -1
      : [...selected.parentNode.children].indexOf(selected)
  );
  if (fromColumnIndex === -1) {
    renderDiscard();
  } else {
    renderColumn(fromColumnIndex);
  }
  renderColumn(columnIndex);
  renderStats();
}

function handleClickGoal(e) {
  const selected = getSelectedCard();

  if (!selected) {
    return;
  }

  const goalSuit = e.target.dataset.goal;
  const columnIndex = getColumnIndex(selected);
  attemptGoal(game, goalSuit, selected.dataset.card, columnIndex);
  if (columnIndex === -1) {
    renderDiscard();
  } else {
    renderColumn(columnIndex);
  }
  renderGoal(goalSuit);
  renderStats();
}

function getSelectedCard() {
  return document.querySelector(".selected");
}

function renderGoals() {
  for (const suit in goals) {
    renderGoal(suit);
  }
}

function renderTimer() {
  const timeDiff = Date.now() - game.start;
  const hours = Math.floor(timeDiff / 1000 / 60 / 60);
  const minutes = Math.floor((timeDiff - hours * 1000 * 60 * 60) / 1000 / 60);
  const seconds = Math.floor(
    (timeDiff - hours * 1000 * 60 * 60 - minutes * 1000 * 60) / 1000
  );
  timerEl.innerText = `${hours}:${`${minutes}`.padStart(
    2,
    0
  )}:${`${seconds}`.padStart(2, 0)}`;
  saveGame();
  setTimeout(renderTimer, 500);
}

function renderGoal(suit) {
  goals[suit].dataset.card = game.goals[suit]
    ? `${suit}${game.goals[suit]}`
    : `${suit}E`;
}

function getColumnIndex(selected) {
  return selected.parentNode.classList.contains("discard")
    ? -1
    : [...selected.parentNode.parentNode.children].indexOf(selected.parentNode);
}

start();
