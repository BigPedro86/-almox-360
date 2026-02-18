
import { useState, useEffect, useCallback } from 'react';
import { Requisition, RequisitionStatus } from '../types';
import { apiClient } from '../services/apiClient';

interface UseRequisitionsReturn {
    requisitions: Requisition[];
    loading: boolean;
    error: string | null;
    fetchRequisitions: () => Promise<void>;
    createRequisition: (data: Partial<Requisition>) => Promise<void>;
    updateStatus: (id: string, action: 'submit' | 'approve' | 'fulfill' | 'return' | 'reject', data?: any) => Promise<void>;
}

export const useRequisitions = (): UseRequisitionsReturn => {
    const [requisitions, setRequisitions] = useState<Requisition[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRequisitions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiClient.requisitions.getAll();
            setRequisitions(data);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar requisições');
        } finally {
            setLoading(false);
        }
    }, []);

    const createRequisition = async (data: Partial<Requisition>) => {
        setLoading(true);
        setError(null);
        try {
            // Logic for ID/Number generation ideally sits in backend, recreating mock logic here or delegating to API
            // Since apiClient.create handles "mock" backend logic, we just pass data
            await apiClient.requisitions.create(data);
            await fetchRequisitions(); // Refresh list
        } catch (err: any) {
            setError(err.message || 'Erro ao criar requisição');
            throw err; // Re-throw to let component handle specific UI feedback if needed
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, action: 'submit' | 'approve' | 'fulfill' | 'return' | 'reject', data?: any) => {
        setLoading(true);
        setError(null);
        try {
            if (action === 'submit') await apiClient.requisitions.submit(id);
            if (action === 'approve') await apiClient.requisitions.approve(id);
            if (action === 'fulfill') await apiClient.requisitions.fulfill(id, data);
            if (action === 'return') await apiClient.requisitions.returnItems(id, data);
            if (action === 'reject') await apiClient.requisitions.reject(id, data);
            await fetchRequisitions();
        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar status');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch on mount
    useEffect(() => {
        fetchRequisitions();
    }, [fetchRequisitions]);

    return {
        requisitions,
        loading,
        error,
        fetchRequisitions,
        createRequisition,
        updateStatus
    };
};
