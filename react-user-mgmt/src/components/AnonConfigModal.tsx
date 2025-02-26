import React, { useState } from 'react';

interface AnonConfigModalProps {
  initialAllowReads: boolean;
  initialAllowWrites: boolean;
  onClose: () => void;
}

const AnonConfigModal: React.FC<AnonConfigModalProps> = ({ 
  initialAllowReads, 
  initialAllowWrites,
  onClose 
}) => {
  const [allowReads, setAllowReads] = useState(initialAllowReads);
  const [allowWrites, setAllowWrites] = useState(initialAllowWrites);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const response = await fetch('/admin/post-anon-config', {
        method: 'POST',
        body: JSON.stringify({ allowReads, allowWrites }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        onClose();
      } else {
        console.error('Failed to save anonymous config');
      }
    } catch (error) {
      console.error('Error saving anonymous config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mws-modal-container">
      <div className="mws-modal-content">
        <h1>Anonymous Access Configuration</h1>
        <p>This configuration allows anonymous users to read and write to the wiki.</p>
        <form className="mws-anon-config-form" onSubmit={handleSubmit}>
          <div className="mws-modal-section">
            <input 
              type="checkbox" 
              name="allowReads" 
              checked={allowReads} 
              onChange={(e) => setAllowReads(e.target.checked)}
            /> Allow anonymous reads
          </div>
          <div className="mws-modal-section">
            <input 
              type="checkbox" 
              name="allowWrites" 
              checked={allowWrites}
              onChange={(e) => setAllowWrites(e.target.checked)}
            /> Allow anonymous writes
          </div>
          <div className="mws-modal-buttons">
            <button 
              type="submit" 
              className="mws-modal-button-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnonConfigModal;
