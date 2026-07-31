import React, { useState, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  ShieldCheck, LayoutDashboard, DownloadCloud, Activity, BarChart2, 
  Users, FileText, Settings as SettingsIcon, LogOut,
  Search, AlertTriangle, ShieldAlert, CheckCircle2, Bot, Filter,
  X, ChevronRight, Bell, HeartPulse, Grid
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import zxcvbn from 'zxcvbn';
import RiskAnalytics from '../components/RiskAnalytics';
import Reports from '../components/Reports';
import SettingsPage from '../components/Settings';
import AISecurity from '../components/AISecurity';
import PasswordAnalyzer from '../components/PasswordAnalyzer';
import HealthEngine from '../components/HealthEngine';
import Heatmap from '../components/Heatmap';
import EmptyState from '../components/EmptyState';
import { useData } from '../contexts/DataContext';

// Static fallbacks
const DEFAULT_BAR_DATA = [
  { name: 'Finance', value: 0 }, { name: 'HR', value: 0 }, { name: 'IT', value: 0 },
  { name: 'Marketing', value: 0 }, { name: 'Operations', value: 0 }, { name: 'Admin', value: 0 },
];

const DEFAULT_RISK_PIE = [
  { name: 'Low Risk', value: 100, color: '#10b981' },
  { name: 'Medium Risk', value: 0, color: '#f59e0b' },
  { name: 'High Risk', value: 0, color: '#ef4444' },
];

const getPasswordCategory = (password: string, zxcvbnResult: any) => {
  const length = password.length;
  const score = zxcvbnResult.score;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  
  if (score === 4 && length >= 12 && hasUpper && hasLower && hasNumber && hasSpecial) return 'Strong';
  if (score >= 2 && length >= 8 && hasUpper && hasNumber && !hasSpecial) return 'Medium';
  return 'Weak';
};

const getCategoryScore = (category: string) => {
  if (category === 'Strong') return 100;
  if (category === 'Medium') return 60;
  return 20;
};

const getCategoryColor = (category: string) => {
  if (category === 'Strong') return '#10b981';
  if (category === 'Medium') return '#f59e0b';
  return '#ef4444';
};

export default function Dashboard() {
  const { dataImported, setDataImported } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Dynamic States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [weakPasswords, setWeakPasswords] = useState(0);
  const [reusedPasswords, setReusedPasswords] = useState(0);
  const [overallScore, setOverallScore] = useState(100);
  const [barData, setBarData] = useState(DEFAULT_BAR_DATA);
  const [riskPie, setRiskPie] = useState(DEFAULT_RISK_PIE);
  
  const [analyzedUsers, setAnalyzedUsers] = useState<any[]>([]);
  
  // Password Analysis Tab States
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [strengthFilter, setStrengthFilter] = useState('All'); // 'All', 'Weak', 'Medium', 'Strong'
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const handleStrengthFilterChange = (filter: string) => {
    setIsFiltering(true);
    setStrengthFilter(filter);
    setTimeout(() => setIsFiltering(false), 400); // Fake smooth loading
  };

  const filteredUsers = analyzedUsers.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'All' || u.department === departmentFilter;
    const matchesStrength = strengthFilter === 'All' || u.category === strengthFilter;
    return matchesSearch && matchesDept && matchesStrength;
  });
  
  const departments = ['All', ...Array.from(new Set(analyzedUsers.map(u => u.department)))];
  
  const totalAnalyzed = analyzedUsers.length || 1;
  const weakCount = analyzedUsers.filter(u => u.category === 'Weak').length;
  const medCount = analyzedUsers.filter(u => u.category === 'Medium').length;
  const strongCount = analyzedUsers.filter(u => u.category === 'Strong').length;
  const weakPct = Math.round((weakCount / totalAnalyzed) * 100);
  const medPct = Math.round((medCount / totalAnalyzed) * 100);
  const strongPct = Math.round((strongCount / totalAnalyzed) * 100);

  const handleRunAnalysis = () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data: any[] = results.data;
        let wCount = 0;
        let rCount = 0;
        const passwordSeen = new Set<string>();
        const deptScores: Record<string, { total: number, weak: number }> = {};
        const parsedUsers: any[] = [];

        data.forEach(row => {
          const pass = row.Password || '';
          const dept = row.Department || 'Unknown';
          
          if (!deptScores[dept]) deptScores[dept] = { total: 0, weak: 0 };
          deptScores[dept].total += 1;

          const result = zxcvbn(pass);
          const category = getPasswordCategory(pass, result);
          
          if (category === 'Weak') {
            wCount++;
            deptScores[dept].weak += 1;
          }

          let reused = false;
          if (passwordSeen.has(pass)) {
            rCount++;
            reused = true;
          } else {
            passwordSeen.add(pass);
          }

          // Generate extended mock data for the details modal
          const age = Math.floor(Math.random() * 200);
          const expired = age > 90;
          const common = result.score <= 1 && pass.length < 10;
          const aiRecs = [];
          if (category === 'Weak') aiRecs.push("Force immediate password reset.");
          if (reused) aiRecs.push("Flag account for cross-service credential stuffing.");
          if (expired) aiRecs.push("Password has exceeded the 90-day policy limit.");
          if (aiRecs.length === 0) aiRecs.push("Account posture is secure. No action needed.");

          const lastChangedDate = new Date();
          lastChangedDate.setDate(lastChangedDate.getDate() - age);

          parsedUsers.push({
            id: Math.random().toString(36).substr(2, 9),
            username: row.Username || 'Unknown',
            email: `${(row.Username || 'user').toLowerCase().replace(/\s+/g, '.')}@company.com`,
            department: dept,
            category: category,
            score: getCategoryScore(category),
            zxcvbnScore: result.score,
            crackTime: result.crack_times_display.offline_fast_hashing_1e10_per_second,
            age: age,
            lastChanged: lastChangedDate.toISOString().split('T')[0],
            reused: reused,
            common: common,
            expired: expired,
            status: category === 'Weak' || expired ? 'Critical' : category === 'Medium' ? 'Warning' : 'Safe',
            aiRecommendations: aiRecs
          });
        });

        const total = data.length || 1;
        const newBarData = Object.keys(deptScores).map(dept => ({
          name: dept,
          value: Math.round((deptScores[dept].weak / deptScores[dept].total) * 100)
        })).sort((a,b) => b.value - a.value).slice(0, 6);

        const weakPercent = (wCount / total) * 100;
        const reusedPercent = (rCount / total) * 100;
        let score = 100 - (weakPercent * 0.7) - (reusedPercent * 0.3);
        score = Math.max(0, Math.round(score));

        const newRiskPie = [
          { name: 'Low Risk', value: Math.max(0, 100 - weakPercent - reusedPercent), color: '#10b981' },
          { name: 'Medium Risk', value: reusedPercent, color: '#f59e0b' },
          { name: 'High Risk', value: weakPercent, color: '#ef4444' },
        ];

        setTimeout(() => {
          setTotalUsers(total);
          setWeakPasswords(wCount);
          setReusedPasswords(rCount);
          setOverallScore(score);
          setBarData(newBarData.length > 0 ? newBarData : DEFAULT_BAR_DATA);
          setRiskPie(newRiskPie);
          setAnalyzedUsers(parsedUsers.sort((a,b) => a.score - b.score));
          setIsAnalyzing(false);
          setDataImported(true);
          setActiveTab('Password Analysis');
        }, 1500);
      }
    });
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem', color: '#fff', fontSize: '1.25rem', fontWeight: 700 }}>
          <ShieldCheck size={28} color="#10b981" />
          <span>PasswordShield AI</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {[
            { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
            { name: 'Import Data', icon: <DownloadCloud size={18} /> },
            { name: 'Password Analysis', icon: <Activity size={18} /> },
            { name: 'Health Score', icon: <HeartPulse size={18} /> },
            { name: 'Dept. Heatmap', icon: <Grid size={18} /> },
            { name: 'Risk Analytics', icon: <BarChart2 size={18} /> },
            { name: 'AI Predictions', icon: <Bot size={18} /> },
            { name: 'Reports', icon: <FileText size={18} /> },
            { name: 'Settings', icon: <SettingsIcon size={18} /> },
          ].map((item, i) => {
            const isActive = activeTab === item.name;
            return (
              <div 
                key={i} 
                onClick={() => setActiveTab(item.name)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', 
                  borderRadius: '8px', cursor: 'pointer',
                  background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  color: isActive ? '#10b981' : 'var(--text-muted)',
                  borderLeft: isActive ? '2px solid #10b981' : '2px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                {item.icon}
                <span style={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 400 }}>{item.name}</span>
              </div>
            );
          })}
          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', color: '#ef4444', cursor: 'pointer', opacity: 0.8 }} onClick={() => navigate('/')}>
              <LogOut size={18} />
              <span style={{ fontSize: '0.875rem' }}>Logout</span>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="dashboard-main" style={{ position: 'relative' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{activeTab}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Welcome back, Admin
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>
            
            {/* Notification Bell Toggle */}
            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '50%', transition: 'background 0.2s' }} className="hover:bg-white hover:bg-opacity-5">
              <Bell size={20} />
            </button>

            {/* Notification Dropdown */}
            {isNotificationsOpen && (
              <div style={{ position: 'absolute', top: '120%', right: '0', width: '350px', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                  <Bell size={20} color="#8b5cf6" />
                  <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'white' }}>Notifications</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {[
                    { title: 'Email Alerts', desc: 'Receive security alerts via email.' },
                    { title: 'Browser Notifications', desc: 'Real-time dashboard popups.' },
                    { title: 'Weekly Reports', desc: 'Automated weekly digest emails.' },
                    { title: 'Monthly Reports', desc: 'Monthly comprehensive compliance reports.' },
                  ].map((notif, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.875rem', color: 'white' }}>{notif.title}</h4>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{notif.desc}</p>
                      </div>
                      <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
                        <input type="checkbox" defaultChecked={i !== 1} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: i !== 1 ? '#10b981' : 'rgba(255,255,255,0.2)', borderRadius: '34px' }}></span>
                        <span style={{ position: 'absolute', height: '18px', width: '18px', left: i !== 1 ? '20px' : '3px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '0.4s' }}></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
               <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>A</div>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Admin User</span>
               </div>
            </div>
          </div>
        </div>

        {/* Views */}
        {activeTab === 'Dashboard' ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981' }}><Users size={20} /></div>
                  <span className="card-title" style={{ margin: 0 }}>Total Users</span>
                </div>
                <div className="card-value">{dataImported ? totalUsers : '--'}</div>
                {!dataImported && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Awaiting Data</div>}
              </div>
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: '#ef4444' }}><ShieldAlert size={20} /></div>
                  <span className="card-title" style={{ margin: 0 }}>Weak Passwords</span>
                </div>
                <div className="card-value">{dataImported ? weakPasswords : '--'}</div>
                {!dataImported && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Awaiting Data</div>}
              </div>
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', color: '#f59e0b' }}><AlertTriangle size={20} /></div>
                  <span className="card-title" style={{ margin: 0 }}>Reused Passwords</span>
                </div>
                <div className="card-value">{dataImported ? reusedPasswords : '--'}</div>
                {!dataImported && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Awaiting Data</div>}
              </div>
              <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                 <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981' }}><ShieldCheck size={20} /></div>
                      <span className="card-title" style={{ margin: 0 }}>Overall Health Score</span>
                    </div>
                    {dataImported ? (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span className="card-value" style={{ margin: 0 }}>{overallScore}</span>
                        <span style={{ color: 'var(--text-muted)' }}>/ 100</span>
                      </div>
                    ) : (
                      <div className="card-value">--</div>
                    )}
                    {!dataImported && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Awaiting Analysis</div>}
                 </div>
              </div>
            </div>
            
            {!dataImported ? (
              <EmptyState 
                icon={<BarChart2 size={40} color="#3b82f6" />}
                headline="No Analytics Available"
                description="Import employee password data to generate analytics and unlock AI-powered insights."
                actionButton={<button className="btn btn-primary" onClick={() => setActiveTab('Import Data')}>Upload Data</button>}
              />
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <span className="card-title" style={{ margin: 0, color: 'white' }}>Department Weak Password Distribution</span>
                    <div style={{ height: '200px', marginTop: '1rem' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{background: '#05050A', border: '1px solid #1e293b'}} />
                          <Bar dataKey="value" radius={[4,4,0,0]}>
                            {barData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index === 1 ? '#f97316' : index === 2 ? '#f59e0b' : index === 3 ? '#eab308' : '#10b981'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <span className="card-title" style={{ margin: 0, color: 'white', display: 'block', marginBottom: '1.5rem' }}>Risk Level Breakdown</span>
                     <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ flex: 1, height: '180px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={riskPie} cx="50%" cy="50%" innerRadius={55} outerRadius={75} stroke="none" dataKey="value">
                              {riskPie.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <RechartsTooltip contentStyle={{background: '#05050A', border: '1px solid #1e293b'}} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
                <PasswordAnalyzer />
              </>
            )}
          </>
        ) : activeTab === 'Import Data' ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'rgba(59, 130, 246, 0.5)' }}>
            <DownloadCloud size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
            <h3>Upload Password Data</h3>
            <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()} disabled={isAnalyzing} style={{ marginTop: '1rem' }}>
              {isAnalyzing ? 'Analyzing Data...' : 'Select Files'}
            </button>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".csv" onChange={(e) => { if (e.target.files && e.target.files.length > 0) setSelectedFile(e.target.files[0]); }} />
            {selectedFile && !isAnalyzing && (
              <div style={{ marginTop: '2rem' }}>
                <button className="btn btn-primary" style={{ background: '#10b981', padding: '0.75rem 2rem' }} onClick={handleRunAnalysis}>
                   <Activity size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }}/>
                   Run Security Analysis
                </button>
              </div>
            )}
          </div>
        ) : activeTab === 'Password Analysis' ? (
          <div className="glass-panel">
            <h3>Password Strength Analysis</h3>
            {analyzedUsers.length === 0 ? (
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>No data analyzed yet.</p>
            ) : (
              <>
                {/* Clickable Summary Cards */}
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', marginBottom: '1rem' }}>
                  {[
                    { label: 'Weak Passwords', category: 'Weak', count: weakCount, pct: weakPct, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
                    { label: 'Medium Passwords', category: 'Medium', count: medCount, pct: medPct, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
                    { label: 'Strong Passwords', category: 'Strong', count: strongCount, pct: strongPct, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }
                  ].map(card => (
                    <div 
                      key={card.category}
                      onClick={() => handleStrengthFilterChange(card.category)}
                      style={{ 
                        flex: 1, padding: '1.5rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease',
                        background: strengthFilter === card.category ? card.bg : 'rgba(255,255,255,0.02)', 
                        border: `1px solid ${strengthFilter === card.category ? card.color : 'rgba(255,255,255,0.05)'}`,
                        transform: strengthFilter === card.category ? 'scale(1.02)' : 'scale(1)'
                      }}
                      className="hover:scale-105"
                    >
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{card.label}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: card.color }}>{card.pct}%</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>({card.count} users)</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Filter Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                      className="btn" 
                      onClick={() => handleStrengthFilterChange('All')}
                      style={{ background: strengthFilter === 'All' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)', color: strengthFilter === 'All' ? '#3b82f6' : 'white', border: `1px solid ${strengthFilter === 'All' ? '#3b82f6' : 'rgba(255,255,255,0.1)'}` }}
                    >
                      Show All Users
                    </button>
                    {strengthFilter !== 'All' && (
                       <span style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem', borderRadius: '999px', background: getCategoryColor(strengthFilter) + '33', color: getCategoryColor(strengthFilter), border: `1px solid ${getCategoryColor(strengthFilter)}` }}>
                         Showing {strengthFilter} Password Users ({filteredUsers.length})
                       </span>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.5rem 1rem', border: '1px solid var(--border-color)' }}>
                      <Search size={16} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
                      <input 
                        type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '150px', fontSize: '0.875rem' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.5rem 1rem', border: '1px solid var(--border-color)' }}>
                      <Filter size={16} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
                      <select 
                        value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', outline: 'none', fontSize: '0.875rem', cursor: 'pointer' }}
                      >
                        {departments.map(d => <option key={d} value={d} style={{ background: '#0f172a' }}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Users Table */}
                <div style={{ overflowX: 'auto', opacity: isFiltering ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                  {isFiltering && (
                    <div style={{ position: 'absolute', left: '50%', marginTop: '50px', transform: 'translateX(-50%)', color: 'var(--primary)' }}>
                      <Activity className="spin" size={32} />
                    </div>
                  )}
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '1rem 0' }}>Username</th>
                        <th style={{ padding: '1rem 0' }}>Department</th>
                        <th style={{ padding: '1rem 0' }}>Strength</th>
                        <th style={{ padding: '1rem 0' }}>Risk Score</th>
                        <th style={{ padding: '1rem 0' }}>Crack Time</th>
                        <th style={{ padding: '1rem 0' }}>Age</th>
                        <th style={{ padding: '1rem 0' }}>Last Changed</th>
                        <th style={{ padding: '1rem 0' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} onClick={() => setSelectedUser(user)} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.875rem', cursor: 'pointer', transition: 'background 0.2s' }} className="hover:bg-white hover:bg-opacity-5">
                          <td style={{ padding: '1rem 0', fontWeight: 500, color: 'white' }}>{user.username}</td>
                          <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{user.department}</td>
                          <td style={{ padding: '1rem 0', color: getCategoryColor(user.category), fontWeight: 600 }}>{user.category}</td>
                          <td style={{ padding: '1rem 0' }}>{Math.max(10, 100 - user.score)} / 100</td>
                          <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{user.crackTime}</td>
                          <td style={{ padding: '1rem 0' }}>{user.age} days</td>
                          <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{user.lastChanged}</td>
                          <td style={{ padding: '1rem 0' }}>
                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: user.status === 'Safe' ? 'rgba(16,185,129,0.1)' : user.status === 'Warning' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: user.status === 'Safe' ? '#10b981' : user.status === 'Warning' ? '#f59e0b' : '#ef4444' }}>
                              {user.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && !isFiltering && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                      <p>No users found for this filter combination.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : activeTab === 'Risk Analytics' ? (
          <RiskAnalytics />
        ) : activeTab === 'Health Score' ? (
          <HealthEngine />
        ) : activeTab === 'Dept. Heatmap' ? (
          <Heatmap />
        ) : activeTab === 'Reports' ? (
          <Reports />
        ) : activeTab === 'AI Predictions' ? (
          <AISecurity />
        ) : activeTab === 'Settings' ? (
          <SettingsPage />
        ) : (
          <div className="glass-panel" style={{ minHeight: '400px' }}>
             <h3>{activeTab}</h3>
             <p style={{ marginTop: '1rem' }}>Coming soon...</p>
          </div>
        )}

        {/* User Details Side Drawer / Modal */}
        {selectedUser && (
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', background: 'rgba(10, 10, 15, 0.95)', borderLeft: '1px solid rgba(255,255,255,0.1)', zIndex: 1000, boxShadow: '-10px 0 30px rgba(0,0,0,0.5)', padding: '2rem', display: 'flex', flexDirection: 'column', overflowY: 'auto', backdropFilter: 'blur(20px)', animation: 'slideIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>User Security Profile</h3>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(59,130,246,0.2)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {selectedUser.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.125rem' }}>{selectedUser.username}</h4>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{selectedUser.email}</div>
                <div style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.5rem', borderRadius: '4px', display: 'inline-block', marginTop: '0.25rem' }}>{selectedUser.department}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span style={{ color: 'var(--text-muted)' }}>Password Strength</span>
                 <strong style={{ color: getCategoryColor(selectedUser.category) }}>{selectedUser.category}</strong>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span style={{ color: 'var(--text-muted)' }}>zxcvbn Score</span>
                 <strong>{selectedUser.zxcvbnScore} / 4</strong>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span style={{ color: 'var(--text-muted)' }}>Crack Time Estimate</span>
                 <strong>{selectedUser.crackTime}</strong>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span style={{ color: 'var(--text-muted)' }}>Password Age</span>
                 <strong>{selectedUser.age} days</strong>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span style={{ color: 'var(--text-muted)' }}>Reused Password</span>
                 <strong style={{ color: selectedUser.reused ? '#ef4444' : '#10b981' }}>{selectedUser.reused ? 'Yes' : 'No'}</strong>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span style={{ color: 'var(--text-muted)' }}>Common Pattern</span>
                 <strong style={{ color: selectedUser.common ? '#ef4444' : '#10b981' }}>{selectedUser.common ? 'Yes' : 'No'}</strong>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <span style={{ color: 'var(--text-muted)' }}>Expired Password</span>
                 <strong style={{ color: selectedUser.expired ? '#ef4444' : '#10b981' }}>{selectedUser.expired ? 'Yes' : 'No'}</strong>
               </div>
            </div>

            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
               <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><Activity size={16} color="#3b82f6" /> Overall Risk Score</h4>
               <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: selectedUser.status === 'Critical' ? '#ef4444' : selectedUser.status === 'Warning' ? '#f59e0b' : '#10b981' }}>
                 {Math.max(10, 100 - selectedUser.score)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ 100</span>
               </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}><Bot size={16} color="#8b5cf6" /> AI Security Recommendations</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedUser.aiRecommendations.map((rec: string, i: number) => (
                  <div key={i} style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', borderLeft: '2px solid #8b5cf6', fontSize: '0.875rem', borderRadius: '4px' }}>
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}
