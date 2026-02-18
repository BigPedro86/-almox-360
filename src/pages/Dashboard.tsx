
import React, { useState, useEffect } from 'react';
import { Truck, Package, ShoppingCart, Users, ArrowUpRight, ArrowDownLeft, AlertCircle, FileText, Clock } from 'lucide-react';
import { useItems } from '../hooks/useItems';
import { useRequisitions } from '../hooks/useRequisitions';
import { useReceipts } from '../hooks/useReceipts';

const Dashboard: React.FC = () => {
  const { items, loading: loadingItems } = useItems();
  const { requisitions, loading: loadingReqs } = useRequisitions();
  const { receipts, loading: loadingReceipts } = useReceipts();

  const totalItems = items.length;
  const lowStockItems = items.filter(i => (i.currentStock || 0) <= i.minStock).length;
  const pendingReqs = requisitions.filter(r => ['ENVIADO', 'APROVADO', 'EM_ATENDIMENTO'].includes(r.status)).length;
  const stockValue = items.reduce((acc, i) => acc + ((i.currentStock || 0) * 10), 0); // Mock cost 10

  // Merge and Sort Activity
  const movements = [
    ...receipts.map(r => ({
      date: r.date,
      type: 'ENTRADA',
      doc: r.doc,
      // Mock item name since receipts currently store only basic info or we need to look up.
      // Assuming for now receipts have 'itemSku' or similar from recent refactor or we use a fallback
      product: (r as any).itemSku || 'Material Diversos',
      qty: r.items || 0
    })),
    ...requisitions.filter(r => r.status === 'ATENDIDO' || r.status === 'ENTREGUE').map(r => ({
      date: r.date,
      type: 'SAÍDA',
      doc: `REQ-${r.number}`,
      // Taking first item as representative for dashboard summary
      product: r.items?.[0]?.description || 'Vários Itens',
      qty: r.items?.reduce((sum, i) => sum + i.fulfilledQty, 0) || 0
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const stats = [
    {
      label: 'Valor em Estoque',
      value: `R$ ${stockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: <Package className="text-blue-600" size={24} />,
      color: 'border-l-4 border-blue-600'
    },
    {
      label: 'Requisições Pendentes',
      value: pendingReqs,
      icon: <ShoppingCart className="text-amber-500" size={24} />,
      color: 'border-l-4 border-amber-500'
    },
    {
      label: 'Alertas de Reposição',
      value: lowStockItems,
      icon: <AlertCircle className="text-rose-600" size={24} />,
      color: 'border-l-4 border-rose-600'
    },
    {
      label: 'Total de SKUs',
      value: totalItems,
      icon: <Truck className="text-emerald-600" size={24} />,
      color: 'border-l-4 border-emerald-600'
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/** Keep existing stats but maybe update labels if needed **/}
        {stats.map((stat, idx) => (
          <div key={idx} className={`bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 ${stat.color}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-2">{loadingItems || loadingReqs ? '...' : stat.value}</h3>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Requisitions Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <FileText className="text-blue-500" size={20} />
            Status das Requisições
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Rascunhos', count: requisitions.filter(r => r.status === 'RASCUNHO').length, color: 'bg-slate-100 text-slate-600' },
              { label: 'Aguardando Aprovação', count: requisitions.filter(r => r.status === 'ENVIADO').length, color: 'bg-blue-100 text-blue-700' },
              { label: 'Aprovadas / Em Separação', count: requisitions.filter(r => ['APROVADO', 'SEPARACAO', 'EM_ATENDIMENTO'].includes(r.status)).length, color: 'bg-indigo-100 text-indigo-700' },
              { label: 'Entregues', count: requisitions.filter(r => r.status === 'ENTREGUE').length, color: 'bg-emerald-100 text-emerald-700' },
              { label: 'Reprovadas / Devolvidas', count: requisitions.filter(r => ['REPROVADO', 'DEVOLVIDO'].includes(r.status)).length, color: 'bg-rose-100 text-rose-700' },
            ].map((status, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-md bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{status.label}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${status.color}`}>
                  {status.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Requisitions Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Clock className="text-blue-500" size={20} />
              Últimas Requisições
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">Número</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Solicitante</th>
                  <th className="px-6 py-4">Setor</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {requisitions.slice(0, 5).map((req, idx) => (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-3 font-mono font-bold text-blue-600">#{req.number}</td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{req.date}</td>
                    <td className="px-6 py-3 font-medium text-slate-700 dark:text-slate-200">{req.requesterName}</td>
                    <td className="px-6 py-3 text-slate-500 lowercase first-letter:uppercase">{req.sector}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${req.status === 'APROVADO' ? 'bg-cyan-100 text-cyan-700 border-cyan-200' :
                        req.status === 'ENTREGUE' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          req.status === 'RASCUNHO' || req.status === 'ENVIADO' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            req.status === 'REPROVADO' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                              'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {requisitions.length === 0 && (
                  <tr><td colSpan={5} className="p-6 text-center text-slate-400">Nenhuma requisição recente.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ArrowDownLeft className="text-emerald-500" size={20} />
              Últimas Movimentações Estoque
            </h3>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 uppercase">Ver Todas</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Produto / Item</th>
                  <th className="px-6 py-4">Documento</th>
                  <th className="px-6 py-4 text-right">Qtd</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {movements.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-slate-400">Nenhuma movimentação recente.</td></tr>
                ) : movements.map((mov, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-3 font-medium text-slate-600 dark:text-slate-300">{new Date(mov.date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${mov.type === 'ENTRADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {mov.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-200">{mov.product}</td>
                    <td className="px-6 py-3 text-slate-500 font-mono text-xs">{mov.doc}</td>
                    <td className="px-6 py-3 text-right font-bold text-slate-700 dark:text-slate-200">{mov.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <AlertCircle className="text-rose-500" size={20} />
              Críticos (Ruptura)
            </h3>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
            {items.filter(i => (i.currentStock || 0) <= i.minStock).slice(0, 5).map(item => (
              <div key={item.id} className="mb-4 p-4 border-l-4 border-rose-500 bg-rose-50 dark:bg-rose-900/10 rounded-r-md">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.description}</h4>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-slate-500">Mín: <strong>{item.minStock}</strong></span>
                  <span className="text-rose-600 font-bold">Atual: {item.currentStock || 0}</span>
                </div>
              </div>
            ))}
            {items.filter(i => (i.currentStock || 0) <= i.minStock).length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm">Nenhum item crítico no momento.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
