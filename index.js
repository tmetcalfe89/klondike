import { attemptFlip, attemptGoal, attemptMove, draw, startGame } from "./klondike.js";

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

function start() {
  game = startGame();
  renderGame();
  deckEl.addEventListener("click", handleClickDeck);
  Object.values(goals).forEach((goal) =>
    goal.addEventListener("click", handleClickGoal)
  );
}

function renderGame() {
  renderColumns();
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
  if (clicked.dataset.card === "B") {
    attemptFlip(game, columnIndex);
    renderColumn(columnIndex);
    return;
  }

  const selected = getSelectedCard();

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
}

function getSelectedCard() {
  return document.querySelector(".selected");
}

function renderGoals() {
  for (const suit in goals) {
    renderGoals(suit);
  }
}

function renderGoal(suit) {
  goals[suit].dataset.card = `${suit}${game.goals[suit]}`;
}

function getColumnIndex(selected) {
  return selected.parentNode.classList.contains("discard")
    ? -1
    : [...selected.parentNode.parentNode.children].indexOf(selected.parentNode);
}

start();
