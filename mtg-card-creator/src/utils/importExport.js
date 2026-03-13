// File format version for future compatibility
export const FILE_VERSION = '1.0';
export const FILE_TYPE = 'card-creator-data';

// Generate export filename with timestamp
export const generateExportFilename = (dataType = 'all') => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `card-creator-${dataType}-${timestamp}.json`;
};

// Download file helper
export const downloadFile = (content, filename) => {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export all data
export const exportAllData = (cards, types, classes, subtypes, subclasses) => {
  const data = {
    version: FILE_VERSION,
    fileType: FILE_TYPE,
    exportedAt: new Date().toISOString(),
    metadata: {
      types,
      classes,
      subtypes,
      subclasses
    },
    cards
  };
  
  const jsonString = JSON.stringify(data, null, 2);
  const filename = generateExportFilename('all');
  downloadFile(jsonString, filename);
  
  return { success: true, filename };
};

// Export specific data types
export const exportCardsOnly = (cards) => {
  const data = {
    version: FILE_VERSION,
    fileType: FILE_TYPE,
    exportedAt: new Date().toISOString(),
    cards
  };
  
  const jsonString = JSON.stringify(data, null, 2);
  const filename = generateExportFilename('cards');
  downloadFile(jsonString, filename);
  
  return { success: true, filename };
};

export const exportMetadataOnly = (types, classes, subtypes, subclasses) => {
  const data = {
    version: FILE_VERSION,
    fileType: FILE_TYPE,
    exportedAt: new Date().toISOString(),
    metadata: {
      types,
      classes,
      subtypes,
      subclasses
    }
  };
  
  const jsonString = JSON.stringify(data, null, 2);
  const filename = generateExportFilename('metadata');
  downloadFile(jsonString, filename);
  
  return { success: true, filename };
};

// Validate imported data structure
export const validateImportData = (data) => {
  const errors = [];
  
  if (!data.version) {
    errors.push('Missing file version');
  } else if (data.version !== FILE_VERSION) {
    errors.push(`Unsupported file version: ${data.version}. Expected ${FILE_VERSION}`);
  }
  
  if (!data.fileType || data.fileType !== FILE_TYPE) {
    errors.push('Invalid file type. This is not a card creator export file.');
  }
  
  if (!data.cards && !data.metadata) {
    errors.push('No data found in file');
  }
  
  // Validate cards structure if present
  if (data.cards && Array.isArray(data.cards)) {
    const invalidCards = data.cards.filter(card => !card.id || !card.name);
    if (invalidCards.length > 0) {
      errors.push(`${invalidCards.length} cards have invalid structure`);
    }
  }
  
  // Validate metadata structure if present
  if (data.metadata) {
    const { types, classes, subtypes, subclasses } = data.metadata;
    
    if (types && !Array.isArray(types)) {
      errors.push('Types must be an array');
    }
    if (classes && !Array.isArray(classes)) {
      errors.push('Classes must be an array');
    }
    if (subtypes && !Array.isArray(subtypes)) {
      errors.push('Subtypes must be an array');
    }
    if (subclasses && !Array.isArray(subclasses)) {
      errors.push('Subclasses must be an array');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    data
  };
};

// Parse imported file
export const parseImportFile = (fileContent) => {
  try {
    const data = JSON.parse(fileContent);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};