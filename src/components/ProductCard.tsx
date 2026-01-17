import type { Product } from '../types';
import { getStockStatus } from '../types';
import './ProductCard.css';

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const stockStatus = getStockStatus(product);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const getStatusColor = () => {
        switch (stockStatus) {
            case 'critical': return 'status-critical';
            case 'low': return 'status-low';
            case 'overstocked': return 'status-overstocked';
            default: return 'status-adequate';
        }
    };

    const getStatusLabel = () => {
        switch (stockStatus) {
            case 'critical': return 'Out of Stock';
            case 'low': return 'Low Stock';
            case 'overstocked': return 'Overstocked';
            default: return 'In Stock';
        }
    };

    return (
        <div className={`product-card ${getStatusColor()}`}>
            <div className="card-header">
                <h3 className="product-name">{product.name}</h3>
                {product.category && (
                    <span className="product-category">{product.category}</span>
                )}
            </div>

            <div className="card-body">
                {product.sku && (
                    <div className="info-row">
                        <span className="label">SKU</span>
                        <span className="value">{product.sku}</span>
                    </div>
                )}

                <div className="info-row">
                    <span className="label">Price</span>
                    <span className="value price">{formatPrice(product.price)}</span>
                </div>

                <div className="stock-section">
                    <div className="stock-display">
                        <span className="stock-quantity">{product.quantity}</span>
                        <span className="stock-label">in stock</span>
                    </div>
                    <span className={`stock-badge ${getStatusColor()}`}>
                        {getStatusLabel()}
                    </span>
                </div>

                {product.reorder_level > 0 && (
                    <div className="reorder-info">
                        <span>Reorder at: {product.reorder_level}</span>
                    </div>
                )}
            </div>

            {product.fsn_classification && (
                <div className={`fsn-badge fsn-${product.fsn_classification.toLowerCase()}`}>
                    {product.fsn_classification === 'F' && 'Fast Moving'}
                    {product.fsn_classification === 'S' && 'Slow Moving'}
                    {product.fsn_classification === 'N' && 'Non-Moving'}
                </div>
            )}
        </div>
    );
};
