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
    const [prices, setPrices] = useState<Record<string, number>>({});
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

            const initialCounts: Record<string, number> = {};
            const initialPrices: Record<string, number> = {};

            data.forEach(item => {
                initialCounts[item.id] = item.currentStock || 0;
                initialPrices[item.id] = item.price || 0;
            });

            setCounts(initialCounts);
            setPrices(initialPrices);
        } catch (err) {
            alert("Erro ao carregar itens para inventário.");
        } finally {
            setLoading(false);
        }
    };

    const handleCountChange = (itemId: string, value: string) => {
        setCounts(prev => ({ ...prev, [itemId]: Number(value) }));
    };

    const handlePriceChange = (itemId: string, value: string) => {
        setPrices(prev => ({ ...prev, [itemId]: Number(value) }));
    };

    const handleSaveInventory = async () => {
        if (!window.confirm("Isso atualizará o estoque e o CUSTO de TODOS os itens listados. Confirma?")) return;

        setSaving(true);
        try {
            for (const item of items) {
                const newQty = counts[item.id];
                const newPrice = prices[item.id];

                if (newQty !== item.currentStock || newPrice !== item.price) {
                    await apiClient.items.update(item.id, {
                        currentStock: newQty,
                        price: newPrice
                    });
                }
            }

            await apiClient.inventory.create({
                name: `Implantação de Saldo e Custos - ${new Date().toLocaleDateString()}`,
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
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-lg shadow-xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-blue-600/10 text-blue-600 rounded-xl">
                            <Package size={22} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
                                Implantação de Saldo Inicial e Custos
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">Defina a quantidade e o custo unitário atual para sincronizar o sistema</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-20 text-slate-500">
                            <div className="animate-spin inline-block w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full mb-4"></div>
                            <p className="font-medium">Carregando catálogo de materiais...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="m-6 text-center py-20 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <Package size={48} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-600 dark:text-slate-400 font-bold">Nenhum item encontrado.</p>
                            <p className="text-sm text-slate-500 mt-2">Cadastre seus itens antes de iniciar a implantação.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm border-separate border-spacing-0">
                            <thead className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-500 uppercase text-[11px] font-black tracking-widest border-b border-slate-100 dark:border-slate-800">
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                    <th className="text-left py-4 px-6 border-b border-slate-100 dark:border-slate-800 w-[150px]">Código/SKU</th>
                                    <th className="text-left py-4 px-2 border-b border-slate-100 dark:border-slate-800">Descrição</th>
                                    <th className="text-center py-4 px-4 border-b border-slate-100 dark:border-slate-800 w-[120px]">Saldo Atual</th>
                                    <th className="text-center py-4 px-4 border-b border-slate-100 dark:border-slate-800 w-[160px]">Nova Qtd. Real</th>
                                    <th className="text-center py-4 px-6 border-b border-slate-100 dark:border-slate-800 w-[180px]">Custo Unit. (R$)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {items.map(item => (
                                    <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-4 px-6 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{item.code}</td>
                                        <td className="py-4 px-2 font-medium text-slate-600 dark:text-slate-400">{item.description}</td>
                                        <td className="py-4 px-4 text-center">
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-mono text-xs text-slate-500">
                                                {item.currentStock || 0}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <input
                                                type="number"
                                                min="0"
                                                value={counts[item.id]}
                                                onChange={(e) => handleCountChange(item.id, e.target.value)}
                                                className="w-full p-2.5 text-center bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-black text-blue-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                            />
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600/50">R$</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={prices[item.id]}
                                                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                                    className="w-full p-2.5 pl-8 text-right bg-white dark:bg-slate-800 border-2 border-emerald-200/50 dark:border-emerald-900/30 border-dashed hover:border-solid rounded-xl font-black text-emerald-600 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                                />
                                            </div>
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
