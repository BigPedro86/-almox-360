import React, { useState } from 'react';
import { Search, Plus, History } from 'lucide-react';
import HistoryList from '../components/Inventario/HistoryList';
import SetupModal from '../components/Inventario/SetupModal';
import InventoryAuditModal from '../components/Inventario/InventoryAuditModal';
import { useInventory } from '../hooks/useInventory';

const Inventario: React.FC = () => {
  const { cycles, fetchCycles, loading } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <History size={20} className="text-slate-500" />
          Gestão de Inventário e Auditoria
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar por Protocolo ou Responsável..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md transition-all font-semibold text-sm shadow-sm"
          >
            <Plus size={16} />
            Iniciar Inventário / Implantação
          </button>
        </div>
      </div>

      <HistoryList cycles={cycles as any} />

      <InventoryAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onFinished={fetchCycles}
      />
    </div>
  );
};

export default Inventario;
