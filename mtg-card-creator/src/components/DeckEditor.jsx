import { useState, useEffect } from 'react';

function DeckEditor({ deck, cards, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cardIds: []
  });

  const [availableCards, setAvailableCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize form based on whether we're editing or creating
  useEffect(() => {
    if (deck && deck.id) {
      // Edit existing deck
      setFormData({
        name: deck.name || '',
        description: deck.description || '',
        cardIds: deck.cardIds || []
      });
    } else {
      // Create new deck - start fresh
      setFormData({
        name: '',
        description: '',
        cardIds: []
      });
    }
  }, [deck]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = cards.filter(card => 
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.type?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.class?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setAvailableCards(filtered);
    } else {
      setAvailableCards(cards);
    }
  }, [searchTerm, cards]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCard = () => {
    if (selectedCard && !formData.cardIds.includes(selectedCard)) {
      if (formData.cardIds.length >= 60) {
        alert('Deck is at maximum capacity (60 cards)');
        return;
      }
      setFormData(prev => ({
        ...prev,
        cardIds: [...prev.cardIds, selectedCard]
      }));
      setSelectedCard('');
    }
  };

  const handleRemoveCard = (cardId) => {
    setFormData(prev => ({
      ...prev,
      cardIds: prev.cardIds.filter(id => id !== cardId)
    }));
  };

  const handleMoveCard = (cardId, direction) => {
    const currentIndex = formData.cardIds.indexOf(cardId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < formData.cardIds.length) {
      const newCardIds = [...formData.cardIds];
      [newCardIds[currentIndex], newCardIds[newIndex]] = [newCardIds[newIndex], newCardIds[currentIndex]];
      setFormData(prev => ({ ...prev, cardIds: newCardIds }));
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Deck name is required');
      return;
    }
    
    const deckData = {
      ...deck,
      name: formData.name.trim(),
      description: formData.description.trim(),
      cardIds: formData.cardIds
    };
    
    onSave(deckData);
  };

  const getCardById = (cardId) => {
    return cards.find(c => c.id === cardId);
  };

  const deckStats = {
    total: formData.cardIds.length,
    min: 30,
    max: 60,
    remaining: 60 - formData.cardIds.length
  };

  return (
    <div className="deck-editor">
      <div className="deck-editor-header">
        <h2>{deck && deck.id ? 'Edit Deck' : 'Create New Deck'}</h2>
        <div className="deck-stats">
          <span className={`stat ${deckStats.total >= deckStats.min ? 'good' : ''}`}>
            {deckStats.total}/{deckStats.max} cards
          </span>
          {deckStats.total < deckStats.min && (
            <span className="warning">
              Minimum {deckStats.min} cards required
            </span>
          )}
        </div>
      </div>

      <div className="deck-form">
        <div className="form-group">
          <label>Deck Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter deck name"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your deck strategy..."
            rows="3"
          />
        </div>
      </div>

      <div className="deck-card-manager">
        <div className="card-adder">
          <h3>Add Cards</h3>
          <input
            type="text"
            placeholder="Search cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <div className="card-selection">
            <select 
              value={selectedCard} 
              onChange={(e) => setSelectedCard(e.target.value)}
            >
              <option value="">Select a card...</option>
              {availableCards.slice(0, 50).map(card => (
                <option key={card.id} value={card.id}>
                  {card.name} ({card.type?.name || 'Unknown'})
                </option>
              ))}
            </select>
            <button 
              className="add-card-btn" 
              onClick={handleAddCard}
              disabled={!selectedCard || deckStats.total >= deckStats.max}
            >
              + Add
            </button>
          </div>
        </div>

        <div className="deck-cards">
          <h3>Deck Contents ({formData.cardIds.length} cards)</h3>
          
          {formData.cardIds.length === 0 ? (
            <p className="empty-deck-msg">No cards in deck yet. Add cards above.</p>
          ) : (
            <div className="deck-card-list">
              {formData.cardIds.map((cardId, index) => {
                const card = getCardById(cardId);
                return (
                  <div key={`${cardId}-${index}`} className="deck-card-item">
                    <div className="card-info">
                      <span className="card-number">{index + 1}.</span>
                      <span className="card-name">{card?.name || 'Unknown Card'}</span>
                      <span className="card-type">{card?.type?.name || 'Unknown'}</span>
                    </div>
                    <div className="card-actions">
                      <button 
                        onClick={() => handleMoveCard(cardId, 'up')}
                        disabled={index === 0}
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button 
                        onClick={() => handleMoveCard(cardId, 'down')}
                        disabled={index === formData.cardIds.length - 1}
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button 
                        onClick={() => handleRemoveCard(cardId)}
                        className="remove-card-btn"
                        title="Remove from deck"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="deck-actions">
        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button 
          className="save-btn" 
          onClick={handleSave}
          disabled={formData.cardIds.length < deckStats.min}
        >
          {deckStats.total < deckStats.min 
            ? `Add ${deckStats.min - deckStats.total} more cards` 
            : 'Save Deck'}
        </button>
      </div>
    </div>
  );
}

export default DeckEditor;