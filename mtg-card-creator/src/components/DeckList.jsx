function DeckList({ decks, cards, onEditDeck, onDeleteDeck, onCreateDeck }) {
  const getCardCount = (deck) => {
    return deck.cardIds?.length || 0;
  };

  const getCardById = (cardId) => {
    return cards.find(c => c.id === cardId);
  };

  return (
    <div className="deck-list">
      <div className="deck-list-header">
        <h2>Your Decks</h2>
        <button className="create-deck-btn" onClick={onCreateDeck}>
          + Create New Deck
        </button>
      </div>

      {decks.length === 0 ? (
        <div className="empty-decks-state">
          <p>No decks yet. Create your first deck to organize your cards!</p>
        </div>
      ) : (
        <div className="decks-grid">
          {decks.map(deck => (
            <div key={deck.id} className="deck-card">
              <div className="deck-card-header">
                <h3>{deck.name}</h3>
                <div className="deck-actions">
                  <button 
                    className="edit-deck-btn"
                    onClick={() => onEditDeck(deck)}
                    title="Edit deck"
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-deck-btn"
                    onClick={() => onDeleteDeck(deck.id)}
                    title="Delete deck"
                  >
                    ×
                  </button>
                </div>
              </div>

              {deck.description && (
                <p className="deck-description">{deck.description}</p>
              )}

              <div className="deck-stats">
                <span className={`card-count ${getCardCount(deck) >= 30 ? 'ready' : ''}`}>
                  {getCardCount(deck)} cards
                </span>
                {getCardCount(deck) < 30 && (
                  <span className="needs-more">Needs {30 - getCardCount(deck)} more</span>
                )}
              </div>

              {getCardCount(deck) > 0 && (
                <div className="deck-preview">
                  <h4>Sample Cards</h4>
                  <div className="preview-cards">
                    {deck.cardIds.slice(0, 5).map((cardId, index) => {
                      const card = getCardById(cardId);
                      return (
                        <span key={index} className="preview-card-tag">
                          {card?.name || 'Unknown'}
                        </span>
                      );
                    })}
                    {getCardCount(deck) > 5 && (
                      <span className="more-cards">+{getCardCount(deck) - 5} more</span>
                    )}
                  </div>
                </div>
              )}

              <div className="deck-meta">
                <small>Created: {new Date(deck.createdAt).toLocaleDateString()}</small>
                <small>Updated: {new Date(deck.updatedAt).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DeckList;