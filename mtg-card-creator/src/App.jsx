import { useState, useMemo, useEffect } from 'react';
import CardForm from './components/CardForm';
import CardList from './components/CardList';
import FilterBar from './components/FilterBar';
import MetadataEditor from './components/MetadataEditor';
import ImportExportModal from './components/ImportExportModal';
import DeckEditor from './components/DeckEditor';
import DeckList from './components/DeckList';
import { useMetadataManager } from './hooks/useMetadataManager';
import { useDeckManager } from './hooks/useDeckManager';
import './App.css';

function App() {
  const {
    types, classes, subtypes, subclasses,
    addType, editType, removeType,
    addClass, editClass, removeClass,
    addSubtype, editSubtype, removeSubtype,
    addSubclass, editSubclass, removeSubclass
  } = useMetadataManager();

  const {
    decks,
    addDeck,
    updateDeck,
    deleteDeck,
    addCardToDeck,
    removeCardFromDeck
  } = useDeckManager();

  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem('cardCreator_cards');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState('cards');
  const [showForm, setShowForm] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [editingDeck, setEditingDeck] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    type: '',
    class: '',
    subtype: ''
  });

  // Persist cards to localStorage
  useEffect(() => {
    localStorage.setItem('cardCreator_cards', JSON.stringify(cards));
  }, [cards]);

  const addCard = (newCard) => {
    setCards(prev => [...prev, newCard]);
    setShowForm(false);
    setEditingCard(null);
  };

  const editCard = (updatedCard) => {
    setCards(prev => 
      prev.map(card => card.id === updatedCard.id ? updatedCard : card)
    );
    setShowForm(false);
    setEditingCard(null);
  };

  const deleteCard = (id) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      setCards(prev => prev.filter(card => card.id !== id));
    }
  };

  const startEdit = (card) => {
    setEditingCard(card);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingCard(null);
    setShowForm(false);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleImportComplete = (importedData) => {
    setCards(importedData.cards);
  };

  const handleCreateDeck = () => {
    setEditingDeck({});
  };

  const handleEditDeck = (deck) => {
    setEditingDeck(deck);
  };

  const handleSaveDeck = (deckData) => {
    if (deckData.id) {
      updateDeck(deckData.id, deckData);
    } else {
      addDeck(deckData);
    }
    setEditingDeck(null);
  };

  const handleDeleteDeck = (deckId) => {
    deleteDeck(deckId);
  };

  const handleCancelDeck = () => {
    setEditingDeck(null);
  };

  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const matchesName = !filters.name || 
        card.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchesType = !filters.type || card.type?.id === filters.type;
      const matchesClass = !filters.class || card.class?.id === filters.class;
      const matchesSubtype = !filters.subtype || card.subtype?.id === filters.subtype;
      
      return matchesName && matchesType && matchesClass && matchesSubtype;
    });
  }, [cards, filters]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎴 Card Creator</h1>
        <div className="header-actions">
          <button 
            className="settings-btn"
            onClick={() => setShowEditor(!showEditor)}
          >
            ⚙️ Manage Metadata
          </button>
          <button 
            className="io-btn"
            onClick={() => setShowImportExport(true)}
          >
            💾 Import/Export
          </button>
          <button 
            className="add-card-btn"
            onClick={() => {
              if (activeTab === 'cards') {
                setShowForm(!showForm);
                setEditingCard(null);
              }
            }}
            disabled={activeTab !== 'cards'}
          >
            {showForm && !editingCard ? '✕ Cancel' : '+ Create Card'}
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="tab-nav">
        <button 
          className={`tab ${activeTab === 'cards' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('cards');
            setShowForm(false);
            setEditingCard(null);
            setEditingDeck(null);
          }}
        >
          🃏 Cards ({cards.length})
        </button>
        <button 
          className={`tab ${activeTab === 'decks' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('decks');
            setShowForm(false);
            setEditingCard(null);
            setEditingDeck(null);
          }}
        >
          📚 Decks ({decks.length})
        </button>
      </nav>

      {/* Cards Tab */}
      {activeTab === 'cards' && (
        <>
          {showForm && (
            <section className="form-section">
              <CardForm 
                onAddCard={addCard}
                onEditCard={editCard}
                onCancel={cancelEdit}
                editingCard={editingCard}
                types={types} 
                classes={classes} 
                subtypes={subtypes} 
                subclasses={subclasses} 
              />
            </section>
          )}

          {/* Metadata Editor */}
      {showEditor && (
        <section className="editor-section">
          <div className="editor-grid">
            <MetadataEditor 
              title="Card Types" 
              items={types} 
              onAdd={addType} 
              onEdit={editType}
              onRemove={removeType}
              cardsSetter={setCards}
              cards={cards}
            />
            <MetadataEditor 
              title="Classes" 
              items={classes} 
              onAdd={addClass} 
              onEdit={editClass}
              onRemove={removeClass}
              cardsSetter={setCards}
              cards={cards}
            />
            <MetadataEditor 
              title="Subtypes" 
              items={subtypes} 
              onAdd={addSubtype} 
              onEdit={editSubtype}
              onRemove={removeSubtype}
              cardsSetter={setCards}
              cards={cards}
            />
            <MetadataEditor 
              title="Subclasses" 
              items={subclasses} 
              onAdd={addSubclass} 
              onEdit={editSubclass}
              onRemove={removeSubclass}
              cardsSetter={setCards}
              cards={cards}
            />
          </div>
        </section>
      )}

          <section className="filters-section">
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              cardCount={filteredCards.length}
              types={types}
              classes={classes}
              subtypes={subtypes}
            />
          </section>

          <main className="cards-section">
            <CardList 
              cards={filteredCards} 
              onDelete={deleteCard}
              onEdit={startEdit}
            />
          </main>
        </>
      )}

      {/* Decks Tab */}
      {activeTab === 'decks' && (
        <>
          {editingDeck !== null ? (
            <section className="deck-editor-section">
              <DeckEditor 
                deck={editingDeck.id ? editingDeck : null}
                cards={cards}
                onSave={handleSaveDeck}
                onCancel={handleCancelDeck}
              />
            </section>
          ) : (
            <section className="decks-section">
              <DeckList 
                decks={decks}
                cards={cards}
                onEditDeck={handleEditDeck}
                onDeleteDeck={handleDeleteDeck}
                onCreateDeck={handleCreateDeck}
              />
            </section>
          )}
        </>
      )}

      

      <ImportExportModal
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        cards={cards}
        types={types}
        classes={classes}
        subtypes={subtypes}
        subclasses={subclasses}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}

export default App;