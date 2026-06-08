import { SummaryCards } from '../components/dashboard/SummaryCards';
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner';
import { SpendingChart } from '../components/dashboard/SpendingChart';
import { CategoryBreakdown } from '../components/dashboard/CategoryBreakdown';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { Insights } from '../components/dashboard/Insights';
import { UpcomingBills } from '../components/dashboard/UpcomingBills';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <WelcomeBanner />
      <SummaryCards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-w-0 overflow-hidden">
          <SpendingChart />
        </div>
        <div className="min-w-0 overflow-hidden">
          <UpcomingBills />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="min-w-0 overflow-hidden">
          <CategoryBreakdown />
        </div>
        <div className="space-y-6 min-w-0 overflow-hidden">
          <Insights />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
