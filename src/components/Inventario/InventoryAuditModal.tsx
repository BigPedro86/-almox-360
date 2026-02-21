import React, { useState, useEffect } from 'react';
import { Search, Save, X, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { Item } from '../../types';

interface InventoryAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFinished: () => void;
}

const InventoryAuditModal: React.FC<InventoryAuditModalProps> = ({ isOpen, onClose, onFinished }) => {
    const [items, setItems] = useState<Item[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadItems();
        }
    }, [isOpen]);

    const loadItems = async () => {
        setLoading(true);
        try {
            const data = await apiClient.items.getAll();
            setItems(data);
            // Initialize counts with current stock
            const initialCounts: Record<string, number> = {};
            data.forEach(item => {
                initialCounts[item.id] = item.currentStock || 0;
            });
            setCounts(initialCounts);
        } catch (err) {
            alert("Erro ao carregar itens para inventário.");
        } finally {
            setLoading(false);
        }
    };

    const handleCountChange = (itemId: string, value: string) => {
        setCounts(prev => ({ ...prev, [itemId]: Number(value) }));
    };

    const handleSaveInventory = async () => {
        if (!window.confirm("Isso atualizará o estoque real de TODOS os itens listados. Confirma?")) return;

        setSaving(true);
        try {
            // Update each item that has a different count
            for (const item of items) {
                const newQty = counts[item.id];
                if (newQty !== item.currentStock) {
                    await apiClient.items.update(item.id, { currentStock: newQty });
                }
            }

            // Create an inventory record
            await apiClient.inventory.create({
                name: `Inventário de Implantação - ${new Date().toLocaleDateString()}`,
                status: 'CONCLUÍDO',
                counts: counts as any
            });

            onFinished();
            onClose();
        } catch (err) {
            alert("Erro ao salvar inventário. Verifique sua conexão.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-lg shadow-xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Package size={18} className="text-blue-500" />
                            Inventário de Implantação (Ajuste de Saldo)
                        </h3>
                        <p className="text-xs text-slate-500">Insira a quantidade física encontrada no almoxarifado</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-10 text-slate-500">Carregando itens...</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-white dark:bg-slate-900 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="text-left py-2">Código/SKU</th>
                                    <th className="text-left py-2">Descrição</th>
                                    <th className="text-center py-2">Saldo Atual (Sist.)</th>
                                    <th className="text-center py-2 w-32">Quantidade Real</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {items.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="py-3 font-mono text-xs">{item.code}</td>
                                        <td className="py-3 font-medium">{item.description}</td>
                                        <td className="py-3 text-center text-slate-400">{item.currentStock || 0}</td>
                                        <td className="py-3">
                                            <input
                                                type="number"
                                                min="0"
                                                value={counts[item.id]}
                                                onChange={(e) => handleCountChange(item.id, e.target.value)}
                                                className="w-full p-2 text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded font-bold text-blue-700 dark:text-blue-400 focus:ring-1 focus:ring-blue-500 outline-none"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                        <AlertTriangle size={16} />
                        <span className="text-[10px] font-bold uppercase italic">Atenção: Os saldos serão sobrescritos.</span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-semibold">Cancelar</button>
                        <button
                            onClick={handleSaveInventory}
                            disabled={saving || items.length === 0}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-md text-sm font-semibold hover:bg-emerald-700 flex items-center gap-2 shadow-sm disabled:opacity-50"
                        >
                            <CheckCircle2 size={16} />
                            {saving ? 'Atualizando Estoque...' : 'Concluir Implantação'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryAuditModal;
