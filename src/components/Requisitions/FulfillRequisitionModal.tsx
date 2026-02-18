
import React, { useState, useEffect } from 'react';
import { PackageCheck, X, Save } from 'lucide-react';
import { Requisition } from '../../types';

interface FulfillRequisitionModalProps {
    requisition: Requisition | null;
    onClose: () => void;
    onConfirmFulfill: (id: string, items: { itemId: string; qty: number }[]) => Promise<void>;
}

const FulfillRequisitionModal: React.FC<FulfillRequisitionModalProps> = ({ requisition, onClose, onConfirmFulfill }) => {
    const [fulfillItems, setFulfillItems] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (requisition) {
            // Default to remaining quantity
            const initial: { [key: string]: number } = {};
            requisition.items.forEach(item => {
                const remaining = item.requestedQty - (item.fulfilledQty || 0);
                if (remaining > 0) {
                    initial[item.itemId] = remaining;
                }
            });
            setFulfillItems(initial);
        }
    }, [requisition]);

    if (!requisition) return null;

    const handleQtyChange = (itemId: string, qty: number, max: number) => {
        setFulfillItems(prev => ({
            ...prev,
            [itemId]: Math.min(Math.max(0, qty), max)
        }));
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const itemsToFulfill = Object.entries(fulfillItems)
                .filter(([_, qty]) => (qty as number) > 0)
                .map(([itemId, qty]) => ({ itemId, qty }));

            if (itemsToFulfill.length === 0) {
                alert("Selecione pelo menos um item para entregar.");
                setLoading(false);
                return;
            }

            await onConfirmFulfill(requisition.id, itemsToFulfill);
            onClose();
        } catch (error) {
            console.error("Failed to fulfill items", error);
            alert("Erro ao confirmar entrega.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-lg shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <PackageCheck className="text-emerald-600" size={20} />
                        Atendimento de Requisição
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-md text-sm text-emerald-800 dark:text-emerald-200">
                        <p className="font-semibold mb-1">Requisição #{requisition.number}</p>
                        <p>Confirme as quantidades que serão entregues ao requisitante. O estoque será atualizado automaticamente.</p>
                    </div>

                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                            <tr>
                                <th className="px-4 py-2">Item</th>
                                <th className="px-4 py-2 text-center">Solicitado</th>
                                <th className="px-4 py-2 text-center">Já Entregue</th>
                                <th className="px-4 py-2 text-center w-32">Entregar Agora</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {requisition.items.map((item) => {
                                const remaining = item.requestedQty - (item.fulfilledQty || 0);
                                if (remaining <= 0) return null; // Hide fully fulfilled items

                                return (
                                    <tr key={item.itemId}>
                                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                                            {item.description}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {item.requestedQty} {item.unit}
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-500">
                                            {item.fulfilledQty || 0} {item.unit}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max={remaining}
                                                value={fulfillItems[item.itemId] || ''}
                                                onChange={(e) => handleQtyChange(item.itemId, Number(e.target.value), remaining)}
                                                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-center focus:ring-1 focus:ring-emerald-500 outline-none"
                                                placeholder="0"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/30">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-semibold transition-colors">Cancelar</button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
                    >
                        <Save size={16} /> Confirmar Entrega
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FulfillRequisitionModal;
