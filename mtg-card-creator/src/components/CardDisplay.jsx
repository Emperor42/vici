function CardDisplay({ card, onDelete, onEdit }) {
  return (
    <div className={`mtg-card ${card.type?.name?.toLowerCase() || 'unknown'}`}>
      {/* Card Header with Edit/Delete Buttons */}
      <div className="card-header">
        <span className="card-name">{card.name}</span>
        <span className="card-type">{card.type?.name || 'Unknown'}</span>
        <div className="card-actions">
          {onEdit && (
            <button 
              className="edit-btn" 
              onClick={() => onEdit(card)}
              title="Edit card"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button 
              className="delete-btn" 
              onClick={() => onDelete(card.id)}
              title="Delete card"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="card-image-container">
        {card.image ? (
          <img src={card.image} alt={card.name} className="card-image" />
        ) : (
          <div className="card-image-placeholder">No Image</div>
        )}
      </div>

      <div className="card-body">
        <div className="card-class-info">
          {card.class && (
            <span className="card-class">
              {card.class.name}
              {card.class.lore && (
                <span className="lore-tooltip" title={card.class.lore}>📖</span>
              )}
            </span>
          )}
          {card.subclass && (
            <span className="card-subclass">
              {card.subclass.name}
              {card.subclass.lore && (
                <span className="lore-tooltip" title={card.subclass.lore}>📖</span>
              )}
            </span>
          )}
          {card.subtype && (
            <span className="card-subtype">
              {card.subtype.name}
              {card.subtype.lore && (
                <span className="lore-tooltip" title={card.subtype.lore}>📖</span>
              )}
            </span>
          )}
        </div>

        <div className="card-action-text">
          <strong>Ability:</strong>
          <p>{card.actionText}</p>
        </div>

        {card.loreText && (
          <div className="card-lore-text">
            <em>"{card.loreText}"</em>
          </div>
        )}
      </div>
    </div>
  );
}

export default CardDisplay;