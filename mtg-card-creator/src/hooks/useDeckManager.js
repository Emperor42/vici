import { useState, useEffect, useCallback } from 'react';
import { createDeck } from '../utils/deckSchema';

export function useDeckManager() {
  const [decks, setDecks] = useState(() => {
    const saved = localStorage.getItem('cardCreator_decks');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist decks to localStorage
  useEffect(() => {
    localStorage.setItem('cardCreator_decks', JSON.stringify(decks));
  }, [decks]);

  const addDeck = useCallback((deckData) => {
    const newDeck = createDeck(deckData?.name);
    setDecks(prev => [...prev, newDeck]);
    return newDeck.id;
  }, []);

  const updateDeck = useCallback((deckId, updates) => {
    setDecks(prev => 
      prev.map(deck => 
        deck.id === deckId 
          ? { ...deck, ...updates, updatedAt: new Date().toISOString() }
          : deck
      )
    );
  }, []);

  const deleteDeck = useCallback((deckId) => {
    if (window.confirm('Are you sure you want to delete this deck?')) {
      setDecks(prev => prev.filter(deck => deck.id !== deckId));
    }
  }, []);

  const addCardToDeck = useCallback((deckId, cardId) => {
    setDecks(prev => 
      prev.map(deck => {
        if (deck.id === deckId) {
          if (deck.cardIds.includes(cardId)) {
            return deck; // Already in deck
          }
          if (deck.cardIds.length >= 60) {
            return deck; // Max reached
          }
          return { 
            ...deck, 
            cardIds: [...deck.cardIds, cardId],
            updatedAt: new Date().toISOString()
          };
        }
        return deck;
      })
    );
  }, []);

  const removeCardFromDeck = useCallback((deckId, cardId) => {
    setDecks(prev => 
      prev.map(deck => {
        if (deck.id === deckId) {
          return { 
            ...deck, 
            cardIds: deck.cardIds.filter(id => id !== cardId),
            updatedAt: new Date().toISOString()
          };
        }
        return deck;
      })
    );
  }, []);

  const reorderDeck = useCallback((deckId, cardId, newIndex) => {
    setDecks(prev => 
      prev.map(deck => {
        if (deck.id === deckId) {
          const newCardIds = [...deck.cardIds];
          const currentIndex = newCardIds.indexOf(cardId);
          newCardIds.splice(currentIndex, 1);
          newCardIds.splice(newIndex, 0, cardId);
          return { 
            ...deck, 
            cardIds: newCardIds,
            updatedAt: new Date().toISOString()
          };
        }
        return deck;
      })
    );
  }, []);

  const getDeckStats = useCallback((deckId) => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return null;
    
    return {
      totalCards: deck.cardIds.length,
      isEmpty: deck.cardIds.length === 0,
      isMinMet: deck.cardIds.length >= 30,
      isMaxReached: deck.cardIds.length >= 60
    };
  }, [decks]);

  return {
    decks,
    addDeck,
    updateDeck,
    deleteDeck,
    addCardToDeck,
    removeCardFromDeck,
    reorderDeck,
    getDeckStats
  };
}