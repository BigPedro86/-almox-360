
import React from 'react';
import { Calendar, MapPin, User, ChevronRight } from 'lucide-react';
import { Requisition } from '../../types';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../constants';

interface RequisitionCardProps {
    requisition: Requisition;
    onClick: (req: Requisition) => void;
}

const RequisitionCard: React.FC<RequisitionCardProps> = ({ requisition, onClick }) => {
    return (
        <div
            onClick={() => onClick(requisition)}
            className="group bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:shadow-tech transition-all border-l-4 cursor-pointer"
            style={{ borderLeftColor: requisition.status === 'APROVADO' ? '#06b6d4' : '#3b82f6' }}
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase">REQ #{requisition.number}/{requisition.year}</h3>
                        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border border-current ${STATUS_COLORS[requisition.status]}`}>
                            {requisition.status}
                        </span>
                        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${PRIORITY_COLORS[requisition.priority]}`}>
                            {requisition.priority}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-blue-500" />
                            {requisition.sector}
                        </div>
                        <div className="flex items-center gap-2">
                            <User size={16} className="text-blue-500" />
                            {requisition.requesterName}
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-blue-500" />
                            {requisition.date}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden lg:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens</p>
                        <p className="font-bold text-lg">{requisition.items.length}</p>
                    </div>
                    <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-all">
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequisitionCard;
