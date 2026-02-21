import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Requisition, RequisitionStatus, RequisitionItem } from '../../types';
import { supabase } from '../../services/supabase';

interface CreateRequisitionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: Partial<Requisition>) => Promise<void>;
}

interface DBItem {
    id: string;
    description: string;
    unit: string;
    current_stock: number;
}

const CreateRequisitionModal: React.FC<CreateRequisitionModalProps> = ({ isOpen, onClose, onCreate }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        sector: '',
        priority: 'MEDIA',
        observations: ''
    });

    // Item selection states
    const [availableItems, setAvailableItems] = useState<DBItem[]>([]);
    const [addedItems, setAddedItems] = useState<RequisitionItem[]>([]);
    const [selectedItemId, setSelectedItemId] = useState('');
    const [quantity, setQuantity] = useState<number>(1);
    const [itemsLoading, setItemsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchItems();
            setAddedItems([]);
            setSelectedItemId('');
            setQuantity(1);
            setFormData({ sector: '', priority: 'MEDIA', observations: '' });
        }
    }, [isOpen]);

    const fetchItems = async () => {
        setItemsLoading(true);
        try {
            const { data, error } = await supabase
                .from('items')
                .select('id, description, unit, current_stock')
                .eq('active', true)
                .order('description');

            if (error) throw error;
            if (data) setAvailableItems(data);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setItemsLoading(false);
        }
    };

    const handleAddItem = () => {
        if (!selectedItemId || quantity <= 0) return;

        const item = availableItems.find(i => i.id === selectedItemId);
        if (!item) return;

        // Stock validation
        if (item.current_stock <= 0) {
            alert(`O item "${item.description}" está sem estoque.`);
            return;
        }

        if (quantity > item.current_stock) {
            alert(`Quantidade solicitada (${quantity}) excede o estoque disponível (${item.current_stock}).`);
            return;
        }

        const newItem: RequisitionItem = {
            itemId: item.id,
            description: item.description,
            unit: item.unit,
            requestedQty: quantity,
            fulfilledQty: 0
        };

        setAddedItems([...addedItems, newItem]);
        setSelectedItemId('');
        setQuantity(1);
    };

    const handleRemoveItem = (index: number) => {
        setAddedItems(addedItems.filter((_, i) => i !== index));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (addedItems.length === 0) {
            alert("Adicione pelo menos um item à requisição.");
            return;
        }

        setLoading(true);
        try {
            const newReq: Requisition = {
                id: Math.random().toString(), // Will be replaced by DB ID usually, but keeping existing logic
                number: String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
                year: new Date().getFullYear(),
                sector: formData.sector,
                requesterId: user.id,
                requesterName: user.name,
                date: new Date().toISOString().split('T')[0],
                priority: formData.priority as any,
                status: 'APROVADO' as any,
                items: addedItems,
                observations: formData.observations,
                timeline: [{ status: 'APROVADO' as any, userId: user.id, userName: user.name, timestamp: new Date().toISOString() }]
            };

            await onCreate(newReq);
            onClose();
        } catch (error) {
            console.error("Failed to create requisition", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const selectedItem = availableItems.find(i => i.id === selectedItemId);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-lg shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 flex-shrink-0">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Criar Requisição</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleCreate} className="p-6 space-y-6 overflow-y-auto flex-grow">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Setor / Centro de Custo</label>
                            <input required value={formData.sector} onChange={e => setFormData({ ...formData, sector: e.target.value })} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all" placeholder="Ex: Financeiro" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Prioridade</label>
                            <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm appearance-none">
                                <option value="BAIXA">BAIXA</option>
                                <option value="MEDIA">MÉDIA</option>
                                <option value="ALTA">ALTA</option>
                                <option value="URGENTE">URGENTE</option>
                            </select>
                        </div>
                    </div>

                    {/* Product Selection Section */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Adicionar Produtos</h4>
                        <div className="flex gap-3 items-end">
                            <div className="flex-grow">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Produto</label>
                                <select
                                    value={selectedItemId}
                                    onChange={e => setSelectedItemId(e.target.value)}
                                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm appearance-none"
                                >
                                    <option value="">Selecione um produto...</option>
                                    {availableItems.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.description} (Estoque: {item.current_stock} {item.unit})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-24">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Qtd.</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={e => setQuantity(Number(e.target.value))}
                                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                disabled={!selectedItemId || (selectedItem && selectedItem.current_stock <= 0)}
                                className="p-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={selectedItem && selectedItem.current_stock <= 0 ? "Sem Estoque" : "Adicionar Item"}
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                        {selectedItem && (
                            <div className="text-xs text-slate-500">
                                Disponível: <span className={selectedItem.current_stock > 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{selectedItem.current_stock} {selectedItem.unit}</span>
                            </div>
                        )}
                    </div>

                    {/* Added Items List */}
                    {addedItems.length > 0 && (
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                                    <tr>
                                        <th className="px-4 py-2">Produto</th>
                                        <th className="px-4 py-2 w-20 text-center">Qtd.</th>
                                        <th className="px-4 py-2 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {addedItems.map((item, index) => (
                                        <tr key={index} className="bg-white dark:bg-slate-900">
                                            <td className="px-4 py-2">{item.description}</td>
                                            <td className="px-4 py-2 text-center">{item.requestedQty} {item.unit}</td>
                                            <td className="px-4 py-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Observações Adicionais</label>
                        <textarea value={formData.observations} onChange={e => setFormData({ ...formData, observations: e.target.value })} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md outline-none min-h-[80px] focus:ring-1 focus:ring-blue-500 text-sm" placeholder="Motivo da solicitação..." />
                    </div>
                </form>
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end gap-3 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-semibold transition-colors">Cancelar</button>
                    <button onClick={handleCreate} disabled={loading || addedItems.length === 0} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md flex items-center gap-2 hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 text-sm">
                        <Save size={16} />
                        Criar Requisição
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateRequisitionModal;
