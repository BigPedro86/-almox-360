import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

// Define Receipt type locally if not in types.ts yet, or assume generic for now
export interface Receipt {
    id: string;
    doc: string;
    supplier: string;
    date: string;
    items: number; // Count of items
    status: string;
    // We can expand this later to include detailed items
}

interface UseReceiptsReturn {
    receipts: Receipt[];
    loading: boolean;
    error: string | null;
    fetchReceipts: () => Promise<void>;
    createReceipt: (data: Partial<Receipt>) => Promise<void>;
}

export const useReceipts = (): UseReceiptsReturn => {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReceipts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiClient.receipts.getAll();
            setReceipts(data);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar entradas');
        } finally {
            setLoading(false);
        }
    }, []);

    const createReceipt = async (data: Partial<Receipt>) => {
        setLoading(true);
        setError(null);
        try {
            await apiClient.receipts.create(data);
            await fetchReceipts();
        } catch (err: any) {
            setError(err.message || 'Erro ao criar entrada');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReceipts();
    }, [fetchReceipts]);

    return {
        receipts,
        loading,
        error,
        fetchReceipts,
        createReceipt
    };
};
