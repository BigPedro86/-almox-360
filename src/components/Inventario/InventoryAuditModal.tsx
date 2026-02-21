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
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Package size={18} className="text-blue-500" />
                            Implantação de Saldo Inicial e Custos
                        </h3>
                        <p className="text-xs text-slate-500">Defina a quantidade e o custo unitário atual dos itens em estoque</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-10 text-slate-500">
                            <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                            <p>Carregando itens...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/20 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <Package size={48} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-600 dark:text-slate-400 font-medium">Nenhum item encontrado no cadastro.</p>
                            <p className="text-xs text-slate-500 mt-1">Cadastre seus itens no menu "Itens" antes de iniciar a implantação.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-white dark:bg-slate-900 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="text-left py-2">Código/SKU</th>
                                    <th className="text-left py-2">Descrição</th>
                                    <th className="text-center py-2">Saldo Sist.</th>
                                    <th className="text-center py-2 w-28">Quantidade Real</th>
                                    <th className="text-center py-2 w-32">Custo Unit. (R$)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {items.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="py-3 font-mono text-xs">{item.code}</td>
                                        <td className="py-3 font-medium">{item.description}</td>
                                        <td className="py-3 text-center text-slate-400">{item.currentStock || 0}</td>
                                        <td className="py-3 px-2">
                                            <input
                                                type="number"
                                                min="0"
                                                value={counts[item.id]}
                                                onChange={(e) => handleCountChange(item.id, e.target.value)}
                                                className="w-full p-2 text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded font-bold text-blue-700 dark:text-blue-400 focus:ring-1 focus:ring-blue-500 outline-none"
                                            />
                                        </td>
                                        <td className="py-3 px-2">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={prices[item.id]}
                                                onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                                className="w-full p-2 text-center bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded font-bold text-emerald-700 dark:text-emerald-400 focus:ring-1 focus:ring-emerald-500 outline-none"
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
