/**
 * Product type matching the Firestore document structure
 */
export interface Product {
    id: string;
    name: string;
    sku: string | null;
    category: string | null;
    price: number;
    quantity: number;
    barcode: string | null;
    purchase_price: number;
    wholesale_price: number;
    reorder_level: number;
    max_stock: number | null;
    last_sale_date: string | null;
    fsn_classification: 'F' | 'S' | 'N' | null;
    updated_at: string;
    synced_at?: { seconds: number; nanoseconds: number };
}

/**
 * Stock level status for visual indicators
 */
export type StockStatus = 'critical' | 'low' | 'adequate' | 'overstocked';

/**
 * Get the stock status based on quantity and reorder level
 */
export const getStockStatus = (product: Product): StockStatus => {
    const { quantity, reorder_level, max_stock } = product;

    if (quantity <= 0) return 'critical';
    if (quantity <= reorder_level) return 'low';
    if (max_stock && quantity > max_stock) return 'overstocked';
    return 'adequate';
};
