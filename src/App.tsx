import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import './App.css';
import { Dashboard } from './components/Dashboard';
import { DesktopBlocker } from './components/DesktopBlocker';
import { ProductList } from './components/ProductList';
import { Settings } from './components/Settings';
import type { TabType } from './components/TabBar';
import { TabBar } from './components/TabBar';
import { useProducts } from './hooks/useProducts';
import { getStockStatus } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { products } = useProducts();

  // PWA update handling
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  // Calculate low stock count for badge
  const lowStockCount = useMemo(() => {
    return products.filter(
      (p) => getStockStatus(p) === 'low' || getStockStatus(p) === 'critical'
    ).length;
  }, [products]);

  // Check for low stock and send notification
  useEffect(() => {
    const notificationsEnabled = localStorage.getItem('mm_notifications_enabled') === 'true';
    const lastNotified = localStorage.getItem('mm_last_notification');
    const threshold = parseInt(localStorage.getItem('mm_low_stock_threshold') || '5', 10);

    if (!notificationsEnabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    // Only notify once per hour
    if (lastNotified) {
      const lastTime = parseInt(lastNotified, 10);
      if (Date.now() - lastTime < 3600000) {
        return;
      }
    }

    // Find products below threshold
    const criticalProducts = products.filter((p) => p.quantity <= 0);
    const lowProducts = products.filter((p) => p.quantity > 0 && p.quantity <= threshold);

    if (criticalProducts.length > 0 || lowProducts.length > 0) {
      const message = criticalProducts.length > 0
        ? `${criticalProducts.length} product(s) out of stock!`
        : `${lowProducts.length} product(s) running low`;

      new Notification('MotorMods Stock Alert', {
        body: message,
        icon: '/pwa-192x192.png',
        tag: 'low-stock-alert',
      });

      localStorage.setItem('mm_last_notification', String(Date.now()));
    }
  }, [products]);

  const handleCheckForUpdates = useCallback(() => {
    if (needRefresh) {
      // Apply update
      updateServiceWorker(true);
    } else {
      // Check for updates by reloading the service worker
      navigator.serviceWorker?.getRegistration().then((registration) => {
        registration?.update();
      });
    }
  }, [needRefresh, updateServiceWorker]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <ProductList />;
      case 'settings':
        return (
          <Settings
            onCheckForUpdates={handleCheckForUpdates}
            updateAvailable={needRefresh}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <DesktopBlocker>
      <div className="app-container">
        <main className="app-content">
          {renderContent()}
        </main>
        <TabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          lowStockCount={lowStockCount}
        />
      </div>

      {/* Update prompt */}
      {needRefresh && (
        <div className="update-toast" onClick={handleCheckForUpdates}>
          <span>New version available!</span>
          <button>Update Now</button>
        </div>
      )}
    </DesktopBlocker>
  );
}

export default App;
