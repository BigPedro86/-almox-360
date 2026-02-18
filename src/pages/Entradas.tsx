import React, { useState } from 'react';
import { ArrowDownCircle, Plus, Search, FileText, X, Save, Calendar, Tag, History, Package, Trash2, Eye } from 'lucide-react';
import { useReceipts } from '../hooks/useReceipts';
import { useItems } from '../hooks/useItems';

const Entradas: React.FC = () => {
  const { receipts, createReceipt, loading } = useReceipts();
  const { items, updateItem, fetchItems } = useItems();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    doc: '',
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    itemSku: '',
    lot: '',
    qty: 0,
    unit: 'UN',
    expiry: '',
    totalValue: 0,
    unitCost: 0
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedItem = items.find(i => i.code === formData.itemSku);

      if (selectedItem) {
        // Ensure values are numbers before adding
        const currentStock = Number(selectedItem.currentStock || 0);
        const qtyToAdd = Number(formData.qty);

        const newStock = currentStock + qtyToAdd;

        console.log(`Updating Stock for ${selectedItem.code}: ${currentStock} + ${qtyToAdd} = ${newStock}`);

        await updateItem(selectedItem.id, { currentStock: newStock });
        await fetchItems(); // Force refresh local state
      } else {
        console.warn("Item not found:", formData.itemSku); // Should not happen if selected from list
      }

      await createReceipt({
        doc: formData.doc,
        supplier: formData.supplier,
        date: formData.date,
        items: formData.qty,
        itemSku: selectedItem ? selectedItem.description : formData.itemSku,
        status: 'CONCLUÍDO',
        // Store extra details for viewing
        lot: formData.lot,
        unit: formData.unit,
        expiry: formData.expiry,
        originalSku: formData.itemSku,
        totalValue: formData.totalValue,
        unitCost: formData.unitCost
      } as any);

      setIsModalOpen(false);
      setFormData({ doc: '', supplier: '', date: new Date().toISOString().split('T')[0], itemSku: '', lot: '', qty: 0, unit: 'UN', expiry: '', totalValue: 0, unitCost: 0 });
    } catch (err) {
      alert("Erro ao salvar entrada");
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <ArrowDownCircle size={20} className="text-slate-500" />
          Entradas de Nota Fiscal
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar NF, Fornecedor..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-all font-semibold text-sm shadow-sm"
          >
            <Plus size={16} />
            Nova Entrada
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase text-xs font-bold border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Documento</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Fornecedor</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Data Receb.</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600 text-center">Itens</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600 text-center">Status</th>
                <th className="px-4 py-3 text-center w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {receipts.map((entry, idx) => (
                <tr key={entry.id} className={`${idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}>
                  <td className="px-4 py-2 font-mono font-bold text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700">
                    {entry.doc}
                  </td>
                  <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-700 font-medium">
                    {entry.supplier}
                  </td>
                  <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-700">
                    {entry.date}
                  </td>
                  <td className="px-4 py-2 text-center border-r border-slate-200 dark:border-slate-700">
                    {entry.items}
                  </td>
                  <td className="px-4 py-2 text-center border-r border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase bg-emerald-100 text-emerald-700 border-emerald-200">
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => setViewingReceipt(entry)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-blue-600 transition-colors"
                        title="Ver Detalhes"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {receipts.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">Nenhum registro encontrado.</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Package size={18} className="text-slate-500" />
                Registrar Nota Fiscal
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Número da NF-e</label>
                  <input required value={formData.doc} onChange={e => setFormData({ ...formData, doc: e.target.value })} placeholder="000.000.000" className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Fornecedor Credenciado</label>
                  <input required value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} placeholder="Razão Social" className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Valor Total da Nota (R$)</label>
                  <input type="number" step="0.01" min="0" required value={formData.totalValue} onChange={e => setFormData({ ...formData, totalValue: Number(e.target.value) })} placeholder="0,00" className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Data de Emissão/Entrada</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                </div>

                <div className="md:col-span-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                  <h4 className="text-xs font-bold text-blue-600 uppercase mb-4 flex items-center gap-2">
                    <Tag size={14} /> Detalhes do Item Loteado
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Selecione o Item (SKU)</label>
                      <select required value={formData.itemSku} onChange={e => setFormData({ ...formData, itemSku: e.target.value })} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm">
                        <option value="">Selecione...</option>
                        {items.map(item => (
                          <option key={item.id} value={item.code}>
                            {item.code} - {item.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Lote (Fabricante)</label>
                      <input required value={formData.lot} onChange={e => setFormData({ ...formData, lot: e.target.value })} placeholder="L-2024-XXXX" className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Validade</label>
                      <input type="date" required value={formData.expiry} onChange={e => setFormData({ ...formData, expiry: e.target.value })} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 col-span-2 sm:col-span-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Quantidade</label>
                        <input type="number" required value={formData.qty} onChange={e => setFormData({ ...formData, qty: Number(e.target.value) })} placeholder="0" className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Valor Unitário (R$)</label>
                        <input type="number" step="0.01" min="0" required value={formData.unitCost} onChange={e => setFormData({ ...formData, unitCost: Number(e.target.value) })} placeholder="0,00" className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-semibold transition-colors">Cancelar</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-sm disabled:opacity-50">
                  <Save size={16} />
                  {loading ? 'Processando...' : 'Confirmar Entrada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingReceipt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-slate-500" />
                Detalhes da Entrada
              </h3>
              <button onClick={() => setViewingReceipt(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Documento</label>
                  <p className="font-mono text-slate-800 dark:text-slate-200">{viewingReceipt.doc}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fornecedor</label>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{viewingReceipt.supplier}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
                  <p className="text-slate-800 dark:text-slate-200">{viewingReceipt.date}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-100 text-emerald-700">
                    {viewingReceipt.status}
                  </span>
                </div>
              </div>

              <div className="md:col-span-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                <h4 className="text-xs font-bold text-blue-600 uppercase mb-4 flex items-center gap-2">
                  <Tag size={14} /> Item Recebido
                </h4>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md border border-slate-100 dark:border-slate-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Produto / SKU</label>
                      <p className="font-bold text-slate-700 dark:text-slate-200 text-lg">
                        {viewingReceipt.itemSku || viewingReceipt.originalSku || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Lote</label>
                      <p className="text-slate-700 dark:text-slate-300">{viewingReceipt.lot || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Unidade</label>
                      <p className="text-slate-700 dark:text-slate-300">{viewingReceipt.unit || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Quantidade</label>
                      <p className="text-slate-700 dark:text-slate-300 font-bold">{viewingReceipt.items}</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Validade</label>
                      <p className="text-slate-700 dark:text-slate-300">{viewingReceipt.expiry || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Valor Total (NF)</label>
                      <p className="text-slate-700 dark:text-slate-300 font-mono">
                        {viewingReceipt.totalValue ? `R$ ${Number(viewingReceipt.totalValue).toFixed(2)}` : '-'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Valor Unitário</label>
                      <p className="text-slate-700 dark:text-slate-300 font-mono">
                        {viewingReceipt.unitCost ? `R$ ${Number(viewingReceipt.unitCost).toFixed(2)}` : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button onClick={() => setViewingReceipt(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-semibold transition-colors">
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Entradas;
