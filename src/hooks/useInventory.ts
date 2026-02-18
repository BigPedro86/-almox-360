import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

export interface InventoryCycle {
    id: string; // or number, aligning with existing usage
    date: string;
    items: number;
    diff: number;
    status: string;
    responsible: string;
}

interface UseInventoryReturn {
    cycles: InventoryCycle[];
    loading: boolean;
    error: string | null;
    fetchCycles: () => Promise<void>;
    startCycle: (data: Partial<InventoryCycle>) => Promise<void>;
}

export const useInventory = (): UseInventoryReturn => {
    const [cycles, setCycles] = useState<InventoryCycle[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCycles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiClient.inventory.getAll();
            setCycles(data);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar inventários');
        } finally {
            setLoading(false);
        }
    }, []);

    const startCycle = async (data: Partial<InventoryCycle>) => {
        setLoading(true);
        setError(null);
        try {
            await apiClient.inventory.create(data);
            await fetchCycles();
        } catch (err: any) {
            setError(err.message || 'Erro ao iniciar inventário');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCycles();
    }, [fetchCycles]);

    return {
        cycles,
        loading,
        error,
        fetchCycles,
        startCycle
    };
};
