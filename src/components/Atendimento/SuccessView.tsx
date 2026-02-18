
import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessView: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] animate-in zoom-in-95">
            <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/40">
                <CheckCircle size={56} strokeWidth={2.5} className="animate-float" />
            </div>
            <h2 className="text-3xl font-black tracking-tight">Fluxo Concluído!</h2>
            <p className="text-slate-500 font-medium max-w-sm text-center mt-2">As baixas de estoque por lote foram processadas e o status da requisição atualizado.</p>
        </div>
    );
};

export default SuccessView;
