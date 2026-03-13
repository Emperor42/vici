import CardDisplay from './CardDisplay';  // ← This should be present

function CardList({ cards, onDelete, onEdit }) {
  if (cards.length === 0) {
    return (
      <div className="empty-state">
        <p>No cards yet. Create your first card!</p>
      </div>
    );
  }

  return (
    <div className="card-grid">
      {cards.map(card => (
        <CardDisplay 
          key={card.id} 
          card={card} 
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}

export default CardList;