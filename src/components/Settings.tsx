import React, { useState } from 'react';
import { 
  Save, RotateCcw, X, Globe, Bell
} from 'lucide-react';

export default function Settings() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      
      {/* Sticky Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(5, 5, 10, 0.8)', backdropFilter: 'blur(12px)', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: 'white' }}>Enterprise Settings</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Configure global security policies and system preferences.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <RotateCcw size={16} /> Restore Default
          </button>
          <button className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none' }}>
             <X size={16} /> Cancel
          </button>
          <button className="btn" style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleSave} disabled={isSaving}>
             {isSaving ? <RotateCcw size={16} className="spin" /> : <Save size={16} />} 
             {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* General */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
              <Globe size={20} color="#3b82f6" />
              <h3 style={{ margin: 0, fontSize: '1.125rem' }}>General</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Organization Name</label>
                <input type="text" defaultValue="Acme Corp" className="form-input" style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '4px', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Admin Email</label>
                <input type="email" defaultValue="admin@acme.com" className="form-input" style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '4px', color: 'white' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Timezone</label>
                  <select style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '4px', color: 'white' }}>
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                    <option value="EST">EST (Eastern Standard Time)</option>
                    <option value="PST">PST (Pacific Standard Time)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Language</label>
                  <select style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '4px', color: 'white' }}>
                    <option value="EN">English</option>
                    <option value="ES">Spanish</option>
                    <option value="FR">French</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          


        </div>
      </div>
    </div>
  );
}
