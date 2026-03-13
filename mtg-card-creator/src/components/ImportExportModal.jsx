import { useState, useRef } from 'react';
import {
  exportAllData,
  exportCardsOnly,
  exportMetadataOnly,
  validateImportData,
  parseImportFile
} from '../utils/importExport';

function ImportExportModal({ 
  isOpen, 
  onClose, 
  cards, 
  types, 
  classes, 
  subtypes, 
  subclasses,
  onImportComplete 
}) {
  const [activeTab, setActiveTab] = useState('export');
  const [importStatus, setImportStatus] = useState(null);
  const [importOptions, setImportOptions] = useState({
    mergeMetadata: true,
    mergeCards: true,
    overwriteDuplicates: false
  });
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleExportAll = () => {
    const result = exportAllData(cards, types, classes, subtypes, subclasses);
    setImportStatus({ type: 'success', message: `Exported all data to ${result.filename}` });
  };

  const handleExportCards = () => {
    const result = exportCardsOnly(cards);
    setImportStatus({ type: 'success', message: `Exported ${cards.length} cards to ${result.filename}` });
  };

  const handleExportMetadata = () => {
    const result = exportMetadataOnly(types, classes, subtypes, subclasses);
    setImportStatus({ 
      type: 'success', 
      message: `Exported metadata (${types.length} types, ${classes.length} classes, ${subtypes.length} subtypes, ${subclasses.length} subclasses)` 
    });
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset to allow selecting same file again
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImportStatus({ type: 'error', message: 'No file selected' });
      return;
    }

    // Validate file type
    if (!file.name.endsWith('.json')) {
      setImportStatus({ 
        type: 'error', 
        message: 'Please select a JSON file (.json)' 
      });
      return;
    }

    setImportStatus({ type: 'loading', message: 'Reading file...' });

    const reader = new FileReader();
    reader.onload = (event) => {
      const parsed = parseImportFile(event.target.result);
      
      if (!parsed.success) {
        setImportStatus({ 
          type: 'error', 
          message: `Failed to parse file: ${parsed.error}` 
        });
        return;
      }

      const validation = validateImportData(parsed.data);
      
      if (!validation.isValid) {
        setImportStatus({ 
          type: 'error', 
          message: `Invalid file: ${validation.errors.join(', ')}` 
        });
        return;
      }

      // Show preview and options
      const cardCount = parsed.data.cards?.length || 0;
      const metaCount = parsed.data.metadata ? 
        (parsed.data.metadata.types?.length || 0) + 
        (parsed.data.metadata.classes?.length || 0) + 
        (parsed.data.metadata.subtypes?.length || 0) + 
        (parsed.data.metadata.subclasses?.length || 0) : 0;
      
      setImportStatus({
        type: 'preview',
        message: `Found ${cardCount} cards and ${metaCount} metadata items`,
        data: parsed.data
      });
    };

    reader.onerror = () => {
      setImportStatus({ 
        type: 'error', 
        message: 'Failed to read file' 
      });
    };

    reader.readAsText(file);
  };

  const handleImportConfirm = () => {
    if (!importStatus.data) return;

    try {
      const imported = importStatus.data;
      let mergedCards = [...cards];
      let mergedTypes = [...types];
      let mergedClasses = [...classes];
      let mergedSubtypes = [...subtypes];
      let mergedSubclasses = [...subclasses];

      // Merge or replace cards
      if (imported.cards) {
        if (importOptions.mergeCards) {
          if (importOptions.overwriteDuplicates) {
            const existingIds = new Set(cards.map(c => c.id));
            mergedCards = cards.filter(c => !imported.cards.some(ic => ic.id === c.id));
            mergedCards = [...mergedCards, ...imported.cards];
          } else {
            const existingIds = new Set(cards.map(c => c.id));
            const newCards = imported.cards.filter(c => !existingIds.has(c.id));
            mergedCards = [...mergedCards, ...newCards];
          }
        } else {
          mergedCards = imported.cards;
        }
      }

      // Merge or replace metadata
      if (imported.metadata) {
        const mergeMetadata = (existing, imported, key) => {
          if (importOptions.mergeMetadata) {
            const existingIds = new Set(existing.map(i => i.id));
            const newItems = imported.filter(i => !existingIds.has(i.id));
            return [...existing, ...newItems];
          } else {
            return imported;
          }
        };

        if (imported.metadata.types) {
          mergedTypes = mergeMetadata(types, imported.metadata.types, 'types');
        }
        if (imported.metadata.classes) {
          mergedClasses = mergeMetadata(classes, imported.metadata.classes, 'classes');
        }
        if (imported.metadata.subtypes) {
          mergedSubtypes = mergeMetadata(subtypes, imported.metadata.subtypes, 'subtypes');
        }
        if (imported.metadata.subclasses) {
          mergedSubclasses = mergeMetadata(subclasses, imported.metadata.subclasses, 'subclasses');
        }
      }

      onImportComplete({
        cards: mergedCards,
        types: mergedTypes,
        classes: mergedClasses,
        subtypes: mergedSubtypes,
        subclasses: mergedSubclasses
      });

      setImportStatus({ 
        type: 'success', 
        message: 'Successfully imported data!' 
      });
      
      setTimeout(() => {
        onClose();
        setImportStatus(null);
        setImportOptions({
          mergeMetadata: true,
          mergeCards: true,
          overwriteDuplicates: false
        });
      }, 1500);

    } catch (error) {
      setImportStatus({ 
        type: 'error', 
        message: `Import failed: ${error.message}` 
      });
    }
  };

  const resetImport = () => {
    setImportStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import / Export</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('export');
              resetImport();
            }}
          >
            Export
          </button>
          <button 
            className={`tab ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('import');
              resetImport();
            }}
          >
            Import
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'export' && (
            <div className="export-section">
              <h3>Download Your Data</h3>
              <p className="export-description">
                Export your card collection and metadata to backup or share with others.
              </p>

              <div className="export-options">
                <button className="export-btn primary" onClick={handleExportAll}>
                  📦 Export Everything
                </button>
                <button className="export-btn" onClick={handleExportCards}>
                  🃏 Export Cards Only ({cards.length})
                </button>
                <button className="export-btn" onClick={handleExportMetadata}>
                  ⚙️ Export Metadata Only
                </button>
              </div>

              <div className="export-note">
                <small>
                  Files are saved as JSON and can be imported back later. 
                  Keep backups in a safe location!
                </small>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="import-section">
              {!importStatus || importStatus.type === 'idle' ? (
                <>
                  <h3>Upload Data File</h3>
                  <p className="import-description">
                    Select a previously exported JSON file to import cards and/or metadata.
                  </p>

                  <div className="file-upload-area" onClick={triggerFileInput}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    <div className="upload-content">
                      <div className="upload-icon">📁</div>
                      <p className="upload-title">Click to select a file</p>
                      <p className="upload-hint">or drag and drop a JSON file here</p>
                      <p className="upload-format">Supported format: .json</p>
                    </div>
                  </div>
                </>
              ) : importStatus.type === 'loading' ? (
                <div className="status-message loading">
                  <span className="spinner"></span>
                  {importStatus.message}
                </div>
              ) : importStatus.type === 'preview' ? (
                <div className="import-preview">
                  <h3>Review Before Importing</h3>
                  
                  <div className="preview-stats">
                    <div className="stat">
                      <span className="stat-value">{importStatus.data.cards?.length || 0}</span>
                      <span className="stat-label">Cards</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">
                        {(importStatus.data.metadata?.types?.length || 0) +
                         (importStatus.data.metadata?.classes?.length || 0) +
                         (importStatus.data.metadata?.subtypes?.length || 0) +
                         (importStatus.data.metadata?.subclasses?.length || 0)}
                      </span>
                      <span className="stat-label">Metadata Items</span>
                    </div>
                  </div>

                  <div className="import-options">
                    <h4>Import Options</h4>
                    
                    <label className="option-row">
                      <input
                        type="checkbox"
                        checked={importOptions.mergeCards}
                        onChange={(e) => setImportOptions(prev => ({
                          ...prev,
                          mergeCards: e.target.checked
                        }))}
                      />
                      <span>Merge cards with existing collection</span>
                    </label>

                    <label className="option-row">
                      <input
                        type="checkbox"
                        checked={importOptions.mergeMetadata}
                        onChange={(e) => setImportOptions(prev => ({
                          ...prev,
                          mergeMetadata: e.target.checked
                        }))}
                      />
                      <span>Merge metadata with existing definitions</span>
                    </label>

                    <label className="option-row">
                      <input
                        type="checkbox"
                        checked={importOptions.overwriteDuplicates}
                        onChange={(e) => setImportOptions(prev => ({
                          ...prev,
                          overwriteDuplicates: e.target.checked
                        }))}
                      />
                      <span>Overwrite cards with matching IDs</span>
                    </label>
                  </div>

                  <div className="import-actions">
                    <button className="btn-secondary" onClick={resetImport}>
                      Cancel
                    </button>
                    <button className="btn-primary" onClick={handleImportConfirm}>
                      Confirm Import
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`status-message ${importStatus.type}`}>
                  {importStatus.message}
                  {importStatus.type !== 'success' && (
                    <button 
                      className="btn-secondary" 
                      onClick={resetImport}
                      style={{ marginTop: '15px' }}
                    >
                      Try Again
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImportExportModal;