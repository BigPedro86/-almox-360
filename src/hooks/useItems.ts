
import { useState, useEffect, useCallback } from 'react';
import { Item } from '../types';
import { apiClient } from '../services/apiClient';

interface UseItemsReturn {
    items: Item[];
    loading: boolean;
    error: string | null;
    fetchItems: () => Promise<void>;
    createItem: (data: Partial<Item>) => Promise<void>;
    updateItem: (id: string, data: Partial<Item>) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    getStockAlerts: () => Promise<Item[]>;
}

export const useItems = (): UseItemsReturn => {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiClient.items.getAll();
            setItems(data);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar itens');
        } finally {
            setLoading(false);
        }
    }, []);

    const createItem = async (data: Partial<Item>) => {
        setLoading(true);
        setError(null);
        try {
            await apiClient.items.create(data);
            await fetchItems();
        } catch (err: any) {
            setError(err.message || 'Erro ao criar item');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateItem = async (id: string, data: Partial<Item>) => {
        setLoading(true);
        setError(null);
        try {
            await apiClient.items.update(id, data);
            await fetchItems();
        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar item');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await apiClient.items.delete(id);
            await fetchItems();
        } catch (err: any) {
            setError(err.message || 'Erro ao excluir item');
            throw err;
        } finally {
            setLoading(false);
        }
    }

    const getStockAlerts = async (): Promise<Item[]> => {
        try {
            return await apiClient.items.getStockAlerts();
        } catch (err: any) {
            console.error("Failed to get stock alerts", err);
            return [];
        }
    };

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    return {
        items,
        loading,
        error,
        fetchItems,
        createItem,
        updateItem,
        deleteItem,
        getStockAlerts
    };
};
