
import React, { useState, useEffect } from 'react';
import { RotateCcw, X, AlertTriangle, Save } from 'lucide-react';
import { Requisition, RequisitionItem } from '../../types';

interface ReturnRequisitionModalProps {
    requisition: Requisition | null;
    onClose: () => void;
    onConfirmReturn: (id: string, items: { itemId: string; qty: number }[], notes: string) => Promise<void>;
}

const ReturnRequisitionModal: React.FC<ReturnRequisitionModalProps> = ({ requisition, onClose, onConfirmReturn }) => {
    const [returnItems, setReturnItems] = useState<{ [key: string]: number }>({});
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (requisition) {
            setReturnItems({});
            setNotes('');
        }
    }, [requisition]);

    if (!requisition) return null;

    const handleQtyChange = (itemId: string, qty: number) => {
        setReturnItems(prev => ({
            ...prev,
            [itemId]: qty
        }));
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const itemsToReturn = Object.entries(returnItems)
                .filter(([_, qty]) => (qty as number) > 0)
                .map(([itemId, qty]) => ({ itemId, qty: qty as number }));

            if (itemsToReturn.length === 0) {
                alert("Selecione pelo menos um item para devolver.");
                setLoading(false);
                return;
            }

            await onConfirmReturn(requisition.id, itemsToReturn, notes);
            onClose();
        } catch (error) {
            console.error("Failed to return items", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter items that have been fulfilled (or requested if we assume full fulfillment for now)
    // We base return on 'requestedQty' as fulfilledQty might not be fully implemented yet in previous steps
    const itemsToDisplay = requisition.items;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-lg shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <RotateCcw className="text-orange-500" size={20} />
                        Devolução de Materiais
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 p-4 rounded-md text-sm text-orange-800 dark:text-orange-200">
                        <p className="font-semibold mb-1">Requisição #{requisition.number}</p>
                        <p>Selecione os itens e as quantidades que deseja devolver ao estoque.</p>
                    </div>

                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                            <tr>
                                <th className="px-4 py-2">Item</th>
                                <th className="px-4 py-2 text-center">Entregue</th>
                                <th className="px-4 py-2 text-center">Já Devolvido</th>
                                <th className="px-4 py-2 text-center w-32">Devolver</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {itemsToDisplay.map((item) => {
                                const maxReturn = (item.fulfilledQty || item.requestedQty) - (item.returnedQty || 0);
                                if (maxReturn <= 0) return null; // Hide items fully returned

                                return (
                                    <tr key={item.itemId}>
                                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                                            {item.description}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {item.fulfilledQty || item.requestedQty} {item.unit}
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-500">
                                            {item.returnedQty || 0} {item.unit}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max={maxReturn}
                                                value={returnItems[item.itemId] || ''}
                                                onChange={(e) => {
                                                    const val = Math.min(Math.max(0, Number(e.target.value)), maxReturn);
                                                    handleQtyChange(item.itemId, val);
                                                }}
                                                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-center focus:ring-1 focus:ring-orange-500 outline-none"
                                                placeholder="0"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Motivo / Observações</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md outline-none min-h-[80px] focus:ring-1 focus:ring-blue-500 text-sm"
                            placeholder="Justifique a devolução..."
                        />
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/30">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-semibold transition-colors">Cancelar</button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-semibold flex items-center gap-2 hover:bg-orange-700 transition-all shadow-sm disabled:opacity-50"
                    >
                        <Save size={16} /> Confirmar Devolução
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReturnRequisitionModal;
