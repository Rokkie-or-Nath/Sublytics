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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SpendingChart />
        </div>
        <UpcomingBills />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CategoryBreakdown />
        <div className="space-y-6">
          <Insights />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
