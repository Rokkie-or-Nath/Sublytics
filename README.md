# Sublytics

🚀 Sublytics

Sublytics is a modern, AI-powered subscription management and spending analytics dashboard built with React and TypeScript.

📖 Description

Sublytics helps users track, manage, and optimize their recurring subscriptions and spending habits.
It automatically scans email inboxes to detect subscriptions, provides visual analytics, and delivers actionable insights to reduce unnecessary costs.

✨ Features
--------------------------------------------
📩 Smart Email Import
Connect your email to automatically scan and extract subscriptions from receipts and invoices
💳 Subscription Management
View all active subscriptions, track renewal dates, and manage recurring payments in one place
📊 Spending Analytics
Interactive charts showing spending trends, category breakdowns, and future projections
🧭 Dashboard Overview
Quick view of total spending, upcoming bills, and recent activity
🤖 AI Insights & Recommendations
Get smart suggestions to optimize and reduce subscription costs
⚙️ Settings & Preferences
Customize categories, notifications, and user preferences

🧪 Usage
--------------------------------------------
Connect your email account
Let Sublytics detect your subscriptions
Explore your dashboard and analytics
Optimize your spending with AI insights

Sublytics/
├── node_modules/          # Project dependencies (auto-generated)
├── src/                   # Main source code
│   ├── components/        # Reusable UI components
│   │   ├── auth/          # Authentication-related components
│   │   ├── dashboard/     # Dashboard-specific UI components
│   │   ├── layout/        # Layout components (Header, Sidebar, etc.)
│   │   ├── subscriptions/ # Subscription-related components
│   │   └── ui/            # Generic UI elements (Button, Card, Input)
│   ├── pages/             # Application pages (routes)
│   │   ├── AnalyticsPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── SubscriptionsPage.tsx
│   ├── store/             # Global state management (Zustand)
│   │   └── useStore.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/             # Utility/helper functions
│   │   ├── cn.ts          # Classname utility (clsx + tailwind-merge)
│   │   └── formatters.ts  # Date & number formatting
│   ├── App.tsx            # Root React component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── .kilo/                 # Kilo configuration files
├── index.html             # HTML template
├── package.json           # Dependencies & scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
└── README.md              # Project documentation
