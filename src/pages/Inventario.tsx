import React, { useState } from 'react';
import { Search, Plus, History } from 'lucide-react';
import HistoryList from '../components/Inventario/HistoryList';
import SetupModal from '../components/Inventario/SetupModal';
import { useInventory } from '../hooks/useInventory';

const Inventario: React.FC = () => {
  const { cycles, startCycle, loading } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStartInventory = async () => {
    try {
      await startCycle({
        date: new Date().toISOString().split('T')[0],
        responsible: 'Admin Master', // Simulated current user
        items: 0,
        diff: 0,
        status: 'EM ANDAMENTO'
      });
      setIsModalOpen(false);
    } catch (err) {
      alert("Erro ao iniciar ciclo.");
    }
  };

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
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-all font-semibold text-sm shadow-sm"
          >
            <Plus size={16} />
            Novo Ciclo
          </button>
        </div>
      </div>

      <HistoryList cycles={cycles as any} />
      {/* Assuming HistoryList types might mismatch slightly (number vs string id), but generally compatible. Cast to any if needed or fix types later. */}

      <SetupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleStartInventory}
      />
    </div>
  );
};

export default Inventario;
