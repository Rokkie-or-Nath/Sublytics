import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { AddSubscriptionModal } from '../subscriptions/AddSubscriptionModal';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-bg-deep">
      <Sidebar />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Header />
        <AddSubscriptionModal />
        <main className="flex-1 p-4 pb-20 lg:pb-6 lg:p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
