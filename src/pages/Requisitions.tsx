import React, { useState, useEffect } from 'react';
import { Search, Plus, Clock } from 'lucide-react';
import { Requisition } from '../types';
import CreateRequisitionModal from '../components/Requisitions/CreateRequisitionModal';
import RequisitionDetailModal from '../components/Requisitions/RequisitionDetailModal';
import FulfillRequisitionModal from '../components/Requisitions/FulfillRequisitionModal';
import RequisitionCard from '../components/Requisitions/RequisitionCard';
import { useRequisitions } from '../hooks/useRequisitions';

import ReturnRequisitionModal from '../components/Requisitions/ReturnRequisitionModal';

const Requisitions: React.FC = () => {
  const { requisitions, loading: fetching, fetchRequisitions, createRequisition, updateStatus } = useRequisitions();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'TODOS' | 'RASCUNHOS' | 'APROVACAO' | 'ATENDIMENTO' | 'FINALIZADOS'>('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<Requisition | null>(null);

  // Filter
  const filteredRequisitions = requisitions.filter(r => {
    const matchesSearch = r.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.number.includes(searchTerm) ||
      r.requesterName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'TODOS') return true;
    if (activeTab === 'RASCUNHOS') return r.status === 'RASCUNHO';
    if (activeTab === 'APROVACAO') return r.status === 'ENVIADO';
    if (activeTab === 'ATENDIMENTO') return ['APROVADO', 'EM_ATENDIMENTO'].includes(r.status);
    if (activeTab === 'FINALIZADOS') return ['ENTREGUE', 'REPROVADO', 'DEVOLVIDO', 'CANCELADO'].includes(r.status);

    return true;
  });

  const handleCreate = async (data: any) => {
    await createRequisition(data);
    setIsModalOpen(false);
  };

  const handleStatusUpdate = async (id: string, action: 'submit' | 'approve' | 'return' | 'reject' | 'fulfill', payload?: any) => {
    await updateStatus(id, action, payload);
    setSelectedReq(null);
  };

  const handleConfirmReturn = async (id: string, items: any[], notes: string) => {
    await updateStatus(id, 'return', { items, notes });
    setIsReturnModalOpen(false);
    setSelectedReq(null);
  };

  const handleConfirmFulfill = async (id: string, items: { itemId: string; qty: number }[]) => {
    await updateStatus(id, 'fulfill', { items });
    setIsFulfillModalOpen(false);
    setSelectedReq(null);
  };

  // ... (TabButton remains same)
  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon?: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === id
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
        }`}
    >
      {Icon && <Icon size={16} />}
      {label}
    </button>
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">

      {/* ... (Header and Tabs code remains same until RequisitionDetailModal) */}

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Clock size={20} className="text-slate-500" />
          Controle de Requisições
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar Nº, Setor ou Solicitante..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-all font-semibold text-sm shadow-sm"
          >
            <Plus size={16} />
            Nova Requisição
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 rounded-t-md">
        <TabButton id="TODOS" label="Todas" />
        <TabButton id="RASCUNHOS" label="Rascunhos" />
        <TabButton id="APROVACAO" label="Aguardando Aprovação" />
        <TabButton id="ATENDIMENTO" label="Em Atendimento" />
        <TabButton id="FINALIZADOS" label="Finalizadas" />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-b-md border-x border-b border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase text-xs font-bold border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Número</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Data</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Solicitante / Setor</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600 text-center">Prioridade</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600 text-center">Status</th>
                <th className="px-4 py-3 text-center w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {fetching ? (
                <tr><td colSpan={6} className="p-10 text-center"><Clock className="animate-spin inline text-blue-500" /> Carregando...</td></tr>
              ) : filteredRequisitions.map((req, idx) => (
                <tr key={req.id} className={`${idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}>
                  <td className="px-4 py-2 font-mono font-bold text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                    <span className="text-blue-600">#{req.number}</span>
                  </td>
                  <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-700 text-xs">{req.date}</td>
                  <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-700">
                    <div className="font-semibold text-slate-700 dark:text-slate-200">{req.requesterName}</div>
                    <div className="text-xs text-slate-500 uppercase">{req.sector}</div>
                  </td>
                  <td className="px-4 py-2 text-center border-r border-slate-200 dark:border-slate-700">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${req.priority === 'URGENTE' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                      req.priority === 'ALTA' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center border-r border-slate-200 dark:border-slate-700">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${req.status === 'APROVADO' ? 'bg-cyan-100 text-cyan-700 border-cyan-200' :
                      req.status === 'ENTREGUE' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        req.status === 'RASCUNHO' || req.status === 'ENVIADO' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          req.status === 'EM_ATENDIMENTO' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => setSelectedReq(req)}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors uppercase"
                    >
                      Abrir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRequisitions.length === 0 && !fetching && (
            <div className="p-8 text-center text-slate-400 text-sm">Nenhuma requisição encontrada com os filtros atuais.</div>
          )}
        </div>
      </div>

      <CreateRequisitionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />

      <RequisitionDetailModal
        requisition={selectedReq}
        onClose={() => setSelectedReq(null)}
        onUpdateStatus={handleStatusUpdate}
        onOpenReturn={() => {
          if (selectedReq?.status === 'ENTREGUE' || selectedReq?.status === 'EM_ATENDIMENTO') {
            setIsReturnModalOpen(true);
          }
        }}
        onOpenFulfill={() => {
          setIsFulfillModalOpen(true);
        }}
        showReturnButton={selectedReq?.status === 'ENTREGUE' || selectedReq?.status === 'EM_ATENDIMENTO'}
      />

      {isReturnModalOpen && selectedReq && (
        <ReturnRequisitionModal
          requisition={selectedReq}
          onClose={() => setIsReturnModalOpen(false)}
          onConfirmReturn={handleConfirmReturn}
        />
      )}

      {isFulfillModalOpen && selectedReq && (
        <FulfillRequisitionModal
          requisition={selectedReq}
          onClose={() => setIsFulfillModalOpen(false)}
          onConfirmFulfill={handleConfirmFulfill}
        />
      )}
    </div>
  );
};

export default Requisitions;
