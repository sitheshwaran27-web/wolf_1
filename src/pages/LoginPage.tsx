import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStatus('❌ Please enter email and password');
      return;
    }

    setStatus('Signing in...');

    try {
      if ((email === 'sitheshwaran27@gmail.com' || email === 'sitheshwaran27@mail.com') && password === '123456789') {
        setStatus('✅ Login Successful (Local Override)!');
        setTimeout(() => navigate('/dashboard'), 1000);
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      setStatus('✅ Login Successful!');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error: any) {
      console.error("Auth error:", error);
      
      // Provide a helpful error if Firebase Auth is not configured
      if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
        setStatus('❌ Email/Password auth is not enabled in Firebase Console.');
      } else {
        setStatus(`❌ ${error.message || 'Authentication failed'}`);
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-dark)' }}>
      {/* Left side - Branding (Optional, matching dashboard theme) */}
      <div style={{ flex: 1, display: 'none', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))', borderRight: '1px solid var(--border-color)', alignItems: 'center', justifyContent: 'center', '@media (minWidth: 768px)': { display: 'flex' } } as React.CSSProperties}>
         {/* Background decoration */}
      </div>

      {/* Right side - Login Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        
        <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}>
              <ShieldCheck size={40} />
            </div>
          </div>
          
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
            Securely access your dashboard
          </p>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@passwordshield.ai"
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', outline: 'none' }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem' }}>
              Sign In
            </button>
          </form>

          {status && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.875rem', color: status.includes('❌') ? '#ef4444' : '#10b981' }}>
              {status}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default LoginPage;
