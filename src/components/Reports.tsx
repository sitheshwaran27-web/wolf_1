import React, { useState, useRef } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { 
  FileText, Download, Printer, Share2, Plus, 
  CheckCircle, AlertCircle, Clock, Search, Filter,
  FileBarChart, Shield, Users, Key, AlertTriangle, Play,
  X, RefreshCw
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// --- MOCK DATA GENERATOR ---
const generateMockReports = () => {
  const reports = [];
  const types = ['Full Password Audit', 'Weak Password Report', 'Password Reuse Report', 'Expired Password Report', 'Department Report', 'Executive Summary'];
  const authors = ['Admin User', 'Security Bot', 'System', 'HR Manager', 'IT Admin', 'Compliance Officer'];
  const statuses = ['Completed', 'Completed', 'Completed', 'Completed', 'Processing', 'Failed']; 
  const risks = ['Critical', 'High', 'Medium', 'Low'];
  const depts = ['All', 'IT', 'HR', 'Finance', 'Sales', 'Admin', 'Cyber Security'];
  
  for(let i=0; i<100; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const date = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    reports.push({
      id: `REP-2026-${(i+1).toString().padStart(3, '0')}`,
      name: `${type} - ${depts[Math.floor(Math.random() * depts.length)]}`,
      author: authors[Math.floor(Math.random() * authors.length)],
      date: date,
      type: type,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      risk: risks[Math.floor(Math.random() * risks.length)],
      format: 'PDF, CSV'
    });
  }
  return reports.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const ALL_REPORTS = generateMockReports();

// Preview Charts Data
const PREVIEW_PIE = [
  { name: 'Weak', value: 15, color: '#ef4444' },
  { name: 'Medium', value: 25, color: '#f59e0b' },
  { name: 'Strong', value: 60, color: '#10b981' },
];
const PREVIEW_BAR = [
  { name: 'IT', risk: 12 }, { name: 'HR', risk: 45 }, { name: 'Finance', risk: 22 }, { name: 'Sales', risk: 65 }
];
const PREVIEW_LINE = [
  { month: 'May', score: 65 }, { month: 'Jun', score: 72 }, { month: 'Jul', score: 75 }, { month: 'Aug', score: 84 }
];

export default function Reports() {
  const { dataImported } = useData();
  const [reports, setReports] = useState(ALL_REPORTS);
  const [activeCard, setActiveCard] = useState('Total Reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  // Modals & Actions
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  
  // Progress Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastProgress, setToastProgress] = useState(0);

  const previewRef = useRef<HTMLDivElement>(null);

  const handleCardFilter = (card: string) => {
    setActiveCard(card);
    let filtered = [...ALL_REPORTS];
    const today = new Date().toISOString().split('T')[0];
    
    if (card === 'Today') filtered = filtered.filter(r => r.date === today);
    if (card === 'Critical') filtered = filtered.filter(r => r.risk === 'Critical');
    if (card === 'Weak') filtered = filtered.filter(r => r.type.includes('Weak'));
    if (card === 'Reuse') filtered = filtered.filter(r => r.type.includes('Reuse'));
    if (card === 'Expired') filtered = filtered.filter(r => r.type.includes('Expired'));
    
    setReports(filtered);
  };

  const currentFilteredReports = reports.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.toLowerCase().includes(searchTerm.toLowerCase()) || r.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = deptFilter === 'All' || r.name.includes(deptFilter);
    const matchDate = dateFilter === 'All' || (dateFilter === 'Today' ? r.date === new Date().toISOString().split('T')[0] : true);
    return matchSearch && matchDept && matchDate;
  });

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastProgress(0);
    const int = setInterval(() => {
      setToastProgress(p => {
        if (p >= 100) {
          clearInterval(int);
          setTimeout(() => setToastMessage(''), 1000);
          return 100;
        }
        return p + 10;
      });
    }, 200);
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    showToast('Downloading...');
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, backgroundColor: '#05050A' });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Password_Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      showToast('PDF downloaded successfully.');
    } catch (e) {
      console.error(e);
      showToast('Error generating PDF.');
    }
  };

  const handleDownloadCSV = () => {
    showToast('Generating CSV...');
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Username,Department,Password Strength,Risk Score,Crack Time\n"
      + "john.doe,IT,Strong,12,Centuries\n"
      + "jane.smith,HR,Weak,88,Instant\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Data_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    setTimeout(() => { link.click(); document.body.removeChild(link); showToast('CSV downloaded successfully.'); }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!dataImported) {
    return (
      <EmptyState 
        icon={<FileText size={40} color="#3b82f6" />}
        headline="No Reports Generated Yet"
        description="Import and analyze password data to create enterprise security reports and export PDF summaries."
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, background: 'rgba(10, 10, 15, 0.95)', border: '1px solid var(--primary)', padding: '1rem', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', minWidth: '300px', animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
             <span style={{ fontWeight: 600, color: 'white' }}>{toastMessage}</span>
             {toastProgress < 100 && <span style={{ color: 'var(--primary)' }}>{toastProgress}%</span>}
             {toastProgress >= 100 && <CheckCircle size={16} color="#10b981" />}
          </div>
          {toastProgress < 100 && (
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${toastProgress}%`, background: 'var(--primary)', transition: 'width 0.2s' }}></div>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: 'white' }}>Enterprise Reporting System</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Comprehensive security intelligence and compliance exports.</p>
        </div>
        <button className="btn" style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontWeight: 600 }} onClick={() => setIsGenerateModalOpen(true)}>
           <Plus size={18} /> Generate Report
        </button>
      </div>

      {/* Top Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
        {[
          { id: 'Total Reports', label: 'Total Reports', value: '1,248', color: '#3b82f6' },
          { id: 'Today', label: 'Today', value: '14', color: '#8b5cf6' },
          { id: 'Critical', label: 'Critical Risk', value: '42', color: '#ef4444' },
          { id: 'Weak', label: 'Weak Passwords', value: '156', color: '#f59e0b' },
          { id: 'Reuse', label: 'Reuse Reports', value: '89', color: '#eab308' },
          { id: 'Expired', label: 'Expired Passwords', value: '234', color: '#10b981' },
        ].map((card) => (
          <div 
            key={card.id} 
            onClick={() => handleCardFilter(card.id)}
            className="hover:scale-105"
            style={{ 
              padding: '1.25rem', background: activeCard === card.id ? `rgba(${parseInt(card.color.slice(1,3),16)}, ${parseInt(card.color.slice(3,5),16)}, ${parseInt(card.color.slice(5,7),16)}, 0.1)` : 'rgba(255,255,255,0.02)', 
              borderRadius: '8px', border: `1px solid ${activeCard === card.id ? card.color : 'rgba(255,255,255,0.05)'}`, 
              cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '0.5rem' 
            }}
          >
             <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{card.label}</div>
             <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: activeCard === card.id ? card.color : 'white' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Reports Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'hidden' }}>
        
        {/* Table Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', margin: 0 }}>Recent Reports</h3>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.5rem 1rem', border: '1px solid var(--border-color)' }}>
              <Filter size={16} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
              <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', outline: 'none', fontSize: '0.875rem' }}>
                <option value="All" style={{background: '#0f172a'}}>All Dates</option>
                <option value="Today" style={{background: '#0f172a'}}>Today</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.5rem 1rem', border: '1px solid var(--border-color)' }}>
              <Search size={16} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
              <input 
                type="text" placeholder="Search reports..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '200px', fontSize: '0.875rem' }} 
              />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#05050A', zIndex: 1 }}>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem 0' }}>Report ID</th>
                <th style={{ padding: '1rem 0' }}>Report Name</th>
                <th style={{ padding: '1rem 0' }}>Generated By</th>
                <th style={{ padding: '1rem 0' }}>Date</th>
                <th style={{ padding: '1rem 0' }}>Status</th>
                <th style={{ padding: '1rem 0', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentFilteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-white hover:bg-opacity-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.875rem', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem 0', fontWeight: 500, color: '#3b82f6' }}>{report.id}</td>
                  <td style={{ padding: '1rem 0', color: 'white' }}>{report.name}</td>
                  <td style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>{report.author}</td>
                  <td style={{ padding: '1rem 0' }}>{report.date}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, 
                      color: report.status === 'Completed' ? '#10b981' : report.status === 'Failed' ? '#ef4444' : '#f59e0b', 
                      background: report.status === 'Completed' ? 'rgba(16,185,129,0.1)' : report.status === 'Failed' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)' 
                    }}>
                      {report.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn" onClick={() => { setSelectedReport(report); setIsPreviewModalOpen(true); }} style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.25rem', border: 'none' }}>
                        <Play size={12} /> Preview
                      </button>
                      <button className="btn" onClick={handleDownloadPDF} style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', border: 'none' }} disabled={report.status !== 'Completed'}>
                        <Download size={12} /> PDF
                      </button>
                      <button className="btn" onClick={handleDownloadCSV} style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1px solid rgba(255,255,255,0.1)' }} disabled={report.status !== 'Completed'}>
                        <FileText size={12} /> CSV
                      </button>
                      <button className="btn" onClick={() => showToast('Share link generated and copied to clipboard!')} style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1px solid rgba(255,255,255,0.1)' }} disabled={report.status !== 'Completed'}>
                        <Share2 size={12} /> Share
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentFilteredReports.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>No reports match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GENERATE REPORT MODAL */}
      {isGenerateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '600px', padding: '2rem', animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
               <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Configure Report</h3>
               <button onClick={() => setIsGenerateModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div>
                 <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Report Type</label>
                 <select style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '4px', color: 'white', fontSize: '0.875rem' }}>
                    <option style={{background: '#0f172a'}}>Full Password Audit</option>
                    <option style={{background: '#0f172a'}}>Weak Password Report</option>
                    <option style={{background: '#0f172a'}}>Password Reuse Report</option>
                    <option style={{background: '#0f172a'}}>Expired Password Report</option>
                    <option style={{background: '#0f172a'}}>Executive Summary</option>
                 </select>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                 <div>
                   <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Date Range</label>
                   <select style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '4px', color: 'white', fontSize: '0.875rem' }}>
                      <option style={{background: '#0f172a'}}>Last 30 Days</option>
                      <option style={{background: '#0f172a'}}>Last 7 Days</option>
                      <option style={{background: '#0f172a'}}>Today</option>
                   </select>
                 </div>
                 <div>
                   <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Department</label>
                   <select style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '4px', color: 'white', fontSize: '0.875rem' }}>
                      <option style={{background: '#0f172a'}}>All Departments</option>
                      <option style={{background: '#0f172a'}}>IT</option>
                      <option style={{background: '#0f172a'}}>HR</option>
                      <option style={{background: '#0f172a'}}>Finance</option>
                   </select>
                 </div>
               </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem' }}>
               <button className="btn" onClick={() => setIsGenerateModalOpen(false)} style={{ background: 'transparent', color: 'white', padding: '0.75rem 1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
               <button className="btn" onClick={() => { setIsGenerateModalOpen(false); setIsPreviewModalOpen(true); }} style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none' }}>
                 <Play size={16} /> Preview Report
               </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF PREVIEW MODAL */}
      {isPreviewModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: '#05050A', zIndex: 2000, display: 'flex', flexDirection: 'column' }} className="print-modal-container">
          
          <div className="no-print" style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: 0 }}>Report Preview</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
               <button className="btn" onClick={handleDownloadCSV} style={{ background: 'transparent', color: 'white', padding: '0.5rem 1rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={16}/> CSV</button>
               <button className="btn" onClick={handlePrint} style={{ background: 'transparent', color: 'white', padding: '0.5rem 1rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Printer size={16}/> Print</button>
               <button className="btn" onClick={handleDownloadPDF} style={{ background: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Download size={16}/> Save PDF</button>
               <button className="btn" onClick={() => setIsPreviewModalOpen(false)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.5rem 1rem', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><X size={16}/> Close</button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
            <div ref={previewRef} style={{ maxWidth: '900px', margin: '0 auto', background: '#05050A', color: 'white', padding: '2rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '1.5rem', fontWeight: 700 }}>
                  <Shield size={32} /> PasswordShield AI
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Password Audit Report</h1>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Generated: {new Date().toISOString().split('T')[0]} | By: Admin User</div>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#3b82f6', borderBottom: '1px solid rgba(59,130,246,0.3)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Executive Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                   <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Security Score</div>
                     <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>84 / 100</div>
                   </div>
                   <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weak Passwords</div>
                     <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>15%</div>
                   </div>
                   <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High Risk Users</div>
                     <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>42</div>
                   </div>
                   <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reused Passwords</div>
                     <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>89</div>
                   </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <h3 style={{ color: '#3b82f6', borderBottom: '1px solid rgba(59,130,246,0.3)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Password Strength Distribution</h3>
                  <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={PREVIEW_PIE} cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="none" dataKey="value" paddingAngle={2}>
                          {PREVIEW_PIE.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <RechartsTooltip contentStyle={{background: '#05050A', border: '1px solid #1e293b'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <h3 style={{ color: '#3b82f6', borderBottom: '1px solid rgba(59,130,246,0.3)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Department Risk Analysis</h3>
                  <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={PREVIEW_BAR} layout="vertical" margin={{top: 0, right: 0, left: 20, bottom: 0}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" stroke="var(--text-muted)" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} />
                        <RechartsTooltip contentStyle={{background: '#05050A', border: '1px solid #1e293b'}} cursor={{fill: 'rgba(255,255,255,0.02)'}}/>
                        <Bar dataKey="risk" fill="#ef4444" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#3b82f6', borderBottom: '1px solid rgba(59,130,246,0.3)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Top High Risk Users</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Username</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Department</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Strength</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Risk Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: 'white' }}>admin.service</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>IT</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#ef4444' }}>Weak</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#ef4444', fontWeight: 'bold' }}>92</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem 1rem', color: 'white' }}>j.doe</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Sales</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#ef4444' }}>Weak</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#ef4444', fontWeight: 'bold' }}>88</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#3b82f6', fontSize: '1rem' }}>AI Recommendations</h3>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                   <li>Enforce immediate password reset for the 42 identified high-risk users.</li>
                   <li>Deploy Multi-Factor Authentication (MFA) across the Sales department.</li>
                   <li>Update password policy to prohibit the top 500 common dictionary words.</li>
                </ul>
              </div>

              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                Generated by PasswordShield AI Enterprise Edition. Confidential Document.
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-modal-container, .print-modal-container * { visibility: visible; }
          .print-modal-container { position: absolute; left: 0; top: 0; width: 100%; height: auto; background: white !important; color: black !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
