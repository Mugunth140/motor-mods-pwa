import { useMemo, useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import type { StockStatus } from '../types';
import { getStockStatus } from '../types';
import { ProductCard } from './ProductCard';
import './ProductList.css';
import { SearchBar } from './SearchBar';

type FilterType = 'all' | StockStatus;

export const ProductList: React.FC = () => {
    const { products, loading, error } = useProducts();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterType>('all');

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            // Search filter
            const searchLower = search.toLowerCase();
            const matchesSearch =
                !search ||
                product.name.toLowerCase().includes(searchLower) ||
                product.sku?.toLowerCase().includes(searchLower) ||
                product.category?.toLowerCase().includes(searchLower);

            // Status filter
            const matchesFilter =
                filter === 'all' || getStockStatus(product) === filter;

            return matchesSearch && matchesFilter;
        });
    }, [products, search, filter]);

    const stats = useMemo(() => {
        const total = products.length;
        const critical = products.filter((p) => getStockStatus(p) === 'critical').length;
        const low = products.filter((p) => getStockStatus(p) === 'low').length;
        const adequate = products.filter((p) => getStockStatus(p) === 'adequate').length;
        return { total, critical, low, adequate };
    }, [products]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading inventory...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <h2>Connection Error</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return (
        <div className="product-list-container">
            <header className="list-header">
                <img src="/logo.png" alt="MotorMods" className="header-logo" />
                <div className="header-text">
                    <h1>Inventory</h1>
                    <p className="subtitle">Real-time stock levels</p>
                </div>
            </header>

            <div className="stats-bar">
                <div className="stat-item">
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">Total</span>
                </div>
                <div className="stat-item stat-critical">
                    <span className="stat-value">{stats.critical}</span>
                    <span className="stat-label">Out</span>
                </div>
                <div className="stat-item stat-low">
                    <span className="stat-value">{stats.low}</span>
                    <span className="stat-label">Low</span>
                </div>
                <div className="stat-item stat-adequate">
                    <span className="stat-value">{stats.adequate}</span>
                    <span className="stat-label">OK</span>
                </div>
            </div>

            <div className="search-section">
                <SearchBar value={search} onChange={setSearch} />
            </div>

            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button
                    className={`filter-tab ${filter === 'critical' ? 'active' : ''}`}
                    onClick={() => setFilter('critical')}
                >
                    Out of Stock
                </button>
                <button
                    className={`filter-tab ${filter === 'low' ? 'active' : ''}`}
                    onClick={() => setFilter('low')}
                >
                    Low Stock
                </button>
                <button
                    className={`filter-tab ${filter === 'adequate' ? 'active' : ''}`}
                    onClick={() => setFilter('adequate')}
                >
                    In Stock
                </button>
            </div>

            <div className="products-count">
                Showing {filteredProducts.length} of {products.length} products
            </div>

            <div className="products-grid">
                {filteredProducts.length === 0 ? (
                    <div className="empty-state">
                        <p>No products match your search or filter.</p>
                    </div>
                ) : (
                    filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                )}
            </div>
        </div>
    );
};
