import { useState, useEffect } from 'react';

function CardForm({ onAddCard, onEditCard, onCancel, editingCard, types, classes, subtypes, subclasses }) {
  const [formData, setFormData] = useState({
    name: '',
    type: null,
    class: null,
    actionText: '',
    loreText: '',
    image: null,
    subclass: null,
    subtype: null
  });

  // Populate form when editing a card
  useEffect(() => {
    if (editingCard) {
      setFormData({
        name: editingCard.name || '',
        type: editingCard.type || null,
        class: editingCard.class || null,
        actionText: editingCard.actionText || '',
        loreText: editingCard.loreText || '',
        image: editingCard.image || null,
        subclass: editingCard.subclass || null,
        subtype: editingCard.subtype || null
      });
    }
  }, [editingCard]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e) => {
    const selectedId = e.target.value;
    const selected = types.find(t => t.id === selectedId);
    setFormData(prev => ({ ...prev, type: selected }));
  };

  const handleClassChange = (e) => {
    const selectedId = e.target.value;
    const selected = classes.find(c => c.id === selectedId);
    setFormData(prev => ({ ...prev, class: selected }));
  };

  const handleSubtypeChange = (e) => {
    const selectedId = e.target.value;
    const selected = subtypes.find(s => s.id === selectedId);
    setFormData(prev => ({ ...prev, subtype: selected }));
  };

  const handleSubclassChange = (e) => {
    const selectedId = e.target.value;
    const selected = subclasses.find(s => s.id === selectedId);
    setFormData(prev => ({ ...prev, subclass: selected }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type?.id) {
      alert('Name and Type are required');
      return;
    }
    
    const cardData = {
      ...formData,
      id: editingCard?.id || Date.now().toString(),
      createdAt: editingCard?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (editingCard) {
      onEditCard(cardData);
    } else {
      onAddCard(cardData);
    }
    
    // Reset form after submission
    if (!editingCard) {
      setFormData({
        name: '',
        type: null,
        class: null,
        actionText: '',
        loreText: '',
        image: null,
        subclass: null,
        subtype: null
      });
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    // Reset form when canceling edit
    if (editingCard) {
      setFormData({
        name: '',
        type: null,
        class: null,
        actionText: '',
        loreText: '',
        image: null,
        subclass: null,
        subtype: null
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-form">
      <h2>{editingCard ? 'Edit Card' : 'Create New Card'}</h2>
      
      <div className="form-group">
        <label>Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Card name"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Type *</label>
          <select 
            name="type" 
            value={formData.type?.id || ''} 
            onChange={handleTypeChange} 
            required
          >
            <option value="">Select type</option>
            {types && types.length > 0 ? (
              types.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))
            ) : (
              <option value="">No types available</option>
            )}
          </select>
        </div>

        <div className="form-group">
          <label>Class</label>
          <select 
            name="class" 
            value={formData.class?.id || ''} 
            onChange={handleClassChange}
          >
            <option value="">Select class</option>
            {classes && classes.length > 0 ? (
              classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))
            ) : (
              <option value="">No classes available</option>
            )}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Subclass (Optional)</label>
          <select 
            name="subclass" 
            value={formData.subclass?.id || ''} 
            onChange={handleSubclassChange}
          >
            <option value="">Select subclass</option>
            {subclasses && subclasses.length > 0 ? (
              subclasses.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))
            ) : (
              <option value="">No subclasses available</option>
            )}
          </select>
        </div>

        <div className="form-group">
          <label>Subtype (Optional)</label>
          <select 
            name="subtype" 
            value={formData.subtype?.id || ''} 
            onChange={handleSubtypeChange}
          >
            <option value="">Select subtype</option>
            {subtypes && subtypes.length > 0 ? (
              subtypes.map(subtype => (
                <option key={subtype.id} value={subtype.id}>
                  {subtype.name}
                </option>
              ))
            ) : (
              <option value="">No subtypes available</option>
            )}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Action Text</label>
        <textarea
          name="actionText"
          value={formData.actionText}
          onChange={handleChange}
          placeholder="What does this card do?"
          rows="3"
        />
      </div>

      <div className="form-group">
        <label>Lore Text</label>
        <textarea
          name="loreText"
          value={formData.loreText}
          onChange={handleChange}
          placeholder="Flavor text describing the card's story"
          rows="3"
        />
      </div>

      <div className="form-group">
        <label>Card Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {formData.image && (
          <img src={formData.image} alt="Preview" className="image-preview" />
        )}
      </div>

      <div className="form-actions">
        {editingCard && (
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="add-button">
          {editingCard ? 'Save Changes' : '+ Add Card'}
        </button>
      </div>
    </form>
  );
}

export default CardForm;