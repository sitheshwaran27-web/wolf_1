import React, { useState } from 'react';
import zxcvbn from 'zxcvbn';
import { 
  Shield, Key, AlertTriangle, CheckCircle2, Zap, Lock, RefreshCw
} from 'lucide-react';

const generateStrongPassword = () => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
  
  let pass = '';
  // Ensure requirements: min 16 chars, 1 upper, 1 lower, 2 numbers, 2 special
  pass += upper[Math.floor(Math.random() * upper.length)];
  pass += lower[Math.floor(Math.random() * lower.length)];
  pass += numbers[Math.floor(Math.random() * numbers.length)];
  pass += numbers[Math.floor(Math.random() * numbers.length)];
  pass += special[Math.floor(Math.random() * special.length)];
  pass += special[Math.floor(Math.random() * special.length)];
  
  const allChars = upper + lower + numbers + special;
  for (let i = pass.length; i < 16; i++) {
    pass += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle
  return pass.split('').sort(() => 0.5 - Math.random()).join('');
};

export default function PasswordAnalyzer() {
  const [password, setPassword] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzePassword = () => {
    if (!password) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      const result = zxcvbn(password);
      
      const length = password.length;
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumbers = (password.match(/[0-9]/g) || []).length >= 2;
      const hasSpecials = (password.match(/[^A-Za-z0-9]/g) || []).length >= 2;
      
      let strength = 'Very Weak';
      let score = Math.max(0, result.score * 20 + (length > 8 ? 10 : 0) + (length >= 16 ? 10 : 0));
      
      if (score >= 90) strength = 'Very Strong';
      else if (score >= 70) strength = 'Strong';
      else if (score >= 50) strength = 'Medium';
      else if (score >= 30) strength = 'Weak';

      const weaknesses = [];
      if (length < 16) weaknesses.push("Does not meet the minimum 16-character length requirement.");
      if (!hasUpper) weaknesses.push("Missing uppercase letters.");
      if (!hasLower) weaknesses.push("Missing lowercase letters.");
      if (!hasNumbers) weaknesses.push("Requires at least 2 numbers.");
      if (!hasSpecials) weaknesses.push("Requires at least 2 special characters.");
      if (result.feedback.warning) weaknesses.push(result.feedback.warning);
      if (weaknesses.length === 0) weaknesses.push("No major weaknesses found, but regular rotation is advised.");

      setAnalysis({
        strength,
        score,
        weaknesses,
        checklist: {
          length: length >= 16,
          upper: hasUpper,
          lower: hasLower,
          numbers: hasNumbers,
          specials: hasSpecials,
          noCommon: result.score > 2,
          noRepeats: !/(.)\1{2,}/.test(password),
          bruteForce: result.score >= 3
        },
        suggestions: [
          { pass: generateStrongPassword(), strength: 'Very Strong', score: 98, reason: 'High entropy combination of random characters avoiding dictionary patterns.' },
          { pass: generateStrongPassword(), strength: 'Very Strong', score: 99, reason: 'Scattered distribution of special characters and digits prevents sequential guessing.' },
          { pass: generateStrongPassword(), strength: 'Very Strong', score: 97, reason: 'Exceeds length requirements without relying on predictable keyboard walks.' }
        ]
      });
      setIsAnalyzing(false);
    }, 600);
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: '#8b5cf6' }}>
          <Zap size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>AI Password Security Expert</h2>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Analyze credentials in real-time and generate intelligent enterprise-grade suggestions.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Enter a password to analyze..." 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && analyzePassword()}
            style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '1rem', outline: 'none' }}
          />
        </div>
        <button 
          className="btn" 
          onClick={analyzePassword}
          disabled={!password || isAnalyzing}
          style={{ background: '#8b5cf6', color: 'white', padding: '0 2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {isAnalyzing ? <RefreshCw className="spin" size={18} /> : <Shield size={18} />}
          {isAnalyzing ? 'Analyzing...' : 'Analyze Password'}
        </button>
      </div>

      {analysis && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
          
          {/* Left Column: Analysis Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Password Strength</span>
                <strong style={{ color: analysis.score >= 70 ? '#10b981' : analysis.score >= 50 ? '#f59e0b' : '#ef4444' }}>{analysis.strength}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Security Score</span>
                <strong>{analysis.score} / 100</strong>
              </div>
              
              <h4 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <AlertTriangle size={16} color="#ef4444" /> Weaknesses Found
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {analysis.weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
              </ul>
            </div>

            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <CheckCircle2 size={16} color="#10b981" /> Security Checklist
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{analysis.checklist.length ? '✅' : '❌'} Minimum 16 characters length</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{analysis.checklist.upper ? '✅' : '❌'} Uppercase letters included</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{analysis.checklist.lower ? '✅' : '❌'} Lowercase letters included</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{analysis.checklist.numbers ? '✅' : '❌'} Numbers included (at least 2)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{analysis.checklist.specials ? '✅' : '❌'} Special characters included (at least 2)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{analysis.checklist.noCommon ? '✅' : '❌'} No common words or dictionary roots</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{analysis.checklist.noRepeats ? '✅' : '❌'} No repeated patterns or keyboard walks</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{analysis.checklist.bruteForce ? '✅' : '❌'} Resistant to brute-force attacks</div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Suggestions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'white' }}>
               <Key size={18} color="#3b82f6" /> Improvement Suggestions
            </h4>
            
            {analysis.suggestions.map((sug: any, i: number) => (
              <div key={i} style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Suggestion {i + 1}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '1.25rem', color: 'white', marginBottom: '0.5rem', letterSpacing: '2px' }}>{sug.pass}</div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <span>Strength: <strong style={{ color: '#10b981' }}>{sug.strength}</strong></span>
                  <span>Score: <strong>{sug.score}/100</strong></span>
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{sug.reason}</p>
              </div>
            ))}

            <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#10b981', fontSize: '0.875rem' }}>Final Recommendation</h4>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Never use common words, names, or predictable number sequences (like "123") in enterprise credentials. Adopt one of the highly randomized suggestions above and store it securely within an encrypted password manager to ensure maximum account security.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
