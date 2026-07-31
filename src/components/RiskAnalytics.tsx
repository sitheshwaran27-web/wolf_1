import React, { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import {
  BarChart2, AlertTriangle, ShieldAlert, Activity, RefreshCw, 
  Search, Filter, Download, ArrowUpRight, ArrowDownRight, Users,
  UserX, CheckCircle, FileText, ShieldCheck, Key, Clock
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import EmptyState from './EmptyState';

// --- MOCK DATA ---
const TREND_DATA = [
  { month: 'Jan', score: 65 }, { month: 'Feb', score: 68 }, { month: 'Mar', score: 72 },
  { month: 'Apr', score: 70 }, { month: 'May', score: 75 }, { month: 'Jun', score: 78 },
  { month: 'Jul', score: 82 }, { month: 'Aug', score: 80 }, { month: 'Sep', score: 85 },
  { month: 'Oct', score: 88 }, { month: 'Nov', score: 90 }, { month: 'Dec', score: 92 },
];

const DEPT_RISK_DATA = [
  { dept: 'IT', risk: 15 }, { dept: 'HR', risk: 65 }, { dept: 'Finance', risk: 35 },
  { dept: 'Sales', risk: 55 }, { dept: 'Admin', risk: 45 }
];

const AGE_PIE = [
  { name: '0-30 Days', value: 400, color: '#10b981' },
  { name: '31-90 Days', value: 300, color: '#3b82f6' },
  { name: '91-180 Days', value: 200, color: '#f59e0b' },
  { name: '180+ Days', value: 100, color: '#ef4444' },
];

const STRENGTH_PIE = [
  { name: 'Strong', value: 650, color: '#10b981' },
  { name: 'Medium', value: 250, color: '#f59e0b' },
  { name: 'Weak', value: 100, color: '#ef4444' },
];

const MFA_ADOPTION = [
  { name: 'Enabled', value: 850, color: '#10b981' },
  { name: 'Disabled', value: 150, color: '#ef4444' },
];

const HEATMAP_DATA = [
  { dept: 'IT', 'Critical': 0, 'High': 2, 'Medium': 8, 'Safe': 90 },
  { dept: 'HR', 'Critical': 5, 'High': 15, 'Medium': 30, 'Safe': 50 },
  { dept: 'Finance', 'Critical': 1, 'High': 5, 'Medium': 20, 'Safe': 74 },
  { dept: 'Sales', 'Critical': 8, 'High': 20, 'Medium': 35, 'Safe': 37 },
  { dept: 'Admin', 'Critical': 2, 'High': 8, 'Medium': 25, 'Safe': 65 },
];

const MOCK_USERS = Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  username: `user_${Math.random().toString(36).substring(7)}@company.com`,
  department: ['IT', 'HR', 'Finance', 'Sales', 'Admin'][Math.floor(Math.random() * 5)],
  strength: ['Weak', 'Medium', 'Strong'][Math.floor(Math.random() * 3)],
  reuse: Math.floor(Math.random() * 5),
  age: Math.floor(Math.random() * 365),
  mfa: Math.random() > 0.5,
  riskScore: Math.floor(Math.random() * 100),
}));

export default function RiskAnalytics() {
  const { dataImported } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatus = (score: number) => {
    if (score >= 80) return { label: 'Critical', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
    if (score >= 60) return { label: 'High', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' };
    if (score >= 40) return { label: 'Medium', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
    return { label: 'Safe', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
  };

  const filteredUsers = MOCK_USERS.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterDept === 'All' || u.department === filterDept)
  ).sort((a, b) => b.riskScore - a.riskScore);

  if (!dataImported) {
    return (
      <EmptyState 
        icon={<BarChart2 size={40} color="#f59e0b" />}
        headline="No Risk Assessment Available"
        description="Upload password audit data first to generate interactive risk graphs and vulnerability metrics."
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      {/* Top Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: 'white' }}>Risk Analytics Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Comprehensive view of organizational password security posture.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleRefresh}>
             <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} /> Refresh
          </button>
          <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <FileText size={16} /> PDF
          </button>
          <button className="btn" style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Download size={16} /> CSV
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Overall Security Score', value: '72/100', icon: ShieldCheck, color: '#3b82f6' },
          { label: 'High Risk Users', value: '124', icon: ShieldAlert, color: '#ef4444' },
          { label: 'Medium Risk Users', value: '342', icon: AlertTriangle, color: '#f59e0b' },
          { label: 'Low Risk Users', value: '850', icon: CheckCircle, color: '#10b981' },
          { label: 'Total Accounts', value: '1,316', icon: Users, color: '#8b5cf6' },
          { label: 'Password Reuse', value: '89', icon: Activity, color: '#f97316' },
          { label: 'Weak Passwords', value: '145', icon: Key, color: '#ef4444' },
          { label: 'Expired Passwords', value: '32', icon: Clock, color: '#eab308' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ padding: '0.75rem', background: `rgba(${parseInt(stat.color.slice(1,3),16)}, ${parseInt(stat.color.slice(3,5),16)}, ${parseInt(stat.color.slice(5,7),16)}, 0.1)`, borderRadius: '8px', color: stat.color }}>
               <stat.icon size={24} />
             </div>
             <div>
               <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.label}</div>
               <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stat.value}</div>
             </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        
        {/* Trend Line Chart */}
        <div className="glass-panel" style={{ gridColumn: 'span 2', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Organizational Security Trend (12 Months)</h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strength Pie */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Strength Distribution</h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={STRENGTH_PIE} cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="none" dataKey="value" paddingAngle={5}>
                  {STRENGTH_PIE.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dept Bar Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Department Risk Levels</h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPT_RISK_DATA} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} hide />
                <YAxis dataKey="dept" type="category" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} width={60} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
                <Bar dataKey="risk" radius={[0, 4, 4, 0]}>
                  {DEPT_RISK_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.risk > 60 ? '#ef4444' : entry.risk > 40 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Pie */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Password Age</h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={AGE_PIE} cx="50%" cy="50%" outerRadius={70} stroke="none" dataKey="value" labelLine={false}>
                  {AGE_PIE.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
            {AGE_PIE.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color }}></div> {d.name}
              </div>
            ))}
          </div>
        </div>
        
        {/* MFA Adoption */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>MFA Adoption Rate</h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={MFA_ADOPTION} cx="50%" cy="50%" innerRadius={50} outerRadius={70} stroke="none" dataKey="value">
                  {MFA_ADOPTION.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Heatmap Section */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Department Risk Heatmap (% of users)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.5rem' }}>
            <div style={{ width: '100px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Department</div>
            <div style={{ flex: 1, textAlign: 'center', color: '#10b981', fontSize: '0.75rem' }}>Safe (Green)</div>
            <div style={{ flex: 1, textAlign: 'center', color: '#eab308', fontSize: '0.75rem' }}>Medium (Yellow)</div>
            <div style={{ flex: 1, textAlign: 'center', color: '#f97316', fontSize: '0.75rem' }}>High (Orange)</div>
            <div style={{ flex: 1, textAlign: 'center', color: '#ef4444', fontSize: '0.75rem' }}>Critical (Red)</div>
          </div>
          {HEATMAP_DATA.map(row => (
            <div key={row.dept} style={{ display: 'flex', gap: '2px', height: '40px', alignItems: 'center' }}>
              <div style={{ width: '100px', fontSize: '0.875rem', fontWeight: 500 }}>{row.dept}</div>
              <div style={{ flex: 1, height: '100%', background: `rgba(16, 185, 129, ${row.Safe / 100})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{row.Safe}%</div>
              <div style={{ flex: 1, height: '100%', background: `rgba(234, 179, 8, ${row.Medium / 100})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{row.Medium}%</div>
              <div style={{ flex: 1, height: '100%', background: `rgba(249, 115, 22, ${row.High / 100})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{row.High}%</div>
              <div style={{ flex: 1, height: '100%', background: `rgba(239, 68, 68, ${row.Critical / 100})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{row.Critical}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', margin: 0 }}>Top High Risk Users</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.5rem 1rem', border: '1px solid var(--border-color)' }}>
              <Search size={16} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
              <input 
                type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '150px', fontSize: '0.875rem' }} 
              />
            </div>
            <select 
              value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '8px', padding: '0.5rem 1rem', outline: 'none', fontSize: '0.875rem' }}
            >
              <option value="All" style={{ background: '#0f172a' }}>All Departments</option>
              {['IT', 'HR', 'Finance', 'Sales', 'Admin'].map(d => <option key={d} value={d} style={{ background: '#0f172a' }}>{d}</option>)}
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem 0' }}>Username</th>
                <th style={{ padding: '1rem 0' }}>Department</th>
                <th style={{ padding: '1rem 0' }}>Strength</th>
                <th style={{ padding: '1rem 0' }}>Reuse</th>
                <th style={{ padding: '1rem 0' }}>Age</th>
                <th style={{ padding: '1rem 0' }}>MFA</th>
                <th style={{ padding: '1rem 0' }}>Risk Score</th>
                <th style={{ padding: '1rem 0' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const status = getStatus(user.riskScore);
                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.875rem' }}>
                    <td style={{ padding: '1rem 0', fontWeight: 500 }}>{user.username}</td>
                    <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{user.department}</td>
                    <td style={{ padding: '1rem 0' }}>
                      <span style={{ color: user.strength === 'Strong' ? '#10b981' : user.strength === 'Medium' ? '#f59e0b' : '#ef4444' }}>{user.strength}</span>
                    </td>
                    <td style={{ padding: '1rem 0' }}>{user.reuse > 0 ? <span style={{ color: '#ef4444' }}>{user.reuse}x</span> : 'No'}</td>
                    <td style={{ padding: '1rem 0' }}>{user.age} days</td>
                    <td style={{ padding: '1rem 0' }}>{user.mfa ? <span style={{ color: '#10b981' }}>Enabled</span> : <span style={{ color: '#ef4444' }}>Disabled</span>}</td>
                    <td style={{ padding: '1rem 0' }}>{user.riskScore}</td>
                    <td style={{ padding: '1rem 0' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, color: status.color, background: status.bg }}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>No high risk users found matching criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
