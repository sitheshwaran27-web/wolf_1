import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  History, 
  AlertTriangle, 
  Activity, 
  Bot, 
  Database,
  ChevronRight,
  PlayCircle,
  CheckCircle2
} from 'lucide-react';

function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className="glow-blob glow-top-right"></div>
      <div className="glow-blob glow-bottom-left" style={{ top: '40%', left: '-10%', right: 'auto' }}></div>

      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-content">
          <div className="navbar-logo">
            <ShieldCheck size={32} color="var(--primary)" />
            <span>PasswordShield</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button className="btn btn-primary">Start Security Audit</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section hero container">
        <div className="animate-fade-in">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '2rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }}></span>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#3b82f6' }}>AI-Powered Browser Security</span>
          </div>
          <h1>
            Secure Every Password.<br />
            <span className="text-gradient">Protect Every Account.</span>
          </h1>
          <p style={{ maxWidth: '600px', margin: '1.5rem auto 0' }}>
            An intelligent browser extension that detects weak passwords, password reuse, expiry risks, and improves organizational password security with AI.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary">
              Start Security Audit <ChevronRight size={18} />
            </button>
            <button className="btn btn-secondary">
              <PlayCircle size={18} /> View Demo
            </button>
          </div>
        </div>

        {/* Dashboard Mockup in Hero */}
        <div className="glass-panel animate-fade-in delay-200" style={{ marginTop: '4rem', padding: '1rem', background: 'rgba(10, 10, 15, 0.8)' }}>
          <div style={{ background: '#05050A', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }}></div>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }}></div>
              <div style={{ marginLeft: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.5)', padding: '0.25rem 2rem', borderRadius: '4px' }}>passwordshield.app/dashboard</div>
            </div>
            <div style={{ padding: '2rem', display: 'flex', gap: '2rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', border: '4px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>92</div>
                  <div>
                    <h3 style={{ margin: 0 }}>Security Health</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>Your organization is well protected.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { label: 'Weak Passwords detected', value: '2', color: '#f59e0b' },
                    { label: 'Reused credentials found', value: '0', color: '#10b981' },
                    { label: 'Expired passwords', value: '5', color: '#ef4444' }
                  ].map((stat, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.875rem' }}>{stat.label}</span>
                      <span style={{ color: stat.color, fontWeight: 700 }}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px dashed rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                 <Bot size={48} color="var(--primary)" opacity={0.5} />
                 <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>AI Scanning Animation Concept...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 className="text-gradient">Comprehensive Protection</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto' }}>Advanced features designed to seamlessly secure your credentials without slowing down your workflow.</p>
        </div>
        
        <div className="grid grid-cols-3">
          {[
            { icon: <Key size={24} />, title: 'Weak Password Detection', desc: 'Identify weak and common passwords using continuously updated security databases.' },
            { icon: <History size={24} />, title: 'Password Reuse Detection', desc: 'Detect reused passwords by analyzing secure password history across accounts.' },
            { icon: <AlertTriangle size={24} />, title: 'Expiry Monitoring', desc: 'Track password age and proactively identify expired credentials before they become a risk.' },
            { icon: <Activity size={24} />, title: 'Risk Score Dashboard', desc: 'Provide an overarching security health score and visual reports for admins.' },
            { icon: <Bot size={24} />, title: 'AI Remediation Assistant', desc: 'Generate security recommendations and automated email templates for users.' },
            { icon: <Database size={24} />, title: 'Mock Data Security Audit', desc: 'Import CSV/JSON enterprise password data safely for robust testing and auditing.' }
          ].map((feature, i) => (
            <div key={i} className="glass-panel">
              <div className="feature-icon-wrapper">{feature.icon}</div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{feature.title}</h3>
              <p style={{ fontSize: '0.875rem' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2>How It Works</h2>
          <p>Four simple steps to secure your entire organization.</p>
        </div>
        <div className="grid grid-cols-4" style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '24px', left: '10%', right: '10%', height: '2px', background: 'var(--border-color)', zIndex: -1, display: 'none' /* Will show on desktop later */ }}></div>
          {[
            { num: '01', title: 'Install Extension', desc: 'Deploy across your organization browsers seamlessly.' },
            { num: '02', title: 'Scan Security', desc: 'Extension securely scans for risks in the background.' },
            { num: '03', title: 'Analyze Risk', desc: 'AI analyzes data to calculate your health score.' },
            { num: '04', title: 'Generate Report', desc: 'Get actionable insights and remediation steps.' },
          ].map((step, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', margin: '0 auto 1.5rem', boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}>
                {step.num}
              </div>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{step.title}</h3>
              <p style={{ fontSize: '0.875rem' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Section */}
      <section className="section container" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '24px', padding: '4rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Powered by Enterprise-Grade Technology</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', color: 'var(--text-muted)' }}>
            {['React', 'TypeScript', 'Chrome Extension API', 'FastAPI', 'SQLite', 'AI Security Engine'].map((tech, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                <CheckCircle2 size={16} color="var(--primary)" /> {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section container" style={{ textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '5rem 2rem', background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
          <h2 className="text-gradient">Strengthen Your Password Security Today</h2>
          <p style={{ maxWidth: '500px', margin: '1rem auto 2rem' }}>Join forward-thinking organizations that use PasswordShield to eliminate credential vulnerabilities before they are exploited.</p>
          <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
            Run Free Security Check
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer container">
        <div className="footer-grid">
          <div>
            <div className="navbar-logo" style={{ marginBottom: '1rem' }}>
              <ShieldCheck size={24} color="var(--primary)" />
              <span>PasswordShield</span>
            </div>
            <p style={{ fontSize: '0.875rem', maxWidth: '300px' }}>Security-first browser extension for modern teams. Protect your accounts intelligently.</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Product</h4>
            <div className="footer-links">
              <a href="#">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Security</a>
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Connect</h4>
            <div className="footer-links" style={{ flexDirection: 'row', gap: '1rem' }}>
              <a href="#">GitHub</a>
              <a href="#">Twitter</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem 0 0', marginTop: '2rem', borderTop: '1px solid var(--border-color)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          &copy; {new Date().getFullYear()} PasswordShield. All rights reserved.
        </div>
      </footer>
    </>
  );
}

export default App;
