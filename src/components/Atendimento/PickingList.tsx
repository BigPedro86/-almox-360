
import React from 'react';
import { Truck, Search, Package, Hash, ChevronRight } from 'lucide-react';
import { Requisition } from '../../types';

interface PickingListProps {
    requisitions: Requisition[];
    onSelect: (req: Requisition) => void;
}

const PickingList: React.FC<PickingListProps> = ({ requisitions, onSelect }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Truck size={20} className="text-slate-500" />
                    Painel de Picking & Expedição
                </h2>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Filtro rápido..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase text-xs font-bold border-b border-slate-200 dark:border-slate-600">
                            <tr>
                                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Documento</th>
                                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Data</th>
                                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Solicitante / Setor</th>
                                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600 text-center">Itens</th>
                                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600 text-center">Prioridade</th>
                                <th className="px-4 py-3 text-center w-32">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {requisitions.length > 0 ? requisitions.map((req, idx) => (
                                <tr key={req.id} className={`${idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}>
                                    <td className="px-4 py-2 font-mono font-bold text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <Hash size={14} className="text-slate-400" />
                                            <span>{req.number}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-700 text-xs">{req.date}</td>
                                    <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-700">
                                        <div className="font-semibold text-slate-700 dark:text-slate-200">{req.requesterName}</div>
                                        <div className="text-xs text-slate-500 uppercase">{req.sector}</div>
                                    </td>
                                    <td className="px-4 py-2 text-center border-r border-slate-200 dark:border-slate-700 font-mono">
                                        {req.items.length}
                                    </td>
                                    <td className="px-4 py-2 text-center border-r border-slate-200 dark:border-slate-700">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${req.priority === 'URGENTE' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                                                req.priority === 'ALTA' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                    'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                            {req.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <button
                                            onClick={() => onSelect(req)}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded text-xs font-bold transition-all uppercase shadow-sm"
                                        >
                                            Separar <ChevronRight size={14} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">
                                        <Package className="mx-auto text-slate-300 mb-2" size={32} />
                                        Nenhuma requisição aguardando separação.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PickingList;
