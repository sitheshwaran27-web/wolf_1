import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  HeartPulse, Users, ShieldAlert, Activity, CheckCircle2, AlertTriangle, Key, X, ChevronRight, Bot
} from 'lucide-react';
import zxcvbn from 'zxcvbn';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useData } from '../contexts/DataContext';
import EmptyState from './EmptyState';

// --- MOCK AD ENGINE ---
const DEPARTMENTS = ['IT', 'HR', 'Finance', 'Sales', 'Cyber Security', 'Operations'];
const COMMON_PASSWORDS = ['password123', 'admin', 'qwerty', '123456', 'welcome', 'letmein'];
const SAMPLE_PASSWORDS = [
  ...COMMON_PASSWORDS,
  'P@ssw0rd2024!', 'SuperSecret#99', 'correcthorsebatterystaple',
  'hello', 'Admin123', 'MyNameIsJohn', '1q2w3e4r5t6y',
  'Cyber@!Sec9000', 'finance_team', 'sales2023', 'operations123'
];

interface EmployeeData {
  id: string;
  name: string;
  department: string;
  passwordRaw: string;
  reused: boolean;
  expired: boolean;
  mfaDisabled: boolean;
  failedLogins: number;
  passwordAgeDays: number;
  
  // Calculated
  score: number;
  riskLevel: string;
  riskColor: string;
  strength: string;
  aiRecommendation: string;
  hasWeak: boolean;
}

const generateMockAD = (): EmployeeData[] => {
  const employees: EmployeeData[] = [];
  const passwordTracker: Record<string, number> = {};

  // First pass: Generate raw users
  for (let i = 1; i <= 500; i++) {
    const pwd = SAMPLE_PASSWORDS[Math.floor(Math.random() * SAMPLE_PASSWORDS.length)];
    passwordTracker[pwd] = (passwordTracker[pwd] || 0) + 1;

    employees.push({
      id: `EMP-${i}`,
      name: `Employee ${i}`,
      department: DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)],
      passwordRaw: pwd,
      reused: false,
      expired: Math.random() > 0.85,
      mfaDisabled: Math.random() > 0.7,
      failedLogins: Math.floor(Math.random() * 15), // 0 to 14
      passwordAgeDays: Math.floor(Math.random() * 400),
      
      score: 100,
      riskLevel: '',
      riskColor: '',
      strength: '',
      aiRecommendation: '',
      hasWeak: false
    });
  }

  // Second pass: Calculate intelligent score
  employees.forEach(emp => {
    let score = 100;
    const pwd = emp.passwordRaw;

    // Length
    if (pwd.length < 8) score -= 30;
    else if (pwd.length >= 8 && pwd.length <= 11) score -= 15;
    else if (pwd.length >= 12 && pwd.length <= 15) score -= 5;

    // Complexity
    if (!/[A-Z]/.test(pwd)) score -= 10;
    if (!/[a-z]/.test(pwd)) score -= 10;
    if (!/[0-9]/.test(pwd)) score -= 10;
    if (!/[^A-Za-z0-9]/.test(pwd)) score -= 15;

    // Dictionary
    if (COMMON_PASSWORDS.includes(pwd.toLowerCase())) score -= 35;

    // Reuse
    if (passwordTracker[pwd] > 1) {
      score -= 25;
      emp.reused = true;
    }

    // Expired
    if (emp.expired) score -= 20;

    // MFA
    if (emp.mfaDisabled) score -= 15;

    // Failed Logins
    if (emp.failedLogins >= 3 && emp.failedLogins <= 5) score -= 5;
    else if (emp.failedLogins >= 6 && emp.failedLogins <= 10) score -= 10;
    else if (emp.failedLogins > 10) score -= 20;

    // Age
    if (emp.passwordAgeDays >= 90 && emp.passwordAgeDays <= 180) score -= 5;
    else if (emp.passwordAgeDays > 180 && emp.passwordAgeDays <= 365) score -= 10;
    else if (emp.passwordAgeDays > 365) score -= 20;

    // zxcvbn Strength
    const zResult = zxcvbn(pwd);
    if (zResult.score === 0) { score -= 40; emp.strength = 'Very Weak'; }
    else if (zResult.score === 1) { score -= 25; emp.strength = 'Weak'; }
    else if (zResult.score === 2) { score -= 10; emp.strength = 'Medium'; }
    else if (zResult.score === 3) { score -= 0; emp.strength = 'Strong'; }
    else if (zResult.score === 4) { score += 5; emp.strength = 'Very Strong'; }

    // Clamp score
    emp.score = Math.max(0, Math.min(100, score));

    // Risk Level & Color
    if (emp.score >= 95) { emp.riskLevel = 'Excellent'; emp.riskColor = '#10b981'; } // Green
    else if (emp.score >= 80) { emp.riskLevel = 'Good'; emp.riskColor = '#3b82f6'; } // Blue
    else if (emp.score >= 60) { emp.riskLevel = 'Medium'; emp.riskColor = '#eab308'; } // Yellow
    else if (emp.score >= 40) { emp.riskLevel = 'High'; emp.riskColor = '#f97316'; } // Orange
    else { emp.riskLevel = 'Critical'; emp.riskColor = '#ef4444'; } // Red

    emp.hasWeak = emp.strength === 'Very Weak' || emp.strength === 'Weak' || COMMON_PASSWORDS.includes(pwd.toLowerCase());

    // AI Recommendation
    if (emp.score <= 39) emp.aiRecommendation = "Immediate account lockout required. Force reset.";
    else if (emp.mfaDisabled) emp.aiRecommendation = "Enable MFA immediately.";
    else if (COMMON_PASSWORDS.includes(pwd.toLowerCase())) emp.aiRecommendation = "Dictionary word detected. Reset password immediately.";
    else if (emp.passwordAgeDays > 365) emp.aiRecommendation = "Password too old. Enforce 90-day rotation.";
    else if (emp.reused) emp.aiRecommendation = "Credential reuse detected. Generate a unique password.";
    else if (emp.score >= 95) emp.aiRecommendation = "Password already meets enterprise policy.";
    else emp.aiRecommendation = "Generate a stronger password.";
  });

  return employees;
};

// --- AI JSON GENERATOR ---
const generateAIRecommendations = (emp: EmployeeData) => {
  let priority = 'Low';
  if (emp.score < 40) priority = 'Critical';
  else if (emp.score < 60) priority = 'High';
  else if (emp.score < 80) priority = 'Medium';

  let riskSummary = `This account has a ${priority.toUpperCase()} security risk due to `;
  const reasons = [];
  if (emp.reused) reasons.push('password reuse');
  if (emp.hasWeak) reasons.push('weak password complexity');
  if (emp.mfaDisabled) reasons.push('disabled MFA');
  if (emp.expired) reasons.push('an expired password');
  if (reasons.length === 0) riskSummary = 'This account maintains an excellent security posture and complies with enterprise policies.';
  else riskSummary += reasons.join(', ') + '.';

  let personalizedRec = emp.aiRecommendation;
  if (emp.score < 60 && emp.mfaDisabled && emp.hasWeak) {
    personalizedRec = 'Replace your current password with a unique enterprise-grade password and enable Multi-Factor Authentication immediately.';
  }

  let deptRec = '';
  switch(emp.department) {
    case 'Finance': deptRec = 'Finance employees should enable MFA and review privileged account access every 90 days.'; break;
    case 'HR': deptRec = 'Protect employee records using stronger authentication methods and unique passwords.'; break;
    case 'Engineering': deptRec = 'Use enterprise password managers for development and cloud accounts.'; break;
    case 'Sales': deptRec = 'Secure CRM and customer portals with mandatory Multi-Factor Authentication.'; break;
    case 'IT': deptRec = 'Review privileged accounts and rotate admin credentials every 90 days.'; break;
    default: deptRec = 'Ensure adherence to the baseline corporate security policies.';
  }

  let positiveFeedback = '';
  if (emp.score >= 80) positiveFeedback = 'Excellent password hygiene. Continue following your organization\'s security policies.';
  else if (!emp.reused && !emp.hasWeak) positiveFeedback = 'Your password complexity is strong, but other factors need attention.';

  const actionItems = [];
  if (emp.score < 80) actionItems.push("Reset your password immediately");
  if (emp.mfaDisabled) actionItems.push("Enable Multi-Factor Authentication");
  if (emp.reused) actionItems.push("Avoid password reuse across multiple accounts");
  if (emp.failedLogins > 5) actionItems.push("Review recent login activity for unauthorized access");
  actionItems.push("Enroll in a corporate password manager");
  actionItems.push("Complete Q3 Security Awareness Training");

  return {
    priority,
    risk_summary: riskSummary,
    personalized_recommendation: personalizedRec,
    department_recommendation: deptRec,
    positive_feedback: positiveFeedback,
    action_items: actionItems.slice(0, 5)
  };
};

// UI COMPONENT
export default function HealthEngine() {
  const { dataImported } = useData();
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [avgScore, setAvgScore] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);
  const [completedActions, setCompletedActions] = useState<number[]>([]);

  // Stats
  const [stats, setStats] = useState({
    weak: 0, expired: 0, reused: 0, mfaDisabled: 0, highRisk: 0,
    highestRisk: null as EmployeeData | null,
    lowestRisk: null as EmployeeData | null,
  });

  const generateData = () => {
    setAvgScore(0);
    const data = generateMockAD();
    
    // Sort by lowest score first for the leaderboard
    data.sort((a, b) => a.score - b.score);
    setEmployees(data);

    let totalScore = 0;
    let weak = 0, expired = 0, reused = 0, mfaDisabled = 0, highRisk = 0;

    data.forEach(emp => {
      totalScore += emp.score;
      if (emp.hasWeak) weak++;
      if (emp.expired) expired++;
      if (emp.reused) reused++;
      if (emp.mfaDisabled) mfaDisabled++;
      if (emp.riskLevel === 'High' || emp.riskLevel === 'Critical') highRisk++;
    });

    const average = Math.floor(totalScore / data.length);
    setTimeout(() => setAvgScore(average), 300);

    setStats({
      weak, expired, reused, mfaDisabled, highRisk,
      highestRisk: data[0],
      lowestRisk: data[data.length - 1]
    });
  };

  useEffect(() => {
    generateData();
  }, []);

  const handleExportPDF = async () => {
    const input = document.getElementById('health-dashboard-content');
    if (!input) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(input, { scale: 2, useCORS: true, backgroundColor: '#05050A' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Password_Health_Report.pdf');
    } catch (error) {
      console.error("Error generating PDF", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Chart Data Prep
  const deptData = DEPARTMENTS.map(dept => {
    const deptEmps = employees.filter(e => e.department === dept);
    const avg = deptEmps.length ? Math.floor(deptEmps.reduce((a, b) => a + b.score, 0) / deptEmps.length) : 0;
    return { name: dept, score: avg };
  });

  const riskDistData = [
    { name: 'Excellent', value: employees.filter(e => e.riskLevel === 'Excellent').length, color: '#10b981' },
    { name: 'Good', value: employees.filter(e => e.riskLevel === 'Good').length, color: '#3b82f6' },
    { name: 'Medium', value: employees.filter(e => e.riskLevel === 'Medium').length, color: '#eab308' },
    { name: 'High', value: employees.filter(e => e.riskLevel === 'High').length, color: '#f97316' },
    { name: 'Critical', value: employees.filter(e => e.riskLevel === 'Critical').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const trendData = [
    { month: 'Mar', avg: 45 }, { month: 'Apr', avg: 50 }, { month: 'May', avg: 48 },
    { month: 'Jun', avg: 55 }, { month: 'Jul', avg: 60 }, { month: 'Aug (Now)', avg: avgScore }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 95) return '#10b981';
    if (score >= 80) return '#3b82f6';
    if (score >= 60) return '#eab308';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };
  const gaugeColor = getScoreColor(avgScore);

  if (!dataImported) {
    return (
      <EmptyState 
        icon={<HeartPulse size={40} color="#ef4444" />}
        headline="Awaiting Analysis"
        description="Import your organization's password audit CSV to calculate individual Employee Password Health Scores."
      />
    );
  }

  return (
    <div id="health-dashboard-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <HeartPulse size={28} color="#ef4444" />
            Password Health Score Engine
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Enterprise-grade algorithmic credential scoring via Mock AD mapping.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }} data-html2canvas-ignore="true">
          <button 
            onClick={handleExportPDF} 
            disabled={isExporting}
            style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', cursor: isExporting ? 'not-allowed' : 'pointer' }}
          >
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
          <button onClick={generateData} style={{ padding: '0.5rem 1rem', background: 'var(--primary)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontWeight: 500 }}>Re-Calculate AD</button>
        </div>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Animated Gauge */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', color: 'var(--text-muted)' }}>Organization Average</h3>
          <div style={{ position: 'relative', width: '200px', height: '200px' }}>
            <svg width="200" height="200" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={gaugeColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="283"
                initial={{ strokeDashoffset: 283 }}
                animate={{ strokeDashoffset: 283 - (283 * avgScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <motion.span 
                initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
                style={{ fontSize: '3rem', fontWeight: 700, color: gaugeColor }}
              >
                {avgScore}
              </motion.span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Score</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#fca5a5', marginBottom: '0.25rem' }}>Highest Risk Employee</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ef4444' }}>{stats.highestRisk?.name || 'N/A'}</div>
              <div style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '0.25rem' }}>Score: {stats.highestRisk?.score} • {stats.highestRisk?.department}</div>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#6ee7b7', marginBottom: '0.25rem' }}>Lowest Risk Employee</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#10b981' }}>{stats.lowestRisk?.name || 'N/A'}</div>
              <div style={{ fontSize: '0.75rem', color: '#6ee7b7', marginTop: '0.25rem' }}>Score: {stats.lowestRisk?.score} • {stats.lowestRisk?.department}</div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginTop: 'auto' }}>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{stats.weak}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Weak Passwords</div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{stats.reused}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Reused Passwords</div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{stats.expired}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Expired</div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{stats.mfaDisabled}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MFA Disabled</div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444' }}>{stats.highRisk}</div>
              <div style={{ fontSize: '0.7rem', color: '#fca5a5' }}>High Risk Accts</div>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
        
        {/* Trend */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem' }}><Activity size={16} style={{display:'inline', marginRight:'8px'}} color="#3b82f6" /> Security Trend</h3>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <RechartsTooltip contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dept Bar */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem' }}><Users size={16} style={{display:'inline', marginRight:'8px'}} color="#10b981" /> Dept Health Score</h3>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <RechartsTooltip contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem' }}><AlertTriangle size={16} style={{display:'inline', marginRight:'8px'}} color="#f59e0b" /> Risk Distribution</h3>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDistData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {riskDistData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* LEADERBOARD TABLE */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Employee Leaderboard</h3>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Showing lowest scores first (Top 50)</span>
        </div>
        
        <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#0f172a', zIndex: 10 }}>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Employee</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Score</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Level</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Vulnerabilities</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>AI Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {employees.slice(0, 50).map((emp) => (
                <tr 
                  key={emp.id} 
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }} 
                  className="hover:bg-white hover:bg-opacity-5 transition-colors"
                  onClick={() => {
                    setSelectedEmployee(emp);
                    setCompletedActions([]);
                  }}
                >
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{emp.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.department}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '1.25rem', fontWeight: 700, color: emp.riskColor }}>
                    {emp.score}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: `${emp.riskColor}20`, color: emp.riskColor }}>
                      {emp.riskLevel}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {emp.expired && <span title="Expired Password" style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '0.7rem' }}>Expired</span>}
                      {emp.reused && <span title="Reused Password" style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontSize: '0.7rem' }}>Reused</span>}
                      {emp.mfaDisabled && <span title="MFA Disabled" style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '0.7rem' }}>No MFA</span>}
                      {emp.hasWeak && <span title="Weak Password" style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '0.7rem' }}>Weak</span>}
                      {(!emp.expired && !emp.reused && !emp.mfaDisabled && !emp.hasWeak) && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None</span>}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: emp.score >= 80 ? '#10b981' : '#fca5a5' }}>
                    {emp.aiRecommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* AI ADVISOR MODAL */}
      <AnimatePresence>
        {selectedEmployee && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}
            onClick={() => setSelectedEmployee(null)}
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ width: '100%', maxWidth: '600px', background: '#0a0a0f', borderLeft: '1px solid rgba(255,255,255,0.1)', padding: '2rem', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              {(() => {
                const aiData = generateAIRecommendations(selectedEmployee);
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', position: 'sticky', top: '-2rem', background: 'rgba(10, 10, 15, 0.95)', backdropFilter: 'blur(10px)', margin: '-2rem -2rem 2rem -2rem', padding: '2rem 2rem 1rem 2rem', zIndex: 20, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <Bot size={20} color="#8b5cf6" />
                          <span style={{ color: '#8b5cf6', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '1px', textTransform: 'uppercase' }}>AI Security Advisor</span>
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.75rem' }}>{selectedEmployee.name}</h2>
                        <div style={{ color: 'var(--text-muted)' }}>{selectedEmployee.department} • {selectedEmployee.id}</div>
                      </div>
                      <button onClick={() => setSelectedEmployee(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={20} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Security Score</span>
                        <span style={{ fontWeight: 700, color: selectedEmployee.riskColor }}>{selectedEmployee.score}/100</span>
                      </div>
                      <div style={{ background: `${selectedEmployee.riskColor}20`, padding: '0.5rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: selectedEmployee.riskColor, opacity: 0.8 }}>Risk Level</span>
                        <span style={{ fontWeight: 700, color: selectedEmployee.riskColor }}>{selectedEmployee.riskLevel}</span>
                      </div>
                      <div style={{ background: aiData.priority === 'Critical' ? '#ef444420' : aiData.priority === 'High' ? '#f9731620' : aiData.priority === 'Medium' ? '#eab30820' : '#10b98120', padding: '0.5rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Priority</span>
                        <span style={{ fontWeight: 700, color: aiData.priority === 'Critical' ? '#ef4444' : aiData.priority === 'High' ? '#f97316' : aiData.priority === 'Medium' ? '#eab308' : '#10b981' }}>{aiData.priority}</span>
                      </div>
                    </div>

                    <div style={{ background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.02) 100%)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#a78bfa', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Risk Summary</h4>
                      <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.5, color: 'white' }}>{aiData.risk_summary}</p>
                      {aiData.positive_feedback && (
                        <p style={{ margin: '1rem 0 0 0', fontSize: '0.875rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CheckCircle2 size={16} /> {aiData.positive_feedback}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Personalized Recommendation</h4>
                        <p style={{ margin: 0, fontSize: '1rem', color: 'white' }}>{aiData.personalized_recommendation}</p>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Department Specific ({selectedEmployee.department})</h4>
                        <p style={{ margin: 0, fontSize: '1rem', color: 'white' }}>{aiData.department_recommendation}</p>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Prioritized Action Checklist</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {aiData.action_items.map((item, idx) => {
                        const isCompleted = completedActions.includes(idx);
                        return (
                          <div 
                            key={idx} 
                            onClick={() => {
                              if (isCompleted) {
                                setCompletedActions(completedActions.filter(i => i !== idx));
                              } else {
                                setCompletedActions([...completedActions, idx]);
                              }
                            }}
                            style={{ 
                              display: 'flex', alignItems: 'flex-start', gap: '1rem', 
                              background: isCompleted ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)', 
                              padding: '1rem', borderRadius: '8px', 
                              border: isCompleted ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255,255,255,0.05)',
                              cursor: 'pointer', transition: 'all 0.2s ease',
                              opacity: isCompleted ? 0.6 : 1
                            }}
                          >
                            <div style={{ marginTop: '0.125rem' }}>
                              {isCompleted ? <CheckCircle2 size={18} color="#10b981" /> : <ChevronRight size={18} color="#8b5cf6" />}
                            </div>
                            <div style={{ fontSize: '0.95rem', textDecoration: isCompleted ? 'line-through' : 'none' }}>{item}</div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
