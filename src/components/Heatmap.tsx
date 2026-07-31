import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  Users, Briefcase, Code, Monitor, ShieldCheck, Megaphone, 
  TrendingUp, Settings, LifeBuoy, Scale, Building, X, Search, Filter as FilterIcon, Download,
  Grid
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import EmptyState from './EmptyState';

// --- DEPARTMENTS & ICONS ---
const DEPT_MAP = [
  { name: 'Human Resources', icon: Users },
  { name: 'Finance', icon: TrendingUp },
  { name: 'Engineering', icon: Code },
  { name: 'IT', icon: Monitor },
  { name: 'Security', icon: ShieldCheck },
  { name: 'Marketing', icon: Megaphone },
  { name: 'Sales', icon: Briefcase },
  { name: 'Operations', icon: Settings },
  { name: 'Support', icon: LifeBuoy },
  { name: 'Legal', icon: Scale },
  { name: 'Management', icon: Building },
];

const HEATMAP_COLORS = {
  Excellent: '#064e3b', // Dark Green
  Good: '#15803d',      // Green
  Moderate: '#ca8a04',  // Yellow
  HighRisk: '#ea580c',  // Orange
  Critical: '#b91c1c'   // Red
};

// --- MOCK DATA GENERATOR ---
const generateHeatmapData = () => {
  return DEPT_MAP.map(dept => {
    const isSecurity = dept.name === 'Security' || dept.name === 'Engineering';
    const score = isSecurity ? Math.floor(Math.random() * 20 + 80) : Math.floor(Math.random() * 60 + 30);
    const totalEmps = Math.floor(Math.random() * 200 + 50);
    
    let risk = 'Moderate';
    let color = HEATMAP_COLORS.Moderate;
    if (score >= 95) { risk = 'Excellent'; color = HEATMAP_COLORS.Excellent; }
    else if (score >= 80) { risk = 'Good'; color = HEATMAP_COLORS.Good; }
    else if (score >= 60) { risk = 'Moderate'; color = HEATMAP_COLORS.Moderate; }
    else if (score >= 40) { risk = 'High Risk'; color = HEATMAP_COLORS.HighRisk; }
    else { risk = 'Critical'; color = HEATMAP_COLORS.Critical; }

    return {
      ...dept,
      score,
      risk,
      color,
      totalEmps,
      weak: Math.floor(totalEmps * (Math.random() * 0.4)),
      strong: Math.floor(totalEmps * (Math.random() * 0.5)),
      reused: Math.floor(totalEmps * (Math.random() * 0.3)),
      expired: Math.floor(totalEmps * (Math.random() * 0.2)),
      mfaDisabled: Math.floor(totalEmps * (Math.random() * 0.5)),
      failedLogins: Math.floor(Math.random() * 50),
      avgAge: Math.floor(Math.random() * 200 + 30),
      aiInsight: score < 50 ? 'Immediate MFA enforcement required.' : 'Department is compliant with policies.'
    };
  });
};

const mockDepartments = generateHeatmapData();

export default function Heatmap() {
  const { dataImported } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Highest Risk');
  const [selectedDept, setSelectedDept] = useState<any | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    const input = document.getElementById('dept-report-content');
    if (!input) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(input, { scale: 2, useCORS: true, backgroundColor: '#0a0a0f' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${selectedDept?.name || 'Department'}_Security_Report.pdf`);
    } catch (error) {
      console.error("Error generating PDF", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Compute filtered & sorted
  const filteredDepts = useMemo(() => {
    let result = mockDepartments.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (sortBy === 'Highest Risk') result.sort((a, b) => a.score - b.score);
    if (sortBy === 'Lowest Risk') result.sort((a, b) => b.score - a.score);
    if (sortBy === 'Most Weak Passwords') result.sort((a, b) => b.weak - a.weak);
    if (sortBy === 'Alphabetical') result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [searchTerm, sortBy]);

  // Summary Metrics
  const totalDepts = mockDepartments.length;
  const healthy = mockDepartments.filter(d => d.score >= 80).length;
  const highRisk = mockDepartments.filter(d => d.score >= 40 && d.score < 60).length;
  const critical = mockDepartments.filter(d => d.score < 40).length;
  const orgScore = Math.floor(mockDepartments.reduce((acc, d) => acc + d.score, 0) / totalDepts);

  if (!dataImported) {
    return (
      <EmptyState 
        icon={<Grid size={40} color="#10b981" />}
        headline="No Department Analysis Yet"
        description="Import your Active Directory CSV to visualize department security scores and AI insights."
      />
    );
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Department Security Heatmap</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Enterprise SOC Overview of organizational password health.</p>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Organization Score</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6' }}>{orgScore}/100</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Departments</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'white' }}>{totalDepts}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Healthy</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>{healthy}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #f97316' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>High Risk</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f97316' }}>{highRisk}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Critical</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444' }}>{critical}</div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search departments..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <FilterIcon size={16} color="var(--text-muted)" />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', cursor: 'pointer' }}
          >
            <option style={{ background: '#0f172a' }}>Highest Risk</option>
            <option style={{ background: '#0f172a' }}>Lowest Risk</option>
            <option style={{ background: '#0f172a' }}>Most Weak Passwords</option>
            <option style={{ background: '#0f172a' }}>Alphabetical</option>
          </select>
        </div>
      </div>

      {/* GRID LAYOUT */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '1.5rem' 
      }}>
        <AnimatePresence>
          {filteredDepts.map((dept, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              key={dept.name}
              className="glass-panel group"
              onClick={() => setSelectedDept(dept)}
              style={{ 
                position: 'relative', 
                padding: '1.5rem', 
                cursor: 'pointer',
                background: `linear-gradient(145deg, rgba(255,255,255,0.03) 0%, ${dept.color}20 100%)`,
                border: `1px solid ${dept.color}40`,
                overflow: 'visible'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                    <dept.icon size={20} color="white" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{dept.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dept.totalEmps} Employees</div>
                  </div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: dept.color }}>
                  {dept.score}
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginBottom: '1rem', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${dept.score}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  style={{ height: '100%', background: dept.color }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span style={{ color: dept.color, fontWeight: 500 }}>{dept.risk}</span>
              </div>

              {/* Hover Tooltip - CSS powered for simplicity */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-4 rounded-xl shadow-2xl pointer-events-none" style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Detailed Metrics</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div><span style={{color: '#ef4444'}}>Weak:</span> {dept.weak}</div>
                  <div><span style={{color: '#10b981'}}>Strong:</span> {dept.strong}</div>
                  <div><span style={{color: '#f59e0b'}}>Reused:</span> {dept.reused}</div>
                  <div><span style={{color: '#f97316'}}>Expired:</span> {dept.expired}</div>
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#8b5cf6', fontStyle: 'italic' }}>
                  AI: {dept.aiInsight}
                </div>
              </div>

            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* DRILL-DOWN ANALYTICS MODAL */}
      <AnimatePresence>
        {selectedDept && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}
            onClick={() => setSelectedDept(null)}
          >
            <motion.div 
              id="dept-report-content"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ width: '100%', maxWidth: '600px', background: '#0a0a0f', borderLeft: '1px solid rgba(255,255,255,0.1)', padding: '2rem', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: `${selectedDept.color}20`, borderRadius: '12px' }}>
                    <selectedDept.icon size={28} color={selectedDept.color} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{selectedDept.name} Analytics</h2>
                    <div style={{ color: selectedDept.color }}>{selectedDept.risk} Risk Profile</div>
                  </div>
                </div>
                <button onClick={() => setSelectedDept(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              {/* Action Bar */}
              <button 
                onClick={handleExportPDF}
                disabled={isExporting}
                data-html2canvas-ignore="true"
                style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', cursor: isExporting ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', opacity: isExporting ? 0.5 : 1 }}
              >
                <Download size={18} /> {isExporting ? 'Exporting...' : 'Download Department Report'}
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: selectedDept.color }}>{selectedDept.score}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Health Score</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700 }}>{selectedDept.totalEmps}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Employees</div>
                </div>
              </div>

              {/* Charts */}
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Password Strength Breakdown</h3>
              <div style={{ height: '250px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem', marginBottom: '2rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[
                      { name: 'Strong', value: selectedDept.strong, color: '#10b981' },
                      { name: 'Weak', value: selectedDept.weak, color: '#ef4444' },
                      { name: 'Reused', value: selectedDept.reused, color: '#f59e0b' },
                      { name: 'Expired', value: selectedDept.expired, color: '#f97316' },
                    ]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" stroke="none" label>
                      {
                        [...Array(4)].map((_, i) => <Cell key={i} fill={['#10b981', '#ef4444', '#f59e0b', '#f97316'][i]} />)
                      }
                    </Pie>
                    <RechartsTooltip contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Weekly Trend</h3>
              <div style={{ height: '200px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem', marginBottom: '2rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { day: 'Mon', score: selectedDept.score - 5 },
                    { day: 'Tue', score: selectedDept.score - 2 },
                    { day: 'Wed', score: selectedDept.score + 1 },
                    { day: 'Thu', score: selectedDept.score - 1 },
                    { day: 'Fri', score: selectedDept.score },
                  ]}>
                    <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <Line type="monotone" dataKey="score" stroke={selectedDept.color} strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderLeft: '4px solid #8b5cf6', borderRadius: '4px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#8b5cf6' }}>AI Recommendation</h4>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>{selectedDept.aiInsight}</p>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
