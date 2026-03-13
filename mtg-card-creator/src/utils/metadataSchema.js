// src/utils/metadataSchema.js
export const createMetadataItem = (name, lore = '') => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name,
  lore,
  createdAt: new Date().toISOString()
});