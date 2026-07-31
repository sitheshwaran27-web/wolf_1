import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  KeyRound, 
  Fingerprint, 
  ScanFace,
  ChevronLeft
} from 'lucide-react';

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
      <div className="glow-blob glow-top-right" style={{ opacity: 0.1 }}></div>
      <div className="glow-blob glow-bottom-left" style={{ opacity: 0.1 }}></div>

      <button 
        onClick={() => navigate('/')} 
        style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
        className="hover-brighten"
      >
        <ChevronLeft size={20} /> Back to Home
      </button>

      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--accent-gradient)' }}></div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <ShieldCheck size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', textAlign: 'center' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>Securely access your dashboard</p>
        </div>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
            <input 
              type="email" 
              placeholder="name@company.com" 
              style={{ 
                padding: '0.875rem 1rem', 
                borderRadius: '8px', 
                background: 'rgba(0,0,0,0.2)', 
                border: '1px solid var(--border-color)', 
                color: 'var(--text-main)',
                outline: 'none',
                transition: 'border-color 0.3s'
              }} 
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>
          <button type="button" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
            Continue with Email
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Or continue with</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', border: '1px dashed rgba(255,255,255,0.2)' }}>
            <KeyRound size={20} /> Use Passkey
          </button>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" style={{ flex: 1, padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
              <Fingerprint size={28} color="var(--primary)" />
              <span style={{ fontSize: '0.875rem' }}>Fingerprint</span>
            </button>
            <button className="btn btn-secondary" style={{ flex: 1, padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', background: 'rgba(139, 92, 246, 0.05)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
              <ScanFace size={28} color="var(--secondary)" />
              <span style={{ fontSize: '0.875rem' }}>Face ID</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
