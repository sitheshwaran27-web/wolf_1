# 🛡️ PasswordShield AI

**Intelligent Password Security Analysis for Individuals & Enterprises**

**PasswordShield AI** is an intelligent browser extension and web dashboard that helps users and organizations identify weak, reused, common, and expired passwords. It provides real-time password analysis, AI-powered risk prediction, security recommendations, and enterprise reporting — while ensuring user privacy by **never storing plaintext passwords**.

---

## ✨ Features

| | |
|---|---|
| 🔴 Weak Password Detection | 🟡 Medium & Strong Password Classification |
| 🚫 Common Password Detection | 🔁 Password Reuse Detection |
| ⏳ Password Age & Expiry Analysis | 🤖 AI Risk Prediction |
| 🧠 AI Security Advisor | 🔔 Browser Notifications |
| 📥 CSV Import | 📄 PDF & CSV Report Generation |
| 📊 Dashboard Analytics | 📈 Risk Analytics |
| 🔍 Search & Filter | 🔥 Firebase Integration |
| 🧩 Chrome Extension (Manifest V3) | 📱 Responsive UI |
| 🌑 Dark Cybersecurity Theme | |

---

## 🛠️ Technologies Used

**Frontend**
- ⚛️ React
- 🟦 TypeScript
- 🎨 Tailwind CSS
- ⚡ Vite

**Backend**
- 🐍 FastAPI *(or Node.js)*

**Database**
- 🔥 Firebase Firestore

**Browser Extension**
- 🧩 Chrome Extension Manifest V3
- 💾 Chrome Storage API

**Libraries**
- `zxcvbn` — password strength estimation
- `jsPDF` — PDF report generation
- `html2canvas` — dashboard-to-image export
- `Recharts` — data visualization
- `Framer Motion` — UI animations

---

## 🏗️ Project Architecture

```
┌─────────────────────────┐
│   Browser Extension      │
│  (Manifest V3, Chrome)   │
└────────────┬─────────────┘
             │
             ▼
┌─────────────────────────┐
│ Password Analysis Engine │
│   (zxcvbn + rule sets)   │
└────────────┬─────────────┘
             │
             ▼
┌─────────────────────────┐
│       Risk Engine         │
│  (AI Risk Prediction)    │
└────────────┬─────────────┘
             │
             ▼
┌─────────────────────────┐
│        Dashboard          │
│  (React + Recharts UI)   │
└────────────┬─────────────┘
             │
             ▼
┌─────────────────────────┐
│         Firebase          │
│   (Firestore Metadata)   │
└────────────┬─────────────┘
             │
             ▼
┌─────────────────────────┐
│         Reports           │
│    (PDF / CSV Export)    │
└─────────────────────────┘
```

---

## 📁 Folder Structure

```
passwordshield-ai/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── charts/
│   │   └── shared/
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Analysis.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   ├── dashboard/
│   │   ├── DashboardLayout.tsx
│   │   ├── RiskOverview.tsx
│   │   └── AnalyticsPanel.tsx
│   ├── extension/
│   │   ├── manifest.json
│   │   ├── background.ts
│   │   ├── content.ts
│   │   └── popup.tsx
│   ├── services/
│   │   ├── passwordAnalyzer.ts
│   │   ├── riskEngine.ts
│   │   ├── aiAdvisor.ts
│   │   └── reportGenerator.ts
│   ├── firebase/
│   │   ├── config.ts
│   │   ├── firestore.ts
│   │   └── auth.ts
│   ├── utils/
│   │   ├── hashing.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── assets/
│   │   ├── icons/
│   │   └── images/
│   ├── App.tsx
│   └── main.tsx
├── public/
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 🚀 Installation

```bash
# Clone repository
git clone https://github.com/your-org/passwordshield-ai.git
cd passwordshield-ai

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build


---

## 📖 Usage

1. **Import CSV** — Upload a password export for bulk analysis
2. **Analyze Passwords** — Run the analysis engine against your dataset
3. **View Dashboard** — Explore risk scores and analytics visually
4. **Generate Reports** — Create executive-ready PDF/CSV summaries
5. **Export PDF** — Download shareable audit reports
6. **Receive Browser Notifications** — Get real-time alerts on risky credentials

---

## 🔍 Password Analysis

| Category | Description |
|---|---|
| 🔴 **Weak Password** | Easily guessable, short, or in common breach lists |
| 🟡 **Medium Password** | Moderate complexity, partially predictable patterns |
| 🟢 **Strong Password** | High entropy, resistant to brute-force & dictionary attacks |
| 🔁 **Reuse Detection** | Flags passwords used across multiple accounts |
| 🚫 **Common Password Detection** | Matches against known common/breached password lists |
| 📊 **Risk Score** | Composite score (0–100) combining strength, reuse, age, and MFA status |

---

## 🤖 AI Features

- 🧮 **AI Risk Prediction** — Machine-learning-driven scoring of credential risk
- 🧠 **AI Security Advisor** — Personalized, actionable password guidance
- 🔮 **Future Risk Forecast** — Predicts risk trends over time
- 🏢 **Department Risk Analysis** — Aggregated risk breakdown by team/department
- 💡 **Security Recommendations** — Contextual best-practice suggestions

---

## 🔐 Security & Privacy

> PasswordShield AI is built privacy-first.

- ❌ **Never** stores plaintext passwords
- 🖥️ All password analysis happens **locally** in the browser
- 🔒 Only **hashed password fingerprints** are stored, never raw values
- 🔄 Only **security metadata** (scores, flags, timestamps) is synchronized to the cloud

---

## 📑 Reports

- 📄 Generate **PDF** reports
- 📊 Generate **CSV** exports
- 📋 **Executive Summary** overview
- 📈 Visual **charts** and breakdowns
- ✅ Actionable **recommendations**

---

## 🔮 Future Enhancements

- 🧬 Machine Learning Risk Prediction (advanced models)
- 🌗 Dark / Light Theme toggle
- 🔗 Password Manager Integration
- 📧 Email Notifications
- 🏢 Organization Dashboard
- ☁️ Cloud Synchronization
- 📱 Mobile Application
- 🔑 Role-Based Access Control (RBAC)

---
