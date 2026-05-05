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

📦 Installation
--------------------------------------------
# Clone the repository
git clone https://github.com/your-username/sublytics.git

# Navigate to the project
cd sublytics

# Install dependencies
npm install

# Run development server
npm run dev

🧪 Usage
--------------------------------------------
Connect your email account
Let Sublytics detect your subscriptions
Explore your dashboard and analytics
Optimize your spending with AI insights

📁 PROJECT STRUCTURE
--------------------------------------------
Sublytics/
├── node_modules/          # Dependencies
├── src/                   # Source code
│   ├── components/        # Reusable UI components
│   │   ├── auth/         # Authentication-related components
│   │   ├── dashboard/    # Dashboard-specific components
│   │   ├── layout/       # Layout components (Header, Sidebar, Layout)
│   │   ├── subscriptions/# Subscription-related components
│   │   └── ui/           # Generic UI components (Button, Card, Input, etc.)
│   ├── pages/            # Page components
│   │   ├── AnalyticsPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── SubscriptionsPage.tsx
│   ├── store/            # State management (Zustand)
│   │   └── useStore.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   ├── cn.ts         # Class name utility (tailwind-merge + clsx)
│   │   └── formatters.ts # Date/number formatting utilities
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── .kilo/               # Kilo configuration
├── index.html           # HTML entry point
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── README.md           # Project documentation
