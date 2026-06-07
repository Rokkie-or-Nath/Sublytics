### 📁 Project Structure

```
Sublytics/
├── node_modules/          # Project dependencies
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
├── index.html             # HTML template
├── package.json           # Dependencies & scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
└── README.md              # Project documentation
```
