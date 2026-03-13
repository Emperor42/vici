import { useState, useCallback, useEffect } from 'react';
import { createMetadataItem } from '../utils/metadataSchema';

// Default metadata with lore
const DEFAULT_TYPES = [
  createMetadataItem('Creature', 'Living beings with physical presence'),
  createMetadataItem('Spell', 'Magical effects cast by spellcasters'),
  createMetadataItem('Artifact', 'Constructed objects with magical properties'),
  createMetadataItem('Enchantment', 'Lasting magical effects on the battlefield'),
  createMetadataItem('Land', 'Sources of mana for casting spells')
];

const DEFAULT_CLASSES = [
  createMetadataItem('Warrior', 'Masters of combat and physical prowess'),
  createMetadataItem('Mage', 'Scholars of arcane mysteries'),
  createMetadataItem('Rogue', 'Shadowy operatives skilled in stealth'),
  createMetadataItem('Paladin', 'Holy warriors sworn to justice'),
  createMetadataItem('Hunter', 'Expert trackers and marksmen'),
  createMetadataItem('Shaman', 'Spiritual leaders connected to nature'),
  createMetadataItem('Priest', 'Healers and divine servants'),
  createMetadataItem('Druid', 'Guardians of the natural world'),
  createMetadataItem('Demon', 'Fiendish entities from the abyss'),
  createMetadataItem('Elemental', 'Beings composed of pure elemental forces')
];

const DEFAULT_SUBTYPES = [
  createMetadataItem('Human', 'Versatile and ambitious mortals'),
  createMetadataItem('Elf', 'Graceful beings attuned to magic'),
  createMetadataItem('Orc', 'Fierce warriors of strength'),
  createMetadataItem('Dragon', 'Ancient and powerful reptilian creatures'),
  createMetadataItem('Golem', 'Artificial constructs animated by magic'),
  createMetadataItem('Spirit', 'Discarnate entities of ethereal nature'),
  createMetadataItem('Beast', 'Wild animals and monsters'),
  createMetadataItem('Construct', 'Mechanical or magically built beings')
];

const DEFAULT_SUBCLASSES = [];

export function useMetadataManager() {
  // Load from localStorage or use defaults
  const [types, setTypes] = useState(() => {
    const saved = localStorage.getItem('cardCreator_types');
    return saved ? JSON.parse(saved) : DEFAULT_TYPES;
  });
  
  const [classes, setClasses] = useState(() => {
    const saved = localStorage.getItem('cardCreator_classes');
    return saved ? JSON.parse(saved) : DEFAULT_CLASSES;
  });
  
  const [subtypes, setSubtypes] = useState(() => {
    const saved = localStorage.getItem('cardCreator_subtypes');
    return saved ? JSON.parse(saved) : DEFAULT_SUBTYPES;
  });
  
  const [subclasses, setSubclasses] = useState(() => {
    const saved = localStorage.getItem('cardCreator_subclasses');
    return saved ? JSON.parse(saved) : DEFAULT_SUBCLASSES;
  });

  // Persist to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('cardCreator_types', JSON.stringify(types));
  }, [types]);

  useEffect(() => {
    localStorage.setItem('cardCreator_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('cardCreator_subtypes', JSON.stringify(subtypes));
  }, [subtypes]);

  useEffect(() => {
    localStorage.setItem('cardCreator_subclasses', JSON.stringify(subclasses));
  }, [subclasses]);

  // Helper to determine which field on cards corresponds to this metadata type
  const getItemFieldName = (list) => {
    if (list === types) return 'type';
    if (list === classes) return 'class';
    if (list === subtypes) return 'subtype';
    if (list === subclasses) return 'subclass';
    return '';
  };

  // Generic update function that handles cascading card updates
  const updateMetadata = useCallback((setter, currentList, cardsSetter, cards, itemId, updates) => {
    setter(prev => {
      const newList = prev.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      );
      
      // Cascade update to all cards that reference this metadata item
      if (cardsSetter && cards) {
        const fieldName = getItemFieldName(currentList);
        cardsSetter(prevCards => 
          prevCards.map(card => {
            // Safety check: ensure card[fieldName] exists and has an id
            if (card[fieldName] && card[fieldName].id === itemId) {
              return { ...card, [fieldName]: { ...card[fieldName], ...updates } };
            }
            return card;
          })
        );
      }
      
      return newList;
    });
  }, [types, classes, subtypes, subclasses]);

  // CRUD operations for each metadata type
  const addType = (name, lore = '') => {
    setTypes(prev => [...prev, createMetadataItem(name, lore)]);
  };
  
  const editType = (itemId, updates, cardsSetter, cards) => {
    updateMetadata(setTypes, types, cardsSetter, cards, itemId, updates);
  };
  
  const removeType = (itemId, cardsSetter, cards) => {
    setTypes(prev => prev.filter(item => item.id !== itemId));
    if (cardsSetter && cards) {
      cardsSetter(prev => prev.map(card => 
        card.type?.id === itemId ? { ...card, type: null } : card
      ));
    }
  };

  const addClass = (name, lore = '') => {
    setClasses(prev => [...prev, createMetadataItem(name, lore)]);
  };
  
  const editClass = (itemId, updates, cardsSetter, cards) => {
    updateMetadata(setClasses, classes, cardsSetter, cards, itemId, updates);
  };
  
  const removeClass = (itemId, cardsSetter, cards) => {
    setClasses(prev => prev.filter(item => item.id !== itemId));
    if (cardsSetter && cards) {
      cardsSetter(prev => prev.map(card => 
        card.class?.id === itemId ? { ...card, class: null } : card
      ));
    }
  };

  const addSubtype = (name, lore = '') => {
    setSubtypes(prev => [...prev, createMetadataItem(name, lore)]);
  };
  
  const editSubtype = (itemId, updates, cardsSetter, cards) => {
    updateMetadata(setSubtypes, subtypes, cardsSetter, cards, itemId, updates);
  };
  
  const removeSubtype = (itemId, cardsSetter, cards) => {
    setSubtypes(prev => prev.filter(item => item.id !== itemId));
    if (cardsSetter && cards) {
      cardsSetter(prev => prev.map(card => 
        card.subtype?.id === itemId ? { ...card, subtype: null } : card
      ));
    }
  };

  const addSubclass = (name, lore = '') => {
    setSubclasses(prev => [...prev, createMetadataItem(name, lore)]);
  };
  
  const editSubclass = (itemId, updates, cardsSetter, cards) => {
    updateMetadata(setSubclasses, subclasses, cardsSetter, cards, itemId, updates);
  };
  
  const removeSubclass = (itemId, cardsSetter, cards) => {
    setSubclasses(prev => prev.filter(item => item.id !== itemId));
    if (cardsSetter && cards) {
      cardsSetter(prev => prev.map(card => 
        card.subclass?.id === itemId ? { ...card, subclass: null } : card
      ));
    }
  };

  return {
    types, classes, subtypes, subclasses,
    addType, editType, removeType,
    addClass, editClass, removeClass,
    addSubtype, editSubtype, removeSubtype,
    addSubclass, editSubclass, removeSubclass
  };
}