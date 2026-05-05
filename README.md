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

## 📁 Project Structure

```
Sublytics/
├── node_modules/          # Dependencies
├── src/                   # Source code
│   ├── components/        # Reusable UI components
│   │   ├── auth/         # Authentication-related components
│   │   ├── dashboard/    # Dashboard-specific components
│   │   ├── layout/       # Layout components
│   │   ├── subscriptions/# Subscription-related components
│   │   └── ui/           # Generic UI components
│   ├── pages/
│   │   ├── AnalyticsPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── SubscriptionsPage.tsx
│   ├── store/
│   │   └── useStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   └── formatters.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .kilo/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```
