
import React from 'react';
import { History, Plus } from 'lucide-react';

interface InventoryHeaderProps {
    onStartNew: () => void;
}

const InventoryHeader: React.FC<InventoryHeaderProps> = ({ onStartNew }) => {
    return (
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-between bg-white/50 dark:bg-slate-900/30 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-tech">
            <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-fuchsia-600/10 text-fuchsia-600 rounded-[22px] flex items-center justify-center shadow-inner">
                    <History size={32} />
                </div>
                <div>
                    <h2 className="text-3xl font-black tracking-tight uppercase">Inventário Ciclo</h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mt-1">Sincronização Física x Sistema</p>
                </div>
            </div>
            <button
                onClick={onStartNew}
                className="w-full sm:w-auto px-12 py-5 bg-fuchsia-600 text-white font-black rounded-2xl shadow-2xl shadow-fuchsia-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 tracking-widest text-xs"
            >
                <Plus size={22} strokeWidth={3} />
                INICIAR NOVA CONTAGEM
            </button>
        </div>
    );
};

export default InventoryHeader;
