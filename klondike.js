const suits = ["H", "D", "S", "C"];
const values = new Array(13).fill(null).map((_, i) => i + 1);
const getFreshDeck = () =>
  suits.flatMap((suit) => values.map((value) => `${suit}${value}`));

function makeColumnCard(card) {
  return {
    card,
    flipped: false,
  };
}

export function startGame() {
  const deck = shuffleDeck();

  const columns = [
    takeCards(deck, 1).map(makeColumnCard),
    takeCards(deck, 2).map(makeColumnCard),
    takeCards(deck, 3).map(makeColumnCard),
    takeCards(deck, 4).map(makeColumnCard),
    takeCards(deck, 5).map(makeColumnCard),
    takeCards(deck, 6).map(makeColumnCard),
    takeCards(deck, 7).map(makeColumnCard),
  ];
  columns.forEach((column) => (column[column.length - 1].flipped = true));

  return {
    deck: deck,
    columns,
    discard: [],
    discardRevealed: 0,
    goals: suits.reduce((acc, suit) => ({ ...acc, [suit]: 0 }), {}),
  };
}

function shuffleDeck(deck = getFreshDeck()) {
  const shuffled = [];
  while (deck.length) {
    const rando = Math.floor(Math.random() * deck.length);
    shuffled.push(...takeCard(deck, rando));
  }
  return shuffled;
}

function takeCard(deck, index = 0) {
  return deck.splice(index, 1);
}

function takeCards(deck, count = 1) {
  return deck.splice(0, count);
}

export function draw(game) {
  const drawn = takeCards(game.deck, 3);
  game.discard.push(...drawn);
  game.discardRevealed = drawn.length;
}

export function attemptGoal(game, goalSuit, card, columnIndex) {
  const cardSuit = getCardSuit(card);

  if (cardSuit != goalSuit) {
    throw new Error("Invalid goal suit for card.");
  }

  const cardValue = getCardValue(card);
  if (cardValue !== game.goals[goalSuit] + 1) {
    throw new Error("Invalid goal value for card.");
  }

  game.goals[goalSuit] = cardValue;
  if (columnIndex === -1) {
    game.discard.pop();
  } else {
    game.columns[columnIndex].pop();
  }
}

function getCardSuit(card) {
  return card[0];
}

function getCardValue(card) {
  return +card.slice(1);
}

export function attemptFlip(game, columnIndex) {
  const targetColumn = game.columns[columnIndex];
  targetColumn[targetColumn.length - 1].flipped = true;
}