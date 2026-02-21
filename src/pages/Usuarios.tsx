import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, X, Save, Search, Trash2, Edit2 } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { User, UserRole } from '../types';

const Usuarios: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const initialFormState = {
    name: '',
    login: '',
    role: UserRole.REQUISITANTE,
    password: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchUsers = async () => {
    setFetching(true);
    try {
      const data = await apiClient.users.getAll();
      setUsers(data || []);
    } catch (err: any) {
      console.error("Failed to fetch users", err);
      alert("Erro ao carregar lista de usuários: " + (err.message || "Verifique a conexão ou as permissões no Supabase."));
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.login?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        login: user.login,
        role: user.role,
        password: '' // Don't show password
      });
    } else {
      setEditingUser(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingUser) {
        // Only send what changed or valid profile fields
        await apiClient.users.update(editingUser.id, {
          name: formData.name,
          role: formData.role,
          password: formData.password || undefined // Only send if not empty
        });
      } else {
        await apiClient.auth.register({
          login: formData.login,
          password: formData.password,
          name: formData.name,
          role: formData.role
        });
      }
      await fetchUsers();
      setIsModalOpen(false);
    } catch (err: any) {
      alert("Erro ao salvar: " + (err.message || "Erro inesperado. Verifique os campos."));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (!window.confirm(`Deseja ${currentStatus ? 'desativar' : 'ativar'} este usuário?`)) return;
    try {
      await apiClient.users.update(id, { active: !currentStatus });
      await fetchUsers();
    } catch (err: any) {
      alert("Erro ao mudar status: " + (err.message || "Erro de permissão."));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("ATENÇÃO: Isso removerá o PERFIL do usuário do sistema. Você tem certeza?")) return;
    try {
      await apiClient.users.delete(id);
      await fetchUsers();
    } catch (err: any) {
      alert("Erro ao remover: " + (err.message || "Verifique se o usuário possui vínculos ou se você é MASTER."));
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Users size={20} className="text-slate-500" />
          Controle de Acesso e Usuários
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar Usuário..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-all font-semibold text-sm shadow-sm"
          >
            <UserPlus size={16} />
            Novo Usuário
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase text-xs font-bold border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Nome / Login</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">Perfil (Role)</th>
                <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-600 text-center">Status</th>
                <th className="px-4 py-3 text-center w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {fetching ? (
                <tr><td colSpan={4} className="p-10 text-center text-slate-500">Carregando...</td></tr>
              ) : filteredUsers.map((u, idx) => (
                <tr key={u.id} className={`${idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}>
                  <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-700 dark:text-slate-200">{u.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{u.login}</div>
                  </td>
                  <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-700">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center border-r border-slate-200 dark:border-slate-700">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${u.active ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                      {u.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => handleOpenModal(u)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-blue-600 transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u.id, u.active)}
                        className={`p-1.5 rounded transition-all ${u.active ? 'text-slate-400 hover:text-emerald-600' : 'text-slate-400 hover:text-blue-600'}`}
                        title={u.active ? "Desativar" : "Ativar"}
                      >
                        <Shield size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-all"
                        title="Remover"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && !fetching && (
            <div className="p-8 text-center text-slate-400 text-sm">Nenhum usuário encontrado.</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Nome Completo</label>
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" placeholder="Ex: Roberto Silva" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Login / E-mail</label>
                <input required value={formData.login} onChange={e => setFormData({ ...formData, login: e.target.value })} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" placeholder="roberto@empresa.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Perfil de Acesso (RBAC)</label>
                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as any })} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm">
                  <option value={UserRole.REQUISITANTE}>REQUISITANTE</option>
                  <option value={UserRole.APROVADOR}>APROVADOR</option>
                  <option value={UserRole.ALMOXARIFE}>ALMOXARIFE</option>
                  <option value={UserRole.AUDITOR}>AUDITOR</option>
                  <option value={UserRole.MASTER}>MASTER</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Senha {editingUser && '(Deixe em branco para manter)'}</label>
                <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm" placeholder="••••••••" />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-semibold transition-colors">Cancelar</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-sm disabled:opacity-50">
                  <Save size={16} />
                  {loading ? 'Processando...' : (editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
