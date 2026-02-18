
import React from 'react';
import { Truck, Search, Package, Hash, ChevronRight, ClipboardCheck } from 'lucide-react';

interface Cycle {
    id: number;
    date: string;
    items: number;
    diff: number;
    status: string;
    responsible: string;
}

interface HistoryListProps {
    cycles: Cycle[];
}

const HistoryList: React.FC<HistoryListProps> = ({ cycles }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <ClipboardCheck size={20} className="text-slate-500" />
                    Histórico de Ciclos
                </h2>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase text-xs font-bold border-b border-slate-200 dark:border-slate-600">
                        <tr>
                            <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600 w-32">Protocolo</th>
                            <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Data Execução</th>
                            <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Responsável</th>
                            <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600 text-center">Itens Auditados</th>
                            <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600 text-center">Divergências</th>
                            <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600 text-center">Status</th>
                            <th className="px-4 py-3 text-center w-24">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {cycles.map((cycle, idx) => (
                            <tr key={cycle.id} className={`${idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}>
                                <td className="px-4 py-2 font-mono font-bold text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                                    #{cycle.id}/2024
                                </td>
                                <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-700 text-xs">{cycle.date}</td>
                                <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-700 text-xs uppercase">{cycle.responsible}</td>
                                <td className="px-4 py-2 text-center border-r border-slate-200 dark:border-slate-700">{cycle.items}</td>
                                <td className="px-4 py-2 text-center border-r border-slate-200 dark:border-slate-700 font-bold">
                                    <span className={cycle.diff > 0 ? 'text-rose-600' : 'text-emerald-600'}>{cycle.diff}</span>
                                </td>
                                <td className="px-4 py-2 text-center border-r border-slate-200 dark:border-slate-700">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-emerald-100 text-emerald-700 border-emerald-200">
                                        {cycle.status}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <button
                                        onClick={() => alert(`Detalhes do ciclo #${cycle.id} serão abertos aqui.`)}
                                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-blue-600 transition-colors"
                                        title="Ver Detalhes"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {cycles.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm">Nenhum histórico disponível.</div>
                )}
            </div>
        </div>
    );
};

export default HistoryList;
