import React, { useState } from 'react';
import { Send, CheckCircle, X, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Requisition, RequisitionStatus } from '../../types';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../constants';

interface RequisitionDetailModalProps {
    requisition: Requisition | null;
    onClose: () => void;
    onUpdateStatus: (id: string, action: 'submit' | 'approve' | 'reject' | 'fulfill') => Promise<void>;
    onOpenReturn?: () => void;
    showReturnButton?: boolean;
}

const RequisitionDetailModal: React.FC<RequisitionDetailModalProps> = ({ requisition, onClose, onUpdateStatus, onOpenReturn, onOpenFulfill, showReturnButton }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    if (!requisition) return null;

    const handleStatusUpdate = async (id: string, action: 'submit' | 'approve' | 'reject' | 'fulfill') => {
        setLoading(true);
        try {
            await onUpdateStatus(id, action);
            onClose();
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-lg shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Requisição</span>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">#{requisition.number}/{requisition.year}</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                        <div className="flex-1">
                            <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</span>
                            <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${STATUS_COLORS[requisition.status]}`}>
                                {requisition.status}
                            </span>
                        </div>
                        <div className="flex-1">
                            <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Prioridade</span>
                            <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${PRIORITY_COLORS[requisition.priority]}`}>
                                {requisition.priority}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-3">Itens Solicitados</h4>
                        <div className="space-y-2">
                            {requisition.items.length > 0 ? requisition.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.description}</span>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-blue-600">{item.requestedQty} {item.unit}</div>
                                        {item.returnedQty ? (
                                            <div className="text-xs text-orange-500 font-semibold">Devolvido: {item.returnedQty}</div>
                                        ) : null}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-4 text-slate-400 text-sm italic border border-dashed border-slate-200 dark:border-slate-700 rounded-md">
                                    Nenhum item adicionado.
                                </div>
                            )}
                        </div>
                    </div>

                    {requisition.observations && (
                        <div>
                            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Observações</h4>
                            <p className="text-sm p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 italic">
                                "{requisition.observations}"
                            </p>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/30">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-semibold transition-colors">Fechar</button>

                    {showReturnButton && onOpenReturn && (
                        <button
                            onClick={onOpenReturn}
                            className="px-4 py-2 bg-orange-100 text-orange-700 border border-orange-200 rounded-md text-sm font-semibold flex items-center gap-2 hover:bg-orange-200 transition-all shadow-sm"
                        >
                            Devolver Itens
                        </button>
                    )}

                    {requisition.status === RequisitionStatus.RASCUNHO && (
                        <button
                            disabled={loading}
                            onClick={() => handleStatusUpdate(requisition.id, 'submit')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
                        >
                            <Send size={16} /> Enviar p/ Aprovação
                        </button>
                    )}
                    {requisition.status === RequisitionStatus.ENVIADO && (['APROVADOR', 'ADMIN', 'MASTER'].includes(user?.role || '')) && (
                        <div className="flex gap-3">
                            <button
                                disabled={loading}
                                onClick={() => handleStatusUpdate(requisition.id, 'reject')}
                                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-semibold flex items-center gap-2 hover:bg-red-700 transition-all shadow-sm disabled:opacity-50"
                            >
                                <X size={16} /> Reprovar
                            </button>
                            <button
                                disabled={loading}
                                onClick={() => handleStatusUpdate(requisition.id, 'approve')}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
                            >
                                <CheckCircle size={16} /> Aprovar Requisição
                            </button>
                        </div>
                    )}

                    {['APROVADO', 'EM_ATENDIMENTO'].includes(requisition.status) && (['ALMOXARIFE', 'ADMIN', 'MASTER'].includes(user?.role || '')) && (
                        <button
                            disabled={loading}
                            onClick={onOpenFulfill}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
                        >
                            <Package size={16} /> Confirmar Entrega
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RequisitionDetailModal;
