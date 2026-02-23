import React, { useState } from 'react';
import { useItems } from '../hooks/useItems';
import { Search, Plus, Power, AlertCircle, X, Save, Edit2, History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Item } from '../types';

const Items: React.FC = () => {
  const { items, createItem, updateItem } = useItems();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // State for Editing
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const initialFormState = {
    code: '',
    description: '',
    unit: 'UN',
    category: '',
    minStock: 0,
    maxStock: 0,
    reorderPoint: 0,
    defaultAddress: '',
    price: 0,
    controlLot: false,
    controlExpiry: false
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleOpenModal = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code,
        description: item.description,
        unit: item.unit,
        category: item.category,
        minStock: item.minStock,
        maxStock: item.maxStock,
        reorderPoint: item.reorderPoint || 0,
        defaultAddress: item.defaultAddress || '',
        price: item.price || 0,
        controlLot: item.controlLot || false,
        controlExpiry: item.controlExpiry || false
      });
    } else {
      setEditingItem(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.minStock > formData.maxStock) {
      alert("Estoque mínimo não pode ser maior que o máximo");
      return;
    }

    setLoading(true);
    try {
      if (editingItem) {
        await updateItem(editingItem.id, formData);
      } else {
        await createItem({
          ...formData,
          userId: user?.id,
          userName: user?.name,
          timestamp: new Date().toISOString(),
          active: true,
          currentStock: 0
        } as any);
      }

      setIsModalOpen(false);
      setFormData(initialFormState);
    } catch (err: any) {
      alert("Erro ao salvar item: " + (err.message || "Verifique os dados e tente novamente."));
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(i =>
    i.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Power size={20} className="text-slate-500" />
          Gerenciamento de Materiais
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar SKU, Descrição..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-all font-semibold text-sm shadow-sm"
          >
            <Plus size={16} />
            Novo Material
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase text-xs font-bold border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Código</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Descrição</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600 w-16 text-center">UM</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Família</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600 text-center">Endereço</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600 text-center">Saldo</th>
                <th className="px-4 py-3 text-center w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredItems.map((item, idx) => (
                <tr key={item.id} className={`${idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}>
                  <td className="px-4 py-2 font-mono font-bold text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 text-xs">
                    {item.code}
                  </td>
                  <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-700 font-medium truncate max-w-xs" title={item.description}>
                    {item.description}
                  </td>
                  <td className="px-4 py-2 text-center border-r border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                    {item.unit}
                  </td>
                  <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                    {item.category}
                  </td>
                  <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-700 font-mono text-xs text-center">
                    {item.defaultAddress || '-'}
                  </td>
                  <td className="px-4 py-2 text-center border-r border-slate-200 dark:border-slate-700 font-bold">
                    <span className={`${(item.currentStock || 0) <= item.minStock ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100' : 'text-slate-700 dark:text-slate-300'}`}>
                      {item.currentStock || 0}
                      {(item.currentStock || 0) <= item.minStock && <AlertCircle size={10} className="inline ml-1" />}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-blue-600 transition-colors"
                        title="Editar Cadastro"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-blue-600 transition-colors"
                        title="Ver Histórico"
                      >
                        <History size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">Nenhum item encontrado.</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-lg shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingItem ? `Editando: ${editingItem.code}` : 'Novo Cadastro de Material'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Código (SKU)</label>
                  <input required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm font-mono" placeholder="MAT-001" disabled={!!editingItem} />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Descrição Completa</label>
                  <input required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" placeholder="Ex: Parafuso Sextavado..." />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Categoria / Família</label>
                  <input required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Un. Medida</label>
                  <select value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm">
                    <option value="UN">UN</option>
                    <option value="KG">KG</option>
                    <option value="MT">MT</option>
                    <option value="CX">CX</option>
                    <option value="LT">LT</option>
                  </select>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Endereço Padrão</label>
                  <input value={formData.defaultAddress} onChange={e => setFormData({ ...formData, defaultAddress: e.target.value })} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm font-mono" placeholder="A-01-02" />
                </div>

                <div className="md:col-span-4 grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Estoque Mín.</label>
                    <input type="number" required value={formData.minStock} onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Ponto Pedido</label>
                    <input type="number" required value={formData.reorderPoint} onChange={e => setFormData({ ...formData, reorderPoint: Number(e.target.value) })} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Estoque Máx.</label>
                    <input type="number" required value={formData.maxStock} onChange={e => setFormData({ ...formData, maxStock: Number(e.target.value) })} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                </div>

                <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Valor Unitário (R$)</label>
                    <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div className="flex items-center gap-4 h-full pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.controlLot} onChange={e => setFormData({ ...formData, controlLot: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Controla Lote</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.controlExpiry} onChange={e => setFormData({ ...formData, controlExpiry: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Controla Validade</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-semibold transition-colors">Cancelar</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-sm disabled:opacity-50">
                  <Save size={16} />
                  {loading ? 'Processando...' : (editingItem ? 'Salvar Alterações' : 'Cadastrar SKU')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;
