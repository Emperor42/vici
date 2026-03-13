import { useState } from 'react';

function MetadataEditor({ 
  title, 
  items, 
  onAdd, 
  onEdit, 
  onRemove,
  cardsSetter,
  cards
}) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', lore: '' });
  const [newItem, setNewItem] = useState({ name: '', lore: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (newItem.name.trim()) {
      onAdd(newItem.name.trim(), newItem.lore.trim());
      setNewItem({ name: '', lore: '' });
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditData({ name: item.name, lore: item.lore || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ name: '', lore: '' });
  };

  const saveEdit = () => {
    if (editData.name.trim() && editingId) {
      // Pass the current cards and setter to allow cascade updates
      onEdit(editingId, editData, cardsSetter, cards);
      cancelEdit();
    }
  };

  const handleRemove = (item) => {
    if (window.confirm(`Remove "${item.name}"? This will affect all cards using this ${title.toLowerCase()}.`)) {
      onRemove(item.id, cardsSetter, cards);
    }
  };

  return (
    <div className="metadata-section">
      <h3>{title}</h3>
      
      <div className="item-list">
        {items.length === 0 && <p className="empty-list-msg">No items defined.</p>}
        
        {items.map((item) => (
          <div key={item.id} className="metadata-item">
            {editingId === item.id ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Name"
                  autoFocus
                />
                <textarea
                  value={editData.lore}
                  onChange={(e) => setEditData(prev => ({ ...prev, lore: e.target.value }))}
                  placeholder="Lore/Flavor text"
                  rows="2"
                />
                <div className="edit-actions">
                  <button onClick={saveEdit} className="save-btn">✓</button>
                  <button onClick={cancelEdit} className="cancel-btn">✕</button>
                </div>
              </div>
            ) : (
              <div className="item-display">
                <div className="item-main">
                  <span className="item-name">{item.name}</span>
                  {item.lore && (
                    <span className="item-lore" title={item.lore}>
                      📖
                    </span>
                  )}
                </div>
                <div className="item-actions">
                  <button 
                    className="edit-btn" 
                    onClick={() => startEdit(item)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button 
                    className="remove-btn" 
                    onClick={() => handleRemove(item)}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="add-form">
        <input
          type="text"
          placeholder={`New ${title.toLowerCase()} name`}
          value={newItem.name}
          onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Lore (optional)"
          value={newItem.lore}
          onChange={(e) => setNewItem(prev => ({ ...prev, lore: e.target.value }))}
        />
        <button type="submit" disabled={!newItem.name.trim()}>+</button>
      </form>
    </div>
  );
}

export default MetadataEditor;