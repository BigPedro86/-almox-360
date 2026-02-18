import React, { useState } from 'react';
import { BarChart3, Printer, FileSpreadsheet, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { useRequisitions } from '../hooks/useRequisitions';
import { useItems } from '../hooks/useItems';

const Relatorios: React.FC = () => {
  const { requisitions, loading: reqLoading } = useRequisitions();
  const { items, loading: itemsLoading } = useItems();
  const [activeReport, setActiveReport] = useState<{ title: string; columns: string[]; rows: any[][] } | null>(null);

  const loading = reqLoading || itemsLoading;

  const reports = [
    { id: 'mov', title: 'Movimentação Completa', desc: 'Relação de todas as requisições e seus status no período.', icon: <BarChart3 /> },
    { id: 'stock', title: 'Posição de Estoque', desc: 'Inventário atual com saldos, valores e localização.', icon: <FileSpreadsheet /> },
    { id: 'low_stock', title: 'Ponto de Pedido (Ruptura)', desc: 'Itens que atingiram o estoque mínimo e precisam de reposição.', icon: <BarChart3 /> },
  ];

  const handleGenerate = (id: string) => {
    let columns: string[] = [];
    let rows: any[][] = [];
    let title = '';

    if (id === 'mov') {
      title = 'Relatório de Movimentação de Requisições';
      columns = ['Nº', 'Data', 'Solicitante', 'Setor', 'Status', 'Prioridade', 'Qtd. Itens'];
      rows = [...requisitions]
        .sort((a, b) => String(a.number).localeCompare(String(b.number), undefined, { numeric: true }))
        .map(r => [
          r.number,
          r.date,
          r.requesterName,
          r.sector,
          r.status,
          r.priority,
          r.items.length
        ]);
    } else if (id === 'stock') {
      title = 'Posição Geral de Estoque';
      columns = ['Código', 'Descrição', 'UM', 'Saldo Atual', 'Mínimo', 'Máximo', 'Local'];
      rows = items.map(i => [
        i.code,
        i.description,
        i.unit,
        i.currentStock || 0,
        i.minStock,
        i.maxStock,
        i.defaultAddress || '-'
      ]);
    } else if (id === 'low_stock') {
      title = 'Relatório de Ruptura / Ponto de Pedido';
      columns = ['Código', 'Descrição', 'Saldo Atual', 'Estoque Mínimo', 'Déficit'];
      rows = items
        .filter(i => (i.currentStock || 0) <= i.minStock)
        .map(i => [
          i.code,
          i.description,
          i.currentStock || 0,
          i.minStock,
          i.minStock - (i.currentStock || 0)
        ]);
    }

    setActiveReport({ title, columns, rows });
  };

  if (activeReport) {
    return (
      <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-in fade-in duration-300">
        <div className="max-w-[210mm] mx-auto min-h-screen bg-white p-8 print:p-0">
          {/* Print Controls - Hidden when printing */}
          <div className="flex justify-between mb-8 print:hidden sticky top-0 bg-white/95 backdrop-blur py-4 border-b border-slate-200 z-10">
            <button
              onClick={() => setActiveReport(null)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold px-4 py-2 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeft size={20} /> Voltar
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md font-bold hover:bg-blue-700 shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <Printer size={20} /> Imprimir / Salvar PDF
            </button>
          </div>

          {/* Renaming Doc Title for PDF file name */}
          <title>{activeReport.title}</title>


          {/* Report Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b-2 border-slate-800 pb-6">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <img
                src="/logo.png"
                alt="Logo Orsi"
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight">COMÉRCIO E INDÚSTRIA ORSI LTDA</h1>
                <p className="text-sm font-bold text-slate-700">CNPJ: 51.423.358/0001-68</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Sistema Almox-360º • Gestão de Estoque</p>
              </div>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <p className="text-lg font-bold text-slate-800 uppercase tracking-tight">{activeReport.title}</p>
              <div className="text-xs text-slate-500 mt-1 flex flex-col sm:items-end">
                <span>Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</span>
                <span>Página 1 de 1</span>
              </div>
            </div>
          </div>

          {/* Report Table */}
          <table className="w-full text-left text-xs border-collapse font-medium">
            <thead>
              <tr className="bg-slate-100 print:bg-slate-100/50 border-b border-slate-300">
                {activeReport.columns.map((col, idx) => (
                  <th key={idx} className="py-3 px-2 font-bold text-slate-800 uppercase tracking-wide">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeReport.rows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-slate-100 break-inside-avoid hover:bg-slate-50 print:hover:bg-transparent">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2 px-2 text-slate-600">{cell}</td>
                  ))}
                </tr>
              ))}
              {activeReport.rows.length === 0 && (
                <tr>
                  <td colSpan={activeReport.columns.length} className="py-8 text-center text-slate-400 italic">
                    Nenhum registro encontrado para este relatório.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Report Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 uppercase tracking-widest print:fixed print:bottom-4 print:left-0 print:right-0">
            <p>Orsi Alimentos • Documento Gerado Eletronicamente</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <FileText size={20} className="text-slate-500" />
          Central de Relatórios
        </h2>
        {loading && <div className="flex items-center gap-2 text-sm text-blue-500 font-medium"><Loader2 className="animate-spin" size={16} /> Atualizando dados...</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-white dark:bg-slate-800 p-6 rounded-md border border-slate-200 dark:border-slate-700 hover:border-blue-500 shadow-sm transition-all group flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {report.icon}
              </div>
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-2">{report.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 flex-1">{report.desc}</p>

            <button
              onClick={() => handleGenerate(report.id)}
              disabled={loading}
              className="w-full py-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 font-bold text-xs uppercase tracking-wider rounded border border-slate-200 hover:border-blue-200 transition-all flex items-center justify-center gap-2"
            >
              <Printer size={16} /> Visualizar & Imprimir
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-md border border-blue-100 dark:border-blue-900/30">
        <div className="flex gap-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded h-fit">
            <Printer size={20} />
          </div>
          <div>
            <h4 className="font-bold text-blue-800 dark:text-blue-200 text-sm uppercase mb-1">Como Imprimir ou Salvar em PDF?</h4>
            <p className="text-xs text-blue-600 dark:text-blue-300 mb-2">
              O sistema utiliza a tecnologia nativa do seu navegador para garantir a melhor qualidade.
            </p>
            <ul className="text-xs text-blue-700 dark:text-blue-300 list-disc grid gap-1 pl-4">
              <li>Clique em "Visualizar & Imprimir" no relatório desejado.</li>
              <li>Na tela de visualização, clique no botão azul "Imprimir / Salvar PDF".</li>
              <li>Na janela que abrir, em "Destino", escolha sua impressora ou a opção <strong>"Salvar como PDF"</strong>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
