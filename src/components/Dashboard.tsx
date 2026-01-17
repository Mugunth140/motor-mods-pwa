import { useMemo } from 'react';
import { useProducts } from '../hooks/useProducts';
import type { Product } from '../types';
import { getStockStatus } from '../types';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
    const { products, loading, error } = useProducts();

    const stats = useMemo(() => {
        if (products.length === 0) {
            return {
                totalProducts: 0,
                totalValue: 0,
                lowStock: 0,
                outOfStock: 0,
                healthy: 0,
                categories: 0,
            };
        }

        const lowStock = products.filter((p) => getStockStatus(p) === 'low').length;
        const outOfStock = products.filter((p) => getStockStatus(p) === 'critical').length;
        const healthy = products.filter((p) => getStockStatus(p) === 'adequate').length;
        const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
        const categories = new Set(products.map((p) => p.category).filter(Boolean)).size;

        return {
            totalProducts: products.length,
            totalValue,
            lowStock,
            outOfStock,
            healthy,
            categories,
        };
    }, [products]);

    const lowStockProducts = useMemo(() => {
        return products
            .filter((p) => getStockStatus(p) === 'low' || getStockStatus(p) === 'critical')
            .sort((a, b) => a.quantity - b.quantity)
            .slice(0, 5);
    }, [products]);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
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

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Dashboard</h1>
                <p className="subtitle">Stock Overview</p>
            </header>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon products">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m7.5 4.27 9 5.15" />
                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                            <path d="m3.3 7 8.7 5 8.7-5" />
                            <path d="M12 22V12" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.totalProducts}</span>
                        <span className="stat-label">Total Products</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon value">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{formatCurrency(stats.totalValue)}</span>
                        <span className="stat-label">Stock Value</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon categories">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 3h7v7H3z" />
                            <path d="M14 3h7v7h-7z" />
                            <path d="M3 14h7v7H3z" />
                            <path d="M14 14h7v7h-7z" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.categories}</span>
                        <span className="stat-label">Categories</span>
                    </div>
                </div>
            </div>

            {/* Stock Health */}
            <div className="section">
                <h2 className="section-title">Stock Health</h2>
                <div className="health-grid">
                    <div className="health-item healthy">
                        <span className="health-value">{stats.healthy}</span>
                        <span className="health-label">In Stock</span>
                        <div className="health-bar">
                            <div
                                className="health-fill"
                                style={{
                                    width: `${stats.totalProducts > 0 ? (stats.healthy / stats.totalProducts) * 100 : 0}%`,
                                }}
                            ></div>
                        </div>
                    </div>
                    <div className="health-item low">
                        <span className="health-value">{stats.lowStock}</span>
                        <span className="health-label">Low Stock</span>
                        <div className="health-bar">
                            <div
                                className="health-fill"
                                style={{
                                    width: `${stats.totalProducts > 0 ? (stats.lowStock / stats.totalProducts) * 100 : 0}%`,
                                }}
                            ></div>
                        </div>
                    </div>
                    <div className="health-item critical">
                        <span className="health-value">{stats.outOfStock}</span>
                        <span className="health-label">Out of Stock</span>
                        <div className="health-bar">
                            <div
                                className="health-fill"
                                style={{
                                    width: `${stats.totalProducts > 0 ? (stats.outOfStock / stats.totalProducts) * 100 : 0}%`,
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Low Stock Alerts */}
            {lowStockProducts.length > 0 && (
                <div className="section">
                    <h2 className="section-title">
                        <span className="alert-icon">⚠️</span>
                        Low Stock Alerts
                    </h2>
                    <div className="alert-list">
                        {lowStockProducts.map((product) => (
                            <LowStockItem key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            )}

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

const LowStockItem: React.FC<{ product: Product }> = ({ product }) => {
    const status = getStockStatus(product);
    const isCritical = status === 'critical';

    return (
        <div className={`alert-item ${isCritical ? 'critical' : 'warning'}`}>
            <div className="alert-content">
                <span className="alert-name">{product.name}</span>
                {product.sku && <span className="alert-sku">{product.sku}</span>}
            </div>
            <div className="alert-qty">
                <span className="qty-value">{product.quantity}</span>
                <span className="qty-label">left</span>
            </div>
        </div>
    );
};
