import React, { useState } from 'react';
import { ChevronRight, Package, AlertCircle, Loader2, CheckCircle, Calendar, AlertTriangle } from 'lucide-react';
import { Requisition, Batch } from '../../types';

interface PickingDetailProps {
    requisition: Requisition;
    batches: Batch[];
    onBack: () => void;
    onConfirm: () => void;
    isProcessing: boolean;
}

const PickingDetail: React.FC<PickingDetailProps> = ({ requisition, batches, onBack, onConfirm, isProcessing }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <div>
                    <button
                        onClick={onBack}
                        className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-2 flex items-center gap-1"
                    >
                        <ChevronRight size={16} className="rotate-180" />
                        Voltar para lista
                    </button>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        Separação <span className="text-blue-600">REQ #{requisition.number}</span>
                    </h2>
                    <div className="text-sm text-slate-500 mt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <span><strong className="text-slate-700 dark:text-slate-300">Setor:</strong> {requisition.sector}</span>
                        <span className="hidden sm:inline text-slate-300">•</span>
                        <span><strong className="text-slate-700 dark:text-slate-300">Solicitante:</strong> {requisition.requesterName}</span>
                    </div>
                </div>
                <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-semibold">
                        <CheckCircle size={14} />
                        Lote FEFO Priorizado
                    </span>
                </div>
            </div>

            {/* Items List */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <Package className="text-blue-500" size={20} />
                    Itens da Requisição
                </h3>

                <div className="space-y-6">
                    {requisition.items.map((item: any, idx: number) => {
                        const itemBatches = batches.filter(b => b.itemId === item.itemId);
                        const hasStock = itemBatches.length > 0;

                        return (
                            <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                {/* Item Header */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold text-slate-800 dark:text-white text-lg">{item.description}</h4>
                                        <div className="flex gap-3 mt-1 tex-sm">
                                            <span className="text-xs font-medium text-slate-500 px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded">
                                                UN: {item.unit}
                                            </span>
                                            <span className="text-xs font-bold text-blue-600 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded">
                                                Solicitado: {item.requestedQty}
                                            </span>
                                        </div>
                                    </div>
                                    {!hasStock && (
                                        <div className="flex items-center gap-2 text-rose-600 bg-rose-50 dark:bg-rose-900/10 px-3 py-1.5 rounded-md border border-rose-100 dark:border-rose-900/20">
                                            <AlertCircle size={16} />
                                            <span className="text-xs font-bold">Estoque Indisponível</span>
                                        </div>
                                    )}
                                </div>

                                {/* Batches / Lots Content */}
                                <div className="p-4 bg-white dark:bg-slate-800">
                                    {hasStock ? (
                                        <div className="space-y-3">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                                                <Calendar size={14} /> Sugestão de Lotes (FEFO)
                                            </p>

                                            {itemBatches.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate)).map((lot, lIdx) => (
                                                <div
                                                    key={lot.id}
                                                    className={`
                                                        p-3 rounded-md border flex flex-col sm:flex-row items-center gap-4 transition-all
                                                        ${lIdx === 0
                                                            ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30'
                                                            : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-700'}
                                                    `}
                                                >
                                                    <div className="flex-1 w-full">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Lote: {lot.lotNumber}</span>
                                                                {lIdx === 0 && (
                                                                    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                                                                        Prioritário
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-slate-500">
                                                                Validade: <span className={`${lIdx === 0 ? 'text-amber-700 font-bold' : ''}`}>{lot.expiryDate}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-xs text-slate-500">
                                                                Saldo em Lote: <strong>{lot.quantity}</strong>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 w-full sm:w-auto bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 shadow-sm">
                                                        <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Qtd. Separar:</span>
                                                        <input
                                                            type="number"
                                                            className="w-20 px-2 py-1 bg-transparent border-b-2 border-slate-200 focus:border-blue-500 outline-none text-center font-bold text-slate-700 dark:text-white"
                                                            defaultValue={Math.min(lot.quantity, item.requestedQty)}
                                                            max={lot.quantity}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded border border-dashed border-slate-200 dark:border-slate-700">
                                            <AlertTriangle className="mx-auto mb-2 opacity-50" size={24} />
                                            <p className="text-sm">Nenhum lote disponível para este item.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                    onClick={onBack}
                    disabled={isProcessing}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-md text-sm font-semibold transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-semibold shadow-sm flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    Confirmar Entrega
                </button>
            </div>
        </div>
    );
};

export default PickingDetail;
