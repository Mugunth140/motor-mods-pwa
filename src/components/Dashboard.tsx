import { useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import { getStockStatus } from '../types';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
    const { products, loading, error } = useProducts();

    // Calculate analytics
    const analytics = useMemo(() => {
        const totalProducts = products.length;
        const outOfStock = products.filter((p) => getStockStatus(p) === 'critical').length;
        const lowStock = products.filter((p) => getStockStatus(p) === 'low').length;
        const inStock = products.filter((p) => getStockStatus(p) === 'adequate' || getStockStatus(p) === 'overstocked').length;

        // Inventory value calculations
        const inventoryValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
        const inventoryCost = products.reduce((sum, p) => sum + (p.purchase_price || 0) * p.quantity, 0);
        const potentialProfit = inventoryValue - inventoryCost;

        // Categories
        const categories = new Set(products.map((p) => p.category).filter(Boolean)).size;

        // Total units
        const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);

        return {
            totalProducts,
            outOfStock,
            lowStock,
            inStock,
            inventoryValue,
            inventoryCost,
            potentialProfit,
            categories,
            totalUnits,
        };
    }, [products]);

    const formatCurrency = (amount: number): string => {
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)}L`;
        }
        if (amount >= 1000) {
            return `₹${(amount / 1000).toFixed(1)}K`;
        }
        return `₹${amount.toLocaleString()}`;
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <span className="error-icon">⚠️</span>
                <h2>Connection Error</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    const stockHealthPercent = analytics.totalProducts > 0
        ? Math.round((analytics.inStock / analytics.totalProducts) * 100)
        : 0;

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <img src="/logo.png" alt="MotorMods" className="header-logo" />
                <div className="header-text">
                    <h1>Dashboard</h1>
                    <p className="subtitle">Business Analytics</p>
                </div>
            </header>

            {/* Key Metrics - Large Cards */}
            <div className="metrics-section">
                <div className="metric-card accent-teal">
                    <div className="metric-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    <div className="metric-content">
                        <span className="metric-value">{formatCurrency(analytics.inventoryValue)}</span>
                        <span className="metric-label">Stock Value</span>
                    </div>
                </div>

                <div className="metric-card accent-green">
                    <div className="metric-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                            <polyline points="16 7 22 7 22 13" />
                        </svg>
                    </div>
                    <div className="metric-content">
                        <span className="metric-value">{formatCurrency(analytics.potentialProfit)}</span>
                        <span className="metric-label">Potential Profit</span>
                    </div>
                </div>
            </div>

            {/* Inventory Stats Grid */}
            <div className="stats-section">
                <h2 className="section-title">Inventory Overview</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-number">{analytics.totalProducts}</span>
                        <span className="stat-name">Products</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{analytics.totalUnits.toLocaleString()}</span>
                        <span className="stat-name">Total Units</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{analytics.categories}</span>
                        <span className="stat-name">Categories</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{formatCurrency(analytics.inventoryCost)}</span>
                        <span className="stat-name">Cost Value</span>
                    </div>
                </div>
            </div>

            {/* Stock Health */}
            <div className="health-section">
                <h2 className="section-title">Stock Health</h2>
                <div className="health-card">
                    <div className="health-ring">
                        <svg viewBox="0 0 36 36" className="circular-chart">
                            <path
                                className="circle-bg"
                                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className="circle"
                                strokeDasharray={`${stockHealthPercent}, 100`}
                                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <span className="health-percent">{stockHealthPercent}%</span>
                    </div>
                    <div className="health-breakdown">
                        <div className="health-row">
                            <span className="health-dot green"></span>
                            <span className="health-label">In Stock</span>
                            <span className="health-value">{analytics.inStock}</span>
                        </div>
                        <div className="health-row">
                            <span className="health-dot yellow"></span>
                            <span className="health-label">Low Stock</span>
                            <span className="health-value">{analytics.lowStock}</span>
                        </div>
                        <div className="health-row">
                            <span className="health-dot red"></span>
                            <span className="health-label">Out of Stock</span>
                            <span className="health-value">{analytics.outOfStock}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="quick-stats">
                <div className={`alert-card ${analytics.outOfStock > 0 ? 'danger' : 'success'}`}>
                    <span className="alert-number">{analytics.outOfStock}</span>
                    <span className="alert-text">Out of Stock</span>
                </div>
                <div className={`alert-card ${analytics.lowStock > 0 ? 'warning' : 'success'}`}>
                    <span className="alert-number">{analytics.lowStock}</span>
                    <span className="alert-text">Low Stock</span>
                </div>
            </div>

            {products.length === 0 && (
                <div className="empty-state">
                    <span className="empty-icon">📦</span>
                    <h3>No Products Yet</h3>
                    <p>Products added in the billing software will appear here.</p>
                </div>
            )}
        </div>
    );
};
