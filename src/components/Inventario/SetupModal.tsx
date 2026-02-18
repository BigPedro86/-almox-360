import React from 'react';
import { X, AlertCircle, Play } from 'lucide-react';

interface SetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const SetupModal: React.FC<SetupModalProps> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-lg shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Setup de Inventário</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md flex items-start gap-3">
                        <AlertCircle className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-xs font-medium text-amber-800 dark:text-amber-200 leading-relaxed">
                            Atenção: Ao iniciar, as movimentações de estoque devem ser suspensas para evitar divergências de leitura em tempo real.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Responsável Técnico</label>
                            <input readOnly value="Admin Master" className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md outline-none text-slate-500 text-sm font-medium" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Filtro de Contagem</label>
                            <select className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-sm">
                                <option>TODO O ESTOQUE</option>
                                <option>MATERIAIS DE ESCRITÓRIO</option>
                                <option>MATERIAIS DE LIMPEZA</option>
                                <option>APENAS ITENS CRÍTICOS</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={onConfirm}
                            className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-md flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-sm text-sm"
                        >
                            <Play size={16} fill="currentColor" />
                            INICIAR CONTAGEM
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetupModal;
