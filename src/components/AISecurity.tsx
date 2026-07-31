import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  AlertTriangle, ShieldAlert, Bot, TrendingUp, Users, Clock, Key,
  CheckCircle2, ArrowUpRight, ArrowDownRight, Activity, Zap
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useData } from '../contexts/DataContext';
import EmptyState from './EmptyState';

// --- MOCK DATA ---
const DEPARTMENTS = ['IT', 'HR', 'Finance', 'Sales', 'Cyber Security', 'Operations'];
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Generate 1000 Users
const generateMockUsers = () => {
  const users = [];
  for (let i = 1; i <= 1000; i++) {
    const dept = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
    const isCyber = dept === 'Cyber Security';
    
    // Base risk calculation
    const currentRisk = isCyber ? Math.random() * 30 : Math.random() * 100;
    
    let currentRiskLabel = 'Low';
    if (currentRisk > 30) currentRiskLabel = 'Medium';
    if (currentRisk > 60) currentRiskLabel = 'High';
    if (currentRisk > 80) currentRiskLabel = 'Critical';

    // Prediction logic (Simulated AI)
    let predictedRisk = currentRisk + (Math.random() * 40 - 15); // fluctuates -15 to +25
    if (predictedRisk > 100) predictedRisk = 100;
    if (predictedRisk < 0) predictedRisk = 0;

    let predictedRiskLabel = 'Low';
    if (predictedRisk > 30) predictedRiskLabel = 'Medium';
    if (predictedRisk > 60) predictedRiskLabel = 'High';
    if (predictedRisk > 80) predictedRiskLabel = 'Critical';

    const confidence = Math.floor(Math.random() * 20 + 80); // 80% - 99%

    const reasons = [
      'Password reused on multiple accounts.',
      'Approaching 90-day expiry limit.',
      'MFA disabled and weak password.',
      'Common dictionary word detected.',
      'Sequential keyboard pattern detected.'
    ];

    const recommendations = [
      'Use a unique password and enable MFA.',
      'Force password reset immediately.',
      'Train user on security awareness.',
      'Enforce strict password policy.'
    ];

    users.push({
      id: `USR-${i}`,
      username: `user${i}@acme.com`,
      department: dept,
      currentRiskScore: currentRisk,
      currentRisk: currentRiskLabel,
      predictedRiskScore: predictedRisk,
      predictedRisk: predictedRiskLabel,
      confidence: confidence,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      recommendation: recommendations[Math.floor(Math.random() * recommendations.length)]
    });
  }
  return users;
};

// Trend Mock Data (6 months past, current, 6 months future)
const trendData = [
  { month: 'Jan', risk: 65 }, { month: 'Feb', risk: 62 }, { month: 'Mar', risk: 58 },
  { month: 'Apr', risk: 60 }, { month: 'May', risk: 55 }, { month: 'Jun', risk: 50 },
  { month: 'Jul (Now)', risk: 48 },
  { month: 'Aug', risk: 45, predicted: true }, { month: 'Sep', risk: 42, predicted: true },
  { month: 'Oct', risk: 38, predicted: true }, { month: 'Nov', risk: 35, predicted: true },
  { month: 'Dec', risk: 30, predicted: true }
];

const deptForecastData = DEPARTMENTS.map(dept => ({
  name: dept,
  low: Math.floor(Math.random() * 50 + 20),
  medium: Math.floor(Math.random() * 40 + 10),
  high: Math.floor(Math.random() * 20 + 5),
  critical: dept === 'Cyber Security' ? 0 : Math.floor(Math.random() * 10)
}));

const riskDistributionData = [
  { name: 'Low', value: 450, color: '#10b981' },
  { name: 'Medium', value: 300, color: '#f59e0b' },
  { name: 'High', value: 150, color: '#ef4444' },
  { name: 'Critical', value: 100, color: '#7f1d1d' },
];

const radarData = [
  { subject: 'Password Strength', A: 30, fullMark: 30 },
  { subject: 'Password Reuse', A: 20, fullMark: 20 },
  { subject: 'Password Age', A: 20, fullMark: 20 },
  { subject: 'Common Password', A: 15, fullMark: 15 },
  { subject: 'MFA Status', A: 10, fullMark: 10 },
  { subject: 'Policy Compliance', A: 5, fullMark: 5 },
];

const healthForecastData = [
  { day: 'Day 1', weak: 150, medium: 300, strong: 550 },
  { day: 'Day 30', weak: 120, medium: 280, strong: 600 },
  { day: 'Day 60', weak: 90, medium: 250, strong: 660 },
  { day: 'Day 90', weak: 50, medium: 200, strong: 750 },
];


export default function AIRiskPrediction() {
  const { dataImported } = useData();
  const [users, setUsers] = useState<any[]>([]);
  const [highRiskUsers, setHighRiskUsers] = useState<any[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    const input = document.getElementById('ai-dashboard-content');
    if (!input) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(input, { scale: 2, useCORS: true, backgroundColor: '#05050A' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('AI_Risk_Prediction_Report.pdf');
    } catch (error) {
      console.error("Error generating PDF", error);
    } finally {
      setIsExporting(false);
    }
  };

  const regenerateData = () => {
    setOverallScore(0); // Reset for animation
    const mockUsers = generateMockUsers();
    setUsers(mockUsers);
    
    const highRisk = mockUsers.filter(u => u.predictedRisk === 'High' || u.predictedRisk === 'Critical');
    setHighRiskUsers(highRisk.sort((a, b) => b.predictedRiskScore - a.predictedRiskScore).slice(0, 10));

    // Calculate AI Score (inverse of average risk)
    const avgRisk = mockUsers.reduce((acc, u) => acc + u.currentRiskScore, 0) / mockUsers.length;
    setTimeout(() => setOverallScore(Math.floor(100 - avgRisk)), 500); // Delay for animation
  };

  useEffect(() => {
    regenerateData();
  }, []);

  const getScoreColor = (score: number) => {
    if (score < 40) return '#ef4444'; // Red
    if (score < 70) return '#f59e0b'; // Yellow
    return '#10b981'; // Green
  };

  const scoreColor = getScoreColor(overallScore);

  if (!dataImported) {
    return (
      <EmptyState 
        icon={<Bot size={40} color="#8b5cf6" />}
        headline="AI Assistant Waiting"
        description="Import employee password data to generate personalized AI-driven security recommendations and risk forecasts."
      />
    );
  }

  return (
    <div id="ai-dashboard-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bot size={28} color="#8b5cf6" />
            AI Risk Prediction
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Predictive cybersecurity analytics based on 1000 simulated users.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }} data-html2canvas-ignore="true">
          <button 
            onClick={handleExportPDF} 
            disabled={isExporting}
            style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', cursor: isExporting ? 'not-allowed' : 'pointer', opacity: isExporting ? 0.5 : 1 }}
          >
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
          <button onClick={regenerateData} style={{ padding: '0.5rem 1rem', background: 'var(--primary)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontWeight: 500 }}>Run New AI Audit</button>
        </div>
      </div>

      {/* TOP AI SUMMARY PANEL */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Animated Score Ring */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem', color: 'var(--text-muted)' }}>AI Security Score</h3>
          <div style={{ position: 'relative', width: '200px', height: '200px' }}>
            <svg width="200" height="200" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="283"
                initial={{ strokeDashoffset: 283 }}
                animate={{ strokeDashoffset: 283 - (283 * overallScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <motion.span 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                style={{ fontSize: '3rem', fontWeight: 700, color: scoreColor }}
              >
                {overallScore}
              </motion.span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>out of 100</span>
            </div>
          </div>
          <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Overall security posture is <strong style={{ color: scoreColor }}>{overallScore >= 70 ? 'Strong' : 'Moderate'}</strong>. Predicted to improve by 12% next quarter.
          </p>
        </div>

        {/* AI Security Advisor Panel */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={20} color="#8b5cf6" /> AI Security Advisor
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Top 3 Immediate Recommendations</h4>
              <ul style={{ margin: 0, padding: '0 0 0 1.2rem', color: 'white', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                <li>Increase minimum password length to 12 characters.</li>
                <li>Enable MFA for 28 High-Risk users immediately.</li>
                <li>Remove reused passwords across 12 operations accounts.</li>
              </ul>
            </div>
            <div>
               <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Department Intel</h4>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                   <span>Most Vulnerable</span> <strong style={{ color: '#ef4444' }}>Sales</strong>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                   <span>Most Secure</span> <strong style={{ color: '#10b981' }}>Cyber Security</strong>
                 </div>
               </div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>142</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Predicted High Risk</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>85</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expiring Soon</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>412</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MFA Disabled</div>
            </div>
          </div>
        </div>
      </div>

      {/* PREDICTIVE ALERTS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ padding: '1.25rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', display: 'flex', gap: '1rem' }}>
          <ShieldAlert size={24} color="#ef4444" />
          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: '#ef4444', fontSize: '1rem' }}>Critical Prediction</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}>25 users may have expired passwords within 7 days. Action required.</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ padding: '1.25rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', display: 'flex', gap: '1rem' }}>
          <AlertTriangle size={24} color="#f59e0b" />
          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: '#f59e0b', fontSize: '1rem' }}>Warning Forecast</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}>Password reuse across departments is predicted to increase by 18%.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ padding: '1.25rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', display: 'flex', gap: '1rem' }}>
          <TrendingUp size={24} color="#3b82f6" />
          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', color: '#3b82f6', fontSize: '1rem' }}>Positive Trend</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}>Overall password health improved by 12% in the last 30 days.</p>
          </div>
        </motion.div>
      </div>

      {/* CHARTS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Risk Trend */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="#8b5cf6" /> AI Risk Trend (Historical & Predicted)
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: 'white' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="risk" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} 
                  activeDot={{ r: 6, fill: '#10b981' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Forecast */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} color="#8b5cf6" /> Department Risk Forecast
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptForecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="low" stackId="a" fill="#10b981" name="Low Risk" radius={[0, 0, 4, 4]} />
                <Bar dataKey="medium" stackId="a" fill="#f59e0b" name="Medium Risk" />
                <Bar dataKey="high" stackId="a" fill="#ef4444" name="High Risk" />
                <Bar dataKey="critical" stackId="a" fill="#7f1d1d" name="Critical Risk" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart for Algorithm Factors */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} color="#8b5cf6" /> AI Scoring Algorithm Weights
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 30]} tick={false} axisLine={false} />
                <Radar name="Weight (%)" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                <RechartsTooltip 
                  contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Pie */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="#8b5cf6" /> Predicted Risk Distribution
          </h3>
          <div style={{ height: '300px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  itemStyle={{ color: 'white' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700 }}>1000</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Users</span>
            </div>
          </div>
        </div>

      </div>

      {/* HIGH RISK USERS TABLE */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Predicted High Risk Users</h3>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Showing top {highRiskUsers.length} critical predictions</span>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Username</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Department</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Current Risk</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Predicted Risk</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Confidence</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Reason & Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {highRiskUsers.map((user, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={user.id} 
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  className="hover:bg-white hover:bg-opacity-5 transition-colors"
                >
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>{user.username}</td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user.department}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      background: user.currentRisk === 'Low' ? 'rgba(16, 185, 129, 0.1)' : user.currentRisk === 'Medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: user.currentRisk === 'Low' ? '#10b981' : user.currentRisk === 'Medium' ? '#f59e0b' : '#ef4444'
                    }}>
                      {user.currentRisk}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '20px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        background: user.predictedRisk === 'Critical' ? 'rgba(127, 29, 29, 0.3)' : 'rgba(239, 68, 68, 0.1)',
                        color: user.predictedRisk === 'Critical' ? '#fca5a5' : '#ef4444'
                      }}>
                        {user.predictedRisk}
                      </span>
                      {user.predictedRiskScore > user.currentRiskScore ? <ArrowUpRight size={16} color="#ef4444" /> : <ArrowDownRight size={16} color="#10b981" />}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${user.confidence}%`, height: '100%', background: '#8b5cf6' }}></div>
                      </div>
                      <span style={{ color: 'var(--text-muted)' }}>{user.confidence}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                    <div style={{ color: '#ef4444', marginBottom: '0.25rem', fontWeight: 500 }}>{user.reason}</div>
                    <div style={{ color: '#10b981' }}>{user.recommendation}</div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
