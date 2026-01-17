import { useEffect, useState } from 'react';
import './Settings.css';

interface SettingsProps {
    onCheckForUpdates: () => void;
    updateAvailable: boolean;
}

export const Settings: React.FC<SettingsProps> = ({ onCheckForUpdates, updateAvailable }) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
    const [lowStockThreshold, setLowStockThreshold] = useState(5);

    useEffect(() => {
        // Check notification permission
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }

        // Load saved settings
        const savedNotifications = localStorage.getItem('mm_notifications_enabled');
        const savedThreshold = localStorage.getItem('mm_low_stock_threshold');

        if (savedNotifications) {
            setNotificationsEnabled(savedNotifications === 'true');
        }
        if (savedThreshold) {
            setLowStockThreshold(parseInt(savedThreshold, 10));
        }
    }, []);

    const handleNotificationToggle = async () => {
        if (!('Notification' in window)) {
            alert('Notifications are not supported in this browser');
            return;
        }

        if (Notification.permission === 'denied') {
            alert('Notifications are blocked. Please enable them in your browser settings.');
            return;
        }

        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            if (permission !== 'granted') {
                return;
            }
        }

        const newValue = !notificationsEnabled;
        setNotificationsEnabled(newValue);
        localStorage.setItem('mm_notifications_enabled', String(newValue));

        if (newValue) {
            // Show test notification
            new Notification('MotorMods Stock', {
                body: 'Low stock notifications are now enabled!',
                icon: '/pwa-192x192.png',
            });
        }
    };

    const handleThresholdChange = (value: number) => {
        setLowStockThreshold(value);
        localStorage.setItem('mm_low_stock_threshold', String(value));
    };

    return (
        <div className="settings">
            <header className="settings-header">
                <img src="/logo.png" alt="MotorMods" className="header-logo" />
                <div className="header-text">
                    <h1>Settings</h1>
                    <p className="subtitle">App Configuration</p>
                </div>
            </header>

            {/* Update Section */}
            <div className="settings-section">
                <h2 className="section-title">App Updates</h2>
                <div className="settings-card">
                    <div className="setting-row" onClick={onCheckForUpdates}>
                        <div className="setting-info">
                            <span className="setting-label">Check for Updates</span>
                            <span className="setting-description">
                                {updateAvailable ? 'New version available!' : 'You have the latest version'}
                            </span>
                        </div>
                        <div className={`update-indicator ${updateAvailable ? 'available' : ''}`}>
                            {updateAvailable ? (
                                <span className="update-badge">Update</span>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 12l2 2 4-4" />
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications Section */}
            <div className="settings-section">
                <h2 className="section-title">Notifications</h2>
                <div className="settings-card">
                    <div className="setting-row" onClick={handleNotificationToggle}>
                        <div className="setting-info">
                            <span className="setting-label">Low Stock Alerts</span>
                            <span className="setting-description">
                                {notificationPermission === 'denied'
                                    ? 'Blocked by browser'
                                    : 'Get notified when products are running low'}
                            </span>
                        </div>
                        <div className={`toggle ${notificationsEnabled ? 'enabled' : ''}`}>
                            <div className="toggle-knob"></div>
                        </div>
                    </div>

                    {notificationsEnabled && (
                        <div className="setting-row threshold-row">
                            <div className="setting-info">
                                <span className="setting-label">Alert Threshold</span>
                                <span className="setting-description">
                                    Alert when stock falls below this level
                                </span>
                            </div>
                            <div className="threshold-control">
                                <button onClick={() => handleThresholdChange(Math.max(1, lowStockThreshold - 1))}>−</button>
                                <span className="threshold-value">{lowStockThreshold}</span>
                                <button onClick={() => handleThresholdChange(Math.min(50, lowStockThreshold + 1))}>+</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* About Section */}
            <div className="settings-section">
                <h2 className="section-title">About</h2>
                <div className="settings-card">
                    <div className="about-info">
                        <div className="app-icon">
                            <img src="/logo.png" alt="MotorMods" />
                        </div>
                        <div className="app-details">
                            <h3>MotorMods Stock Viewer</h3>
                            <p>Version 1.0.0</p>
                        </div>
                    </div>
                    <div className="about-description">
                        <p>View real-time inventory and stock levels from your MotorMods billing software.</p>
                    </div>
                </div>
            </div>

            {/* Data Section */}
            <div className="settings-section">
                <h2 className="section-title">Data</h2>
                <div className="settings-card">
                    <div className="setting-row" onClick={() => window.location.reload()}>
                        <div className="setting-info">
                            <span className="setting-label">Refresh Data</span>
                            <span className="setting-description">Reload all data from server</span>
                        </div>
                        <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                            <path d="M21 3v5h-5" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};
