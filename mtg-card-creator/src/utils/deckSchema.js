export const createDeck = (name = 'Untitled Deck') => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name,
  description: '',
  cardIds: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export const DECK_SLOTS = {
  MIN_CARDS: 30,
  MAX_CARDS: 60,
  RECOMMENDED: 40
};