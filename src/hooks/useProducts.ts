import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import type { Product } from '../types';

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, 'products'), orderBy('name', 'asc'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const productList: Product[] = [];
                snapshot.forEach((doc) => {
                    productList.push({
                        id: doc.id,
                        ...doc.data()
                    } as Product);
                });
                setProducts(productList);
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error('Error fetching products:', err);
                setError('Failed to load products. Please check your connection.');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { products, loading, error };
};
